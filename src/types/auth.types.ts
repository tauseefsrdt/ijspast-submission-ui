export type UserRole = 'author' | 'editor' | 'reviewer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  institution?: string;
  department?: string;
  domain?: string; // For reviewers
  avatar?: string;
  createdAt: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  email: string;
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword?: string;
  email?: string;
  otp?: string;
}

export interface ResendOtpPayload {
  email: string;
}
