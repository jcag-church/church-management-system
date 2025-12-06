import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Plus, Trash2, Search, Check, Calendar as CalendarIcon } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from 'sonner';

import type { Event } from '@/schemas/event.schema';
import { useAttendanceStore } from '@/stores/attendance.store';
import { useMemberStore } from '@/stores/member.store';



export default function AttendanceDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Use nullable state for manual overrides
  const [manualYear, setManualYear] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState<string | null>(null);

  // Fetch Event Details
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await api.get<Event>(`/events/${eventId}`);
      return res.data;
    },
    enabled: !!eventId,
  });

  // Fetch Available Dates
  const { data: availableDates } = useQuery({
    queryKey: ['attendance-dates', eventId],
    queryFn: async () => {
      const res = await api.get<string[]>(`/attendance/dates?eventId=${eventId}`);
      return res.data.map(d => new Date(d));
    },
    enabled: !!eventId,
  });

  // Group dates by year
  const datesByYear = availableDates?.reduce((acc, date) => {
    const year = date.getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(date);
    return acc;
  }, {} as Record<string, Date[]>) || {};

  const years = Object.keys(datesByYear).sort((a, b) => b.localeCompare(a));

  // Derived State Logic
  const activeYear = manualYear || years[0] || '';
  
  const activeDateStr = (() => {
    if (manualDate) return manualDate;
    if (event && !event.isRecurring && event.startDate) {
        return new Date(event.startDate).toISOString();
    }
    const datesInYear = datesByYear[activeYear];
    if (datesInYear && datesInYear.length > 0) {
        return datesInYear[0].toISOString();
    }
    return '';
  })();

  const selectedDate = activeDateStr ? new Date(activeDateStr) : undefined;

  const { attendance, isLoading: isLoadingAttendance, fetchAttendance, checkIn, undoCheckIn } = useAttendanceStore();
  const { members, fetchMembers } = useMemberStore();

  useEffect(() => {
    if (members.length === 0) {
      fetchMembers();
    }
  }, [fetchMembers, members.length]);

  useEffect(() => {
    if (eventId && activeDateStr) {
      fetchAttendance(eventId, activeDateStr);
    }
  }, [eventId, activeDateStr, fetchAttendance]);

  const handleCheckIn = async (memberId: string) => {
    if (!activeDateStr || !eventId) return;
    try {
      await checkIn(eventId, memberId, activeDateStr);
      toast.success('Member added to attendance');
      // Invalidate dates query to update counts if we add that later, or just to be safe
      queryClient.invalidateQueries({ queryKey: ['attendance-dates', eventId] });
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleUndoCheckIn = async (memberId: string) => {
    if (!activeDateStr || !eventId) return;
    try {
      await undoCheckIn(eventId, memberId, activeDateStr);
      toast.success('Attendance removed');
      queryClient.invalidateQueries({ queryKey: ['attendance-dates', eventId] });
    } catch {
      toast.error('Failed to remove attendance');
    }
  };

  const filteredMembers = members?.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !attendance?.some(a => a.member.id === member.id)
  );

  if (isLoadingEvent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) return <div>Event not found</div>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground">Attendance Management</p>
        </div>
      </div>





      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {event.isRecurring ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Year:</span>
                <Select value={activeYear} onValueChange={(val) => {
                    setManualYear(val);
                    setManualDate(null); // Reset date when year changes to default to latest
                }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Date:</span>
                <Select value={activeDateStr} onValueChange={setManualDate}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {datesByYear[activeYear]?.map(date => (
                      <SelectItem key={date.toISOString()} value={date.toISOString()}>
                        {format(date, "PPP")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="icon" title="Add New Session">
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (date) {
                            setManualDate(date.toISOString());
                            setManualYear(date.getFullYear().toString());
                            // Optionally add to availableDates or refetch?
                            // For now, selecting it sets it as current, allowing to add attendees.
                            // Once attendees are added, it will appear in the list on refresh.
                        }
                    }}
                    initialFocus
                    disabled={(date) => {
                      if (!event.isRecurring || event.dayOfWeek === undefined || event.dayOfWeek === null) return false;
                      return date.getDay() !== event.dayOfWeek;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <div className="flex items-center border px-3 py-2 rounded-md bg-muted/50">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.startDate && format(new Date(event.startDate), 'PPP')}</span>
            </div>
          )}
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedDate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attendee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Attendee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredMembers?.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md border">
                    <span>{member.firstName} {member.lastName}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCheckIn(member.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filteredMembers?.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">No members found</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingAttendance ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center">
                   <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : attendance?.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.member.firstName} {record.member.lastName}
                </TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this attendance record?')) {
                        handleUndoCheckIn(record.member.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoadingAttendance && attendance?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No attendees found for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
