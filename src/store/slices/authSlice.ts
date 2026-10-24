import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, User } from '../../types/auth.types';
import { authService } from '../../services/authService';

const getStoredSession = (): { user: User | null; isAuthenticated: boolean } => {
  try {
    const sessionStr = localStorage.getItem('ijspast_session_v2');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed && parsed.token && parsed.role) {
        return { user: parsed, isAuthenticated: true };
      }
    }
  } catch (e) {
    console.error('Failed to parse cached session:', e);
    localStorage.removeItem('ijspast_session_v2');
  }
  return { user: null, isAuthenticated: false };
};

const cachedSession = getStoredSession();

const initialState: AuthState = {
  user: cachedSession.user,
  isAuthenticated: cachedSession.isAuthenticated,
  isLoading: false,
  isCheckingSession: !!cachedSession.user,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Authentication failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await authService.logout();
  return null;
});

export const checkAuthSession = createAsyncThunk('auth/checkSession', async () => {
  const session = await authService.getCurrentSession();
  return session;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Check Session
    builder.addCase(checkAuthSession.fulfilled, (state, action) => {
      state.isCheckingSession = false;
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(checkAuthSession.rejected, (state) => {
      state.isCheckingSession = false;
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
