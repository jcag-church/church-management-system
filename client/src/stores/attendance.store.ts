import { create } from 'zustand';
import api from '@/lib/axios';

interface AttendanceRecord {
  id: string;
  memberId: string;
  eventId: string;
  date: string;
  status: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
}

interface AttendanceStore {
  attendance: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  
  fetchAttendance: (eventId: string, date: string) => Promise<void>;
  checkIn: (eventId: string, memberId: string, date: string) => Promise<void>;
  undoCheckIn: (eventId: string, memberId: string, date: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  attendance: [],
  isLoading: false,
  error: null,

  fetchAttendance: async (eventId, date) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<AttendanceRecord[]>(`/attendance?eventId=${eventId}&date=${date}`);
      set({ attendance: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      set({ error: 'Failed to fetch attendance', isLoading: false });
    }
  },

  checkIn: async (eventId, memberId, date) => {
    // Optimistic update? Or wait for response?
    // Let's wait for response to be safe, or just invalidate/refetch.
    // Ideally we append the new record.
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AttendanceRecord>('/attendance/check-in', { eventId, memberId, date });
      set((state) => ({
        attendance: [...state.attendance, res.data],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to check in:', error);
      set({ error: 'Failed to check in', isLoading: false });
      throw error;
    }
  },

  undoCheckIn: async (eventId, memberId, date) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/attendance/check-in/undo', { eventId, memberId, date });
      set((state) => ({
        attendance: state.attendance.filter((r) => r.memberId !== memberId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to undo check in:', error);
      set({ error: 'Failed to undo check in', isLoading: false });
      throw error;
    }
  },
}));
