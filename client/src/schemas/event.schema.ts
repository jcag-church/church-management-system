import { z } from 'zod';

export const EventType = {
  SERVICE: 'SERVICE',
  PRAYER_MEETING: 'PRAYER_MEETING',
  CELL_GROUP: 'CELL_GROUP',
  FELLOWSHIP: 'FELLOWSHIP',
  OUTREACH: 'OUTREACH',
  SPECIAL: 'SPECIAL',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const RegistrationStatus = {
  REGISTERED: 'REGISTERED',
  ATTENDED: 'ATTENDED',
  CANCELLED: 'CANCELLED',
} as const;

export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  // Allow string input for forms, transform to Date
  startDate: z.union([z.string(), z.date()]).optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.union([z.string(), z.date()]).optional().transform((val) => val ? new Date(val) : undefined),
  isRecurring: z.boolean().default(false),
  dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday
  startTime: z.string().optional(), // "HH:mm"
  location: z.string().optional(),
  type: z.nativeEnum(EventType).default(EventType.SERVICE),
}).refine((data) => {
  if (data.isRecurring) {
    return data.dayOfWeek !== undefined && data.startTime !== undefined;
  }
  return data.startDate !== undefined && data.endDate !== undefined;
}, {
  message: "Recurring events need Day and Time, One-off events need Start and End dates",
  path: ["startDate"], // Attach error to startDate for now
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isRecurring: boolean;
  dayOfWeek?: number;
  startTime?: string;
  location?: string;
  type: EventType;
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}
