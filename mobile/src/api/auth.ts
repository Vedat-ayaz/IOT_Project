import client from './client';
import { LoginRequest, SignupRequest, AuthResponse } from './types';

// Backend response format
interface BackendAuthResponse {
  token: string;
  type?: string;
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  tokenType?: string;
}

// Transform backend response to app format
const transformAuthResponse = (backendResponse: BackendAuthResponse): AuthResponse => {
  return {
    accessToken: backendResponse.token,
    refreshToken: backendResponse.token, // Backend doesn't have separate refresh token
    tokenType: backendResponse.tokenType || 'Bearer',
    user: {
      id: backendResponse.id,
      email: backendResponse.email,
      name: backendResponse.name,
      surname: '', // Backend doesn't return surname separately
      role: backendResponse.role,
    },
  };
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post<BackendAuthResponse>('/auth/login', credentials);
    return transformAuthResponse(response.data);
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await client.post<BackendAuthResponse>('/auth/register', data);
    return transformAuthResponse(response.data);
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await client.post<BackendAuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return transformAuthResponse(response.data);
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
