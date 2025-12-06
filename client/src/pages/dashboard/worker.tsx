import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Check, Search, Undo, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import api from '@/lib/axios';
import type { Event } from '@/schemas/event.schema';
import type { Member } from '@/schemas/member.schema';
import { useEventStore } from '@/stores/event.store';
import { useMemberStore } from '@/stores/member.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import { toast } from 'sonner';

import { useEventSelection } from '@/hooks/use-event-selection';

export function WorkerDashboard() {
  const { events, fetchEvents } = useEventStore();
  const { members, fetchMembers } = useMemberStore();
  const { attendance, fetchAttendance, checkIn, undoCheckIn } = useAttendanceStore();
  
  const { 
    selectedEventId, 
    selectedDate, 
    setSelectedDate, 
    handleEventChange 
  } = useEventSelection(events);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, [fetchEvents, fetchMembers]);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendance(selectedEventId, selectedDate);
    }
  }, [selectedEventId, selectedDate, fetchAttendance]);

  const { data: families } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const res = await api.get('/families');
      return res.data;
    },
  });

  const handleCheckIn = async (memberId: string) => {
    try {
      const event = events.find(e => e.id === selectedEventId);
      const dateToUse = event && !event.isRecurring && event.startDate
        ? event.startDate
        : new Date(selectedDate).toISOString();

      await checkIn(selectedEventId, memberId, dateToUse);
      toast.success('Checked in successfully');
    } catch {
      toast.error('Failed to check in');
    }
  };

  const handleUndoCheckIn = async (memberId: string) => {
    try {
      const event = events.find(e => e.id === selectedEventId);
      const dateToUse = event && !event.isRecurring && event.startDate
        ? event.startDate
        : new Date(selectedDate).toISOString();

      await undoCheckIn(selectedEventId, memberId, dateToUse);
      toast.success('Check-in undone');
    } catch {
      toast.error('Failed to undo check-in');
    }
  };

  const isCheckedIn = (memberId: string) => {
    return attendance?.some((a: any) => a.memberId === memberId);
  };

  const filteredMembers = members?.filter((member: Member) => {
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = selectedFamilyId === 'all' || member.familyId === selectedFamilyId;
    return matchesSearch && matchesFamily;
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Worker Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <select
                id="event"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
              >
                <option value="">-- Select Event --</option>
                {events?.map((event: Event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} {event.isRecurring ? '(Recurring)' : (event.startDate ? `(${format(new Date(event.startDate), 'MMM d')})` : '')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              {selectedEventId && events?.find((e: Event) => e.id === selectedEventId && !e.isRecurring) ? (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {(() => {
                    const event = events.find((e: Event) => e.id === selectedEventId);
                    return event?.startDate ? format(new Date(event.startDate), 'PPP') : 'No date set';
                  })()}
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(new Date(selectedDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate ? new Date(selectedDate) : undefined}
                      onSelect={(date) => date && setSelectedDate(date.toISOString())}
                      initialFocus
                      disabled={(date) => {
                        if (!selectedEventId) return false;
                        const event = events?.find((e: Event) => e.id === selectedEventId);
                        if (!event || !event.isRecurring || event.dayOfWeek === undefined || event.dayOfWeek === null) return false;
                        return date.getDay() !== event.dayOfWeek;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {selectedEventId && (() => {
            const selectedEvent = events?.find((e: Event) => e.id === selectedEventId);
            const isDateValid = !selectedEvent?.isRecurring || 
              (new Date(selectedDate).getDay() === selectedEvent.dayOfWeek);

            if (!isDateValid) {
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                  <p className="font-medium">Invalid Date Selection</p>
                  <p className="text-sm mt-1">
                    This is a recurring event on {days[selectedEvent?.dayOfWeek || 0]}s. 
                    Please select a valid date.
                  </p>
                </div>
              );
            }

            return null;
          })()}

          {selectedEventId && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search member by name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <div className="relative">
                    <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm"
                      value={selectedFamilyId}
                      onChange={(e) => setSelectedFamilyId(e.target.value)}
                    >
                      <option value="all">All Families</option>
                      {families?.map((family: any) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                {filteredMembers?.map((member: Member) => {
                  const checkedIn = isCheckedIn(member.id);
                  return (
                    <div key={member.id} className={`flex items-center justify-between p-3 hover:bg-muted/50 ${checkedIn ? 'bg-green-500/10' : ''}`}>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{member.status}</span>
                          {checkedIn && <span className="text-green-500 font-medium flex items-center"><Check className="h-3 w-3 mr-1" /> Checked In</span>}
                        </div>
                      </div>
                      {checkedIn ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUndoCheckIn(member.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Undo className="mr-2 h-4 w-4" />
                          Undo
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(member.id)}
                          disabled={(
                            events?.find((e: Event) => e.id === selectedEventId)?.isRecurring && 
                            new Date(selectedDate).getDay() !== events?.find((e: Event) => e.id === selectedEventId)?.dayOfWeek
                          )}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  );
                })}
                {filteredMembers?.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No members found.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
