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
  async (params: { search?: string; domain?: string } = {}, { rejectWithValue }) => {
    try {
      return await userService.getReviewers(params.search, params.domain);
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
  },
});

export const { clearCreatedCredentials } = reviewerSlice.actions;
export default reviewerSlice.reducer;
