import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/types';
import { authApi } from '../api/auth';
import { setAccessToken, setRefreshToken, clearTokens, getAccessToken } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      await setAccessToken(response.accessToken);
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      await SecureStore.setItemAsync('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (data: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    try {
      const response = await authApi.signup(data);
      await setAccessToken(response.accessToken);
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      await SecureStore.setItemAsync('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      await clearTokens();
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
