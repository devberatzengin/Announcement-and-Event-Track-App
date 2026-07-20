import api from './client';
import type { EventParticipantsResponse } from '../types';

// suppressToast: backend hazır olmadığında 404'ler sessizce yutulur
export const getEventParticipants = (eventId: string) =>
  api.get<EventParticipantsResponse>(`/Event/${eventId}/participants`, { suppressToast: true } as object);

export const joinEvent = (eventId: string) =>
  api.post<EventParticipantsResponse>(`/Event/${eventId}/join`);

export const leaveEvent = (eventId: string) =>
  api.delete<EventParticipantsResponse>(`/Event/${eventId}/leave`);
