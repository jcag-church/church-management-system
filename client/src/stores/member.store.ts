import { create } from 'zustand';
import api from '@/lib/axios';
import type { Member } from '@/schemas/member.schema';

interface MemberStore {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  
  fetchMembers: () => Promise<void>;
  addMember: (data: Partial<Member>) => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Member[]>('/members');
      set({ members: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch members:', error);
      set({ error: 'Failed to fetch members', isLoading: false });
    }
  },

  addMember: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Member>('/members', data);
      set((state) => ({ 
        members: [res.data, ...state.members],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add member:', error);
      set({ error: 'Failed to add member', isLoading: false });
      throw error;
    }
  },

  updateMember: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put<Member>(`/members/${id}`, data);
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? res.data : m)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update member:', error);
      set({ error: 'Failed to update member', isLoading: false });
      throw error;
    }
  },

  deleteMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/members/${id}`);
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete member:', error);
      set({ error: 'Failed to delete member', isLoading: false });
      throw error;
    }
  },
}));
