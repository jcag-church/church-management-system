import { create } from 'zustand';
import api from '@/lib/axios';
import type { Event } from '@/schemas/event.schema';

interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  
  fetchEvents: () => Promise<void>;
  addEvent: (data: any) => Promise<void>;
  updateEvent: (id: string, data: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Event[]>('/events');
      set({ events: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch events:', error);
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },

  addEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Event>('/events', data);
      set((state) => ({ 
        events: [res.data, ...state.events],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add event:', error);
      set({ error: 'Failed to add event', isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put<Event>(`/events/${id}`, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? res.data : e)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update event:', error);
      set({ error: 'Failed to update event', isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/events/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete event:', error);
      set({ error: 'Failed to delete event', isLoading: false });
      throw error;
    }
  },
}));
