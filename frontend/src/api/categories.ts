import api from './client';
import type { CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest, PagedResponse } from '../types';

export const getCategories = (includeUnactivated = false) =>
  api.get<PagedResponse<CategoryResponse> | CategoryResponse[]>('/Category', { params: { includeUnactivated } })
    .then((r) => ({ ...r, data: Array.isArray(r.data) ? r.data : r.data.items }));

export const getCategory = (id: string, includeUnactivated = false) =>
  api.get<CategoryResponse>(`/Category/${id}`, { params: { includeUnactivated } });

export const createCategory = (data: CategoryCreateRequest) =>
  api.post<CategoryResponse>('/Category', data);

export const updateCategory = (data: CategoryUpdateRequest) =>
  api.put<CategoryResponse>('/Category', data);

export const deactivateCategory = (id: string) =>
  api.patch<CategoryResponse>(`/Category/${id}/deactivate`);

export const deleteCategory = (id: string) =>
  api.delete<boolean>('/Category', { params: { categoryId: id } });
