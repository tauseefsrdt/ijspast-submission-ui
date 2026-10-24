export type UserRole = 'author' | 'editor' | 'reviewer';

export interface User {
  id: string;
  name: string;
  email: string;
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
