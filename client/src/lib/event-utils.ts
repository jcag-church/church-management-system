import type { Event } from '@/schemas/event.schema';

export const getClosestEventDate = (event: Event): Date => {
  if (event.isRecurring && event.dayOfWeek !== undefined && event.dayOfWeek !== null) {
    const targetDay = event.dayOfWeek;
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate previous occurrence (or today)
    const prevDate = new Date(today);
    // (currentDay - targetDay + 7) % 7 gives days since last occurrence
    prevDate.setDate(today.getDate() - ((currentDay - targetDay + 7) % 7));

    // Calculate next occurrence (or today)
    const nextDate = new Date(today);
    // (targetDay - currentDay + 7) % 7 gives days until next occurrence
    nextDate.setDate(today.getDate() + ((targetDay - currentDay + 7) % 7));

    // Compare diffs to find closest
    const prevDiff = Math.abs(today.getTime() - prevDate.getTime());
    const nextDiff = Math.abs(nextDate.getTime() - today.getTime());

    // If diffs are equal, prefer previous (most recent)
    return (prevDiff <= nextDiff) ? prevDate : nextDate;
  } else if (!event.isRecurring && event.startDate) {
    return new Date(event.startDate);
  }
  
  return new Date();
};
