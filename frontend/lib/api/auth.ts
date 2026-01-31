import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export const authApi = {
  getCurrentUser: () => apiClient.get<User>('/auth/me'),
  
  logout: () => apiClient.get('/auth/logout'),
  
  initiateGoogleLogin: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/auth/google`;
  },
};
