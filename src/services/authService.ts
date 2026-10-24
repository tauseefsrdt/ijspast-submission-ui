import { apiClient } from './apiClient';
import { LoginCredentials, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const res: any = await apiClient.post('/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    const { token, user } = res.data;

    // Store token and user in localStorage session
    const sessionData = { ...user, token };
    localStorage.setItem('ijspast_session_v2', JSON.stringify(sessionData));
    return sessionData;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('ijspast_session_v2');
  },

  async getCurrentSession(): Promise<User | null> {
    const sessionStr = localStorage.getItem('ijspast_session_v2');
    if (!sessionStr) return null;
    try {
      const parsed = JSON.parse(sessionStr);
      if (!parsed.token) return null;

      const res: any = await apiClient.get('/auth/me');
      const currentUser = res.data;
      const updatedSession = { ...currentUser, token: parsed.token };
      localStorage.setItem('ijspast_session_v2', JSON.stringify(updatedSession));
      return updatedSession;
    } catch (err) {
      console.warn('Session verification failed, clearing stored session:', err);
      localStorage.removeItem('ijspast_session_v2');
      return null;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email: email.trim() });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token: token.trim(),
      newPassword,
      confirmPassword: newPassword,
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    });
  },
};
