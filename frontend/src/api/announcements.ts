import api from './client';
import type { AnnouncementResponse, AnnouncementCreateRequest, AnnouncementUpdateRequest, PagedResponse } from '../types';

export interface AnnouncementListParams {
  search?: string;
  status?: string;
  categoryId?: string;
}

export const getAnnouncements = (includeUnactivated = false, listParams: AnnouncementListParams = {}) =>
  api.get<PagedResponse<AnnouncementResponse> | AnnouncementResponse[]>('/Announcement', {
    params: { includeUnactivated, ...listParams },
  }).then((r) => ({ ...r, data: Array.isArray(r.data) ? r.data : r.data.items }));

export const getAnnouncement = (id: string) =>
  api.get<AnnouncementResponse>(`/Announcement/${id}`);

export const createAnnouncement = (data: AnnouncementCreateRequest) =>
  api.post<AnnouncementResponse>('/Announcement', data);

export const updateAnnouncement = (id: string, data: AnnouncementUpdateRequest) =>
  api.put<AnnouncementResponse>(`/Announcement/${id}`, data);

export const publishAnnouncement = (id: string) =>
  api.patch<AnnouncementResponse>(`/Announcement/${id}/publish`);

export const unpublishAnnouncement = (id: string) =>
  api.patch<AnnouncementResponse>(`/Announcement/${id}/unpublish`);

export const archiveAnnouncement = (id: string) =>
  api.patch<boolean>(`/Announcement/${id}/archive`);
