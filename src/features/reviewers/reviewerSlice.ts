import { createSlice } from '@reduxjs/toolkit';
import { ReviewerProfile } from '../../types/user.types';
import {
  fetchReviewers,
  createNewReviewer,
  updateExistingReviewer,
  deleteExistingReviewer,
} from './reviewerThunk';

export interface ReviewerState {
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
