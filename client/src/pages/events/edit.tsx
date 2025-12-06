import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEvent } from '@/api/events';
import { EventForm } from './components/event-form';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
      <EventForm initialData={event} isEditing />
    </div>
  );
}
