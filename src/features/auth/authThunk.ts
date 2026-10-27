import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../interceptors/axiosInterceptor';
import { LoginCredentials, User } from '../../types/auth.types';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      });
      const { token, user } = res.data;
      const sessionData = { ...user, token };
      localStorage.setItem('ijspast_session_v2', JSON.stringify(sessionData));
      return sessionData;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Authentication failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('ijspast_session_v2');
  return null;
});

export const checkAuthSession = createAsyncThunk('auth/checkSession', async () => {
  const sessionStr = localStorage.getItem('ijspast_session_v2');
  if (!sessionStr) return null;
  try {
    const parsed = JSON.parse(sessionStr);
    if (!parsed.token) return null;

    const res: any = await axiosInstance.get('/auth/me');
    const currentUser = res.data;
    const updatedSession = { ...currentUser, token: parsed.token };
    localStorage.setItem('ijspast_session_v2', JSON.stringify(updatedSession));
    return updatedSession;
  } catch (err) {
    console.warn('Session verification failed, clearing stored session:', err);
    localStorage.removeItem('ijspast_session_v2');
    return null;
  }
});

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/forgot-password', { email: email.trim() });
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to dispatch password reset OTP');
    }
  }
);

export const resendOtpThunk = createAsyncThunk(
  'auth/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/resend-otp', { email: email.trim() });
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to resend verification OTP');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      return res.data; // contains { resetToken, email, message }
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (
    payload: { token: string; newPassword: string; confirmPassword?: string; email?: string; otp?: string },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.post('/auth/reset-password', {
        token: payload.token.trim(),
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword || payload.newPassword,
        email: payload.email?.trim(),
        otp: payload.otp?.trim(),
      });
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to reset password');
    }
  }
);

export const activateAccountThunk = createAsyncThunk(
  'auth/activateAccount',
  async ({ token, password }: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/activate-account', {
        token: token.trim(),
        password,
        confirmPassword: password,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to activate account');
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);
