import { createSlice } from '@reduxjs/toolkit';
import { ReviewState } from '../../types/review.types';
import { fetchReviewsByManuscript, submitReviewReport } from './reviewThunk';

const initialState: ReviewState = {
  reviews: [],
  isLoading: false,
  error: null,
};

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
      const idx = state.reviews.findIndex(
        (r) =>
          r.id === action.payload.id ||
          (r.reviewerId === action.payload.reviewerId && r.stage === action.payload.stage)
      );
      if (idx >= 0) {
        state.reviews[idx] = action.payload;
      } else {
        state.reviews = [action.payload, ...state.reviews];
      }
    });
    builder.addCase(submitReviewReport.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
