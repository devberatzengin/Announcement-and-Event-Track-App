import api from './client';
import type { UserResponse, UserUpdateRequest } from '../types';

export const getUsers = () =>
  api.get<UserResponse[]>('/Users');

export const getMe = () =>
  api.get<UserResponse>('/Users/me');

export const getUser = (id: string) =>
  api.get<UserResponse>(`/Users/${id}`);

export const updateUser = (id: string, data: UserUpdateRequest) =>
  api.put<UserResponse>(`/Users/${id}`, data);

export const deactivateUser = (id: string) =>
  api.patch(`/Users/${id}/deactivate`);

export const activateUser = (id: string) =>
  api.patch(`/Users/${id}/activate`);

export const deleteUser = (id: string) =>
  api.delete(`/Users/${id}`);

// NOT: Bu endpoint backend'de henüz yok — sözleşme için README/sohbete bak
export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.post('/Users/me/change-password', data);
