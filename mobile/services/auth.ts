import { api } from './api';

// ============================================================
// Auth Service — Chamadas de autenticação
// ============================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};
