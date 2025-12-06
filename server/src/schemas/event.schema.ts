import { z } from 'zod';
import { EventType, RegistrationStatus } from '@prisma/client';

export const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  isRecurring: z.boolean().default(false),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  location: z.string().optional(),
  type: z.nativeEnum(EventType).default(EventType.SERVICE),
});

export const updateEventSchema = createEventSchema.partial();

export const registerForEventSchema = z.object({
  memberId: z.string().optional(),
  guestName: z.string().optional(),
  status: z.nativeEnum(RegistrationStatus).default(RegistrationStatus.REGISTERED),
}).refine((data) => data.memberId || data.guestName, {
  message: "Either memberId or guestName must be provided",
  path: ["memberId", "guestName"],
});

export const updateRegistrationSchema = z.object({
  status: z.nativeEnum(RegistrationStatus),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
