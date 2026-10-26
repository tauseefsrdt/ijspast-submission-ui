import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Manuscript } from '../../types/manuscript.types';
import {
  fetchManuscripts,
  fetchAuthorManuscripts,
  fetchReviewerManuscripts,
  fetchPublishedManuscripts,
  fetchManuscriptById,
  submitNewManuscript,
  assignManuscriptReviewer,
  requestManuscriptRevision,
  forwardRevisionThunk,
  enableStage2Thunk,
  submitManuscriptRevision,
  acceptManuscriptThunk,
  rejectManuscriptThunk,
  publishManuscriptThunk,
} from './manuscriptThunk';

export interface ManuscriptState {
  manuscripts: Manuscript[];
  publishedManuscripts: Manuscript[];
  selectedManuscript: Manuscript | null;
  isLoading: boolean;
  error: string | null;
  submissionSuccess: {
    manuscriptId: string;
    generatedCredentials?: { email: string; password: string };
    dispatchedEmail?: any;
    authorName?: string;
    isResubmission?: boolean;
    message?: string;
  } | null;
}

const initialState: ManuscriptState = {
  manuscripts: [],
  publishedManuscripts: [],
  selectedManuscript: null,
  isLoading: false,
  error: null,
  submissionSuccess: null,
};

export const manuscriptSlice = createSlice({
  name: 'manuscripts',
  initialState,
  reducers: {
    clearSubmissionSuccess: (state) => {
      state.submissionSuccess = null;
    },
    setSelectedManuscript: (state, action: PayloadAction<Manuscript | null>) => {
      state.selectedManuscript = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Editor fetch
    builder.addCase(fetchManuscripts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchManuscripts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.manuscripts = action.payload || [];
    });
    builder.addCase(fetchManuscripts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Author fetch
    builder.addCase(fetchAuthorManuscripts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAuthorManuscripts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.manuscripts = action.payload || [];
    });
    builder.addCase(fetchAuthorManuscripts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reviewer fetch
    builder.addCase(fetchReviewerManuscripts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchReviewerManuscripts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.manuscripts = action.payload || [];
    });
    builder.addCase(fetchReviewerManuscripts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Published papers fetch
    builder.addCase(fetchPublishedManuscripts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPublishedManuscripts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.publishedManuscripts = action.payload || [];
    });
    builder.addCase(fetchPublishedManuscripts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch by ID
    builder.addCase(fetchManuscriptById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchManuscriptById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedManuscript = action.payload;
    });
    builder.addCase(fetchManuscriptById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Submit new manuscript
    builder.addCase(submitNewManuscript.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(submitNewManuscript.fulfilled, (state, action) => {
      state.isLoading = false;
      state.submissionSuccess = action.payload;
    });
    builder.addCase(submitNewManuscript.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Mutations that update a single manuscript in state
    const updateSingleManuscript = (state: ManuscriptState, updated: Manuscript) => {
      state.isLoading = false;
      state.selectedManuscript = updated;
      const idx = state.manuscripts.findIndex((m) => m.id === updated.id);
      if (idx !== -1) {
        state.manuscripts[idx] = updated;
      } else {
        state.manuscripts.unshift(updated);
      }
    };

    builder.addCase(assignManuscriptReviewer.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(requestManuscriptRevision.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(forwardRevisionThunk.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(enableStage2Thunk.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(submitManuscriptRevision.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(acceptManuscriptThunk.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(rejectManuscriptThunk.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
    builder.addCase(publishManuscriptThunk.fulfilled, (state, action) => {
      updateSingleManuscript(state, action.payload);
    });
  },
});

export const { clearSubmissionSuccess, setSelectedManuscript } = manuscriptSlice.actions;
export default manuscriptSlice.reducer;
