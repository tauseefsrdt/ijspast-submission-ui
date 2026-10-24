import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ReviewerProfile } from '../../types/user.types';
import { userService } from '../../services/userService';

interface ReviewerState {
  reviewers: ReviewerProfile[];
  isLoading: boolean;
  error: string | null;
  lastCreatedCredentials: { email: string; password: string; name: string } | null;
}

const initialState: ReviewerState = {
  reviewers: [],
  isLoading: false,
  error: null,
  lastCreatedCredentials: null,
};

export const fetchReviewers = createAsyncThunk(
  'reviewers/fetchAll',
  async (params: { search?: string; domain?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      return await userService.getReviewers(p.search, p.domain);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch reviewers');
    }
  }
);

export const createNewReviewer = createAsyncThunk(
  'reviewers/createNew',
  async (
    data: {
      name: string;
      email: string;
      phone?: string;
      institution: string;
      domain: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await userService.createReviewer(data);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to create reviewer account');
    }
  }
);

export const updateExistingReviewer = createAsyncThunk(
  'reviewers/updateExisting',
  async (
    payload: {
      id: string;
      data: {
        name: string;
        email: string;
        phone?: string;
        institution: string;
        department?: string;
        domain: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await userService.updateReviewer(payload.id, payload.data);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to update reviewer');
    }
  }
);

export const deleteExistingReviewer = createAsyncThunk(
  'reviewers/deleteExisting',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteReviewer(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to delete reviewer');
    }
  }
);

export const reviewerSlice = createSlice({
  name: 'reviewers',
  initialState,
  reducers: {
    clearCreatedCredentials: (state) => {
      state.lastCreatedCredentials = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReviewers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchReviewers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reviewers = action.payload || [];
    });
    builder.addCase(fetchReviewers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createNewReviewer.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(createNewReviewer.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload?.reviewer) {
        state.reviewers = [action.payload.reviewer, ...state.reviewers];
      }
      if (action.payload?.credentials) {
        state.lastCreatedCredentials = {
          name: action.payload.reviewer?.name || '',
          email: action.payload.credentials.email,
          password: action.payload.credentials.password,
        };
      }
    });
    builder.addCase(createNewReviewer.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateExistingReviewer.fulfilled, (state, action) => {
      const updated = action.payload;
      if (updated) {
        state.reviewers = state.reviewers.map((r) => (r.id === updated.id ? updated : r));
      }
    });

    builder.addCase(deleteExistingReviewer.fulfilled, (state, action) => {
      const deletedId = action.payload;
      state.reviewers = state.reviewers.filter((r) => r.id !== deletedId);
    });
  },
});

export const { clearCreatedCredentials } = reviewerSlice.actions;
export default reviewerSlice.reducer;
