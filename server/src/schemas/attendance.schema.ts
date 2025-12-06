import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    eventId: z.string().uuid(),
    memberId: z.string().uuid(),
    date: z.string().datetime(), // ISO string
  }),
});

export type CheckInInput = z.infer<typeof checkInSchema>['body'];
