import api from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/Auth/login', data);

export const register = (data: RegisterRequest) =>
  api.post<AuthResponse>('/Auth/register', data);
