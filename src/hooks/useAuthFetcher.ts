import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';

export function useAuthFetcher() {
  const { token, logout } = useAuth();

  const authFetcher = useCallback(async (url: string) => {
    try {
      const data = await apiClient(url);
      return data;
    } catch (error: any) {
      if (error.message.includes('401')) {
        console.log('AuthFetcher: 401 error, logging out.');
        logout();
      }
      throw error; // Re-throw the error for SWR to handle
    }
  }, [token, logout]);

  return authFetcher;
}