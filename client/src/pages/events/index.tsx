import { useState, useEffect } from 'react';
import { useEventStore } from '@/stores/event.store';
import { Plus, Calendar, MapPin, Clock, Edit, Trash2, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Event } from '@/schemas/event.schema';
import { RegistrationModal } from './components/registration-modal';

export default function EventsPage() {
  const navigate = useNavigate();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { events, isLoading, fetchEvents, deleteEvent } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (isLoading && events.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <div className="flex gap-2 justify-center items-center">
          <Link to="/events/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event: Event) => (
          <Card key={event.id} className="relative pb-16">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>{event.type}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.isRecurring
                      ? `Every ${event.dayOfWeek ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][event.dayOfWeek] : 'Day'}`
                      : event.startDate && format(new Date(event.startDate), 'PPP')
                    }
                  </span>
                </div>
                {event.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.startTime}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-background/80 backdrop-blur-sm rounded-b-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/attendance`)}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Attendance
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event.id}/edit`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(event.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <RegistrationModal
        eventId={selectedEventId}
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setSelectedEventId(null);
        }}
      />
    </div>
  );
}
