import { EventForm } from './components/event-form';

export default function NewEventPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
      <EventForm />
    </div>
  );
}
