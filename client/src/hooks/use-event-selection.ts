import { useState } from 'react';
import type { Event } from '@/schemas/event.schema';
import { getClosestEventDate } from '@/lib/event-utils';

export function useEventSelection(events: Event[] = []) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    if (!eventId) return;

    const event = events.find((e) => e.id === eventId);
    if (event) {
      const closestDate = getClosestEventDate(event);
      setSelectedDate(closestDate.toISOString());
    }
  };

  return {
    selectedEventId,
    setSelectedEventId,
    selectedDate,
    setSelectedDate,
    handleEventChange,
  };
}
