import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ReviewReport, ReviewState } from '../../types/review.types';
import { reviewService } from '../../services/reviewService';
import { RootState } from '../index';

const initialState: ReviewState = {
  reviews: [],
  isLoading: false,
  error: null,
};

export const fetchReviewsByManuscript = createAsyncThunk(
  'reviews/fetchByManuscript',
  async (manuscriptId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const role = state.auth.user?.role;
      return await reviewService.getReviewsByManuscript(manuscriptId, role);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReviewReport = createAsyncThunk(
  'reviews/submitReport',
  async (
    payload: {
      manuscriptId: string;
      report: {
        recommendation: string;
        technicalQuality: number;
        originality: number;
        clarity: number;
        commentsForEditor: string;
        commentsForAuthor: string;
        confidentialComments?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await reviewService.submitReview(payload.manuscriptId, payload.report);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Review submission failed');
    }
  }
);

export const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReviewsByManuscript.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchReviewsByManuscript.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reviews = action.payload || [];
    });
    builder.addCase(fetchReviewsByManuscript.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(submitReviewReport.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(submitReviewReport.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reviews = [action.payload, ...state.reviews];
    });
    builder.addCase(submitReviewReport.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
