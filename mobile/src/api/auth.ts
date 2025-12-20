import client from './client';
import { LoginRequest, SignupRequest, AuthResponse } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    // If backend has logout endpoint
    try {
      await client.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
  },
};
