import api from '@/lib/axios';
import type { CreateEventInput, UpdateEventInput, Event } from '../schemas/event.schema';

export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get('/events');
  return response.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data: CreateEventInput): Promise<Event> => {
  const response = await api.post('/events', data);
  return response.data;
};

export const updateEvent = async (id: string, data: UpdateEventInput): Promise<Event> => {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const registerMemberToEvent = async (eventId: string, memberId: string): Promise<void> => {
  await api.post(`/events/${eventId}/registrations`, { memberId });
};
