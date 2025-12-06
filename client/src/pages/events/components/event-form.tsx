import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createEventSchema, EventType } from '@/schemas/event.schema';
import type { CreateEventInput, Event } from '@/schemas/event.schema';
import { useEventStore } from '@/stores/event.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EventFormProps {
  initialData?: Event;
  isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const navigate = useNavigate();
  const { addEvent, updateEvent } = useEventStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : undefined,
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : undefined,
        }
      : {
          type: EventType.SERVICE,
          isRecurring: false,
        },
  });

  const isRecurring = watch('isRecurring');

  const onSubmit = async (data: CreateEventInput) => {
    try {
      if (isEditing && initialData) {
        await updateEvent(initialData.id, data);
      } else {
        await addEvent(data);
      }
      navigate('/events');
    } catch (error: any) {
      console.error('Failed to save event:', error);
      alert(`Failed to save event: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input id="name" {...register('name')} placeholder="Sunday Service" />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} placeholder="Weekly gathering" />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            {...register('isRecurring')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isRecurring">Recurring Event</Label>
        </div>
      </div>

      {!isRecurring ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date & Time</Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date & Time</Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate.message as string}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <select
              id="dayOfWeek"
              {...register('dayOfWeek', { valueAsNumber: true })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
            {errors.dayOfWeek && (
              <p className="text-sm text-destructive">{errors.dayOfWeek.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              {...register('startTime')}
            />
            {errors.startTime && (
              <p className="text-sm text-destructive">{errors.startTime.message as string}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} placeholder="Main Sanctuary" />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Event Type</Label>
        <select
          id="type"
          {...register('type')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Object.values(EventType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message as string}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/events')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
