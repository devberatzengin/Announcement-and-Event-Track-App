import api from './client';
import type { EventResponse, EventCreateRequest, EventUpdateRequest, PagedResponse } from '../types';

export interface EventListParams {
  search?: string;
  status?: string;
  categoryId?: string;
}

export const getEvents = (includeUnactivated = false, listParams: EventListParams = {}) =>
  api.get<PagedResponse<EventResponse> | EventResponse[]>('/Event', {
    params: { includeUnactivated, ...listParams },
  }).then((r) => ({ ...r, data: Array.isArray(r.data) ? r.data : r.data.items }));

export const getEvent = (id: string) =>
  api.get<EventResponse>(`/Event/${id}`);

export const createEvent = (data: EventCreateRequest) =>
  api.post<EventResponse>('/Event', data);

export const updateEvent = (id: string, data: EventUpdateRequest) =>
  api.put<EventResponse>(`/Event/${id}`, data);

export const publishEvent = (id: string) =>
  api.patch<EventResponse>(`/Event/${id}/publish`);

export const unpublishEvent = (id: string) =>
  api.patch<EventResponse>(`/Event/${id}/unpublish`);

export const deleteEvent = (id: string) =>
  api.delete<boolean>('/Event', { params: { eventId: id } });
