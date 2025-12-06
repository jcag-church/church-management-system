import api from '@/lib/axios';
import type { CreateMemberInput, UpdateMemberInput, Member } from '../schemas/member.schema';

export const getMembers = async (): Promise<Member[]> => {
  const response = await api.get('/members');
  return response.data;
};

export const getMemberById = async (id: string): Promise<Member> => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const createMember = async (data: CreateMemberInput): Promise<Member> => {
  const response = await api.post('/members', data);
  return response.data;
};

export const updateMember = async (id: string, data: UpdateMemberInput): Promise<Member> => {
  const response = await api.put(`/members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/members/${id}`);
};
