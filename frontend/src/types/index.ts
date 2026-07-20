export type UserType = 'Unknown' | 'Admin' | 'User';

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export type CategoryType = 'Undefined' | 'Draft' | 'Published' | 'Unpublished' | 'Archived';
export type ContentStatus = 'Draft' | 'Published' | 'Passive' | 'Archived';

export interface AuthResponse {
  token: string;
  email: string;
  type: UserType;
}

export interface LoginRequest {
  email: string;
  userName?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UserResponse {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: UserType;
  isActive: boolean;
  createdAt: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
}

export interface CategoryCreateRequest {
  name: string;
  type: CategoryType;
}

export interface CategoryUpdateRequest {
  id: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
}

export interface EventResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreateRequest {
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  categoryId: string;
}

export interface EventUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface ParticipantResponse {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  joinedAt: string;
}

export interface EventParticipantsResponse {
  eventId: string;
  count: number;
  isJoined: boolean;
  participants: ParticipantResponse[];
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  createdByUserId: string;
  createdByName: string;
  categoryName: string;
  categoryId: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementCreateRequest {
  title: string;
  content?: string;
  categoryId: string;
}

export interface AnnouncementUpdateRequest {
  id: string;
  title: string;
  content?: string;
  categoryId?: string;
  isActive?: boolean;
}
