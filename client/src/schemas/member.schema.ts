import { z } from 'zod';

export const MemberStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'VISITOR']);
export const GenderEnum = z.enum(['MALE', 'FEMALE']);

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dob: z.union([z.date(), z.string()]).optional().nullable(), // Allow Date or String
  gender: GenderEnum.optional().nullable(),
  status: MemberStatusEnum.default('VISITOR'),
  photoUrl: z.string().url().optional().or(z.literal('')).nullable(),
  cellGroupId: z.string().uuid().optional().or(z.literal('')).nullable(),
  familyId: z.string().uuid().optional().or(z.literal('')).nullable(),
  ministryIds: z.array(z.string().uuid()).optional().nullable(),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export interface Member extends CreateMemberInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministries?: { id: string; name: string }[];
  cellGroup?: { id: string; name: string };
  family?: { id: string; name: string };
}
