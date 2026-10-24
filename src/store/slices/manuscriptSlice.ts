import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Manuscript,
  ManuscriptSubmissionPayload,
  PublicationDetails,
} from '../../types/manuscript.types';
import { manuscriptService } from '../../services/manuscriptService';
import { reviewService } from '../../services/reviewService';
import { RootState } from '../index';

interface ManuscriptState {
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

// Fetch manuscripts for editor
export const fetchManuscripts = createAsyncThunk(
  'manuscripts/fetchEditorAll',
  async (params: { status?: string; domain?: string; search?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      return await manuscriptService.getEditorManuscripts(p.status, p.domain, p.search);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch editor manuscripts');
    }
  }
);

// Fetch manuscripts for author
export const fetchAuthorManuscripts = createAsyncThunk(
  'manuscripts/fetchAuthorAll',
  async (params: { status?: string; search?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      return await manuscriptService.getAuthorManuscripts(p.status, p.search);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch author manuscripts');
    }
  }
);

// Fetch assigned manuscripts for reviewer
export const fetchReviewerManuscripts = createAsyncThunk(
  'manuscripts/fetchReviewerAll',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewService.getMyAssignments();
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch reviewer assignments');
    }
  }
);

// Fetch public published papers
export const fetchPublishedManuscripts = createAsyncThunk(
  'manuscripts/fetchPublished',
  async (params: { search?: string; domain?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      return await manuscriptService.getPublishedPapers(p.search, p.domain);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch published papers');
    }
  }
);

// Fetch manuscript by ID according to active role
export const fetchManuscriptById = createAsyncThunk(
  'manuscripts/fetchById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const role = state.auth.user?.role;

      if (role === 'author') {
        return await manuscriptService.getAuthorManuscriptById(id);
      } else if (role === 'reviewer') {
        return await reviewService.getAssignmentById(id);
      } else {
        return await manuscriptService.getEditorManuscriptById(id);
      }
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to load manuscript details');
    }
  }
);

// Public / Author manuscript submission
export const submitNewManuscript = createAsyncThunk(
  'manuscripts/submitNew',
  async (
    payload: { formData: ManuscriptSubmissionPayload; currentUserEmail?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await manuscriptService.submitManuscript(payload.formData);
      return response;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Manuscript submission failed');
    }
  }
);

export const assignManuscriptReviewer = createAsyncThunk(
  'manuscripts/assignReviewer',
  async (
    payload: {
      manuscriptId: string;
      reviewerId: string;
      reviewerName: string;
      reviewer2Id?: string;
      reviewer2Name?: string;
      deadlineDays?: number;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.assignReviewer(
        payload.manuscriptId,
        payload.reviewerId,
        payload.reviewerName,
        payload.deadlineDays,
        payload.notes,
        payload.reviewer2Id,
        payload.reviewer2Name
      );
    } catch (e: any) {
      return rejectWithValue(e.message || 'Reviewer assignment failed');
    }
  }
);

export const requestManuscriptRevision = createAsyncThunk(
  'manuscripts/requestRevision',
  async (
    payload: { manuscriptId: string; comments: string; editorName?: string },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.requestRevision(payload.manuscriptId, payload.comments);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Revision request failed');
    }
  }
);

export const forwardRevisionThunk = createAsyncThunk(
  'manuscripts/forwardRevision',
  async (
    payload: {
      manuscriptId: string;
      deadlineDays?: number;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.forwardRevisionToReviewer(payload.manuscriptId, {
        deadlineDays: payload.deadlineDays,
        notes: payload.notes,
      });
    } catch (e: any) {
      return rejectWithValue(e.message || 'Forwarding revision to reviewer failed');
    }
  }
);

export const submitManuscriptRevision = createAsyncThunk(
  'manuscripts/submitRevision',
  async (
    payload: {
      manuscriptId: string;
      response: string;
      file?: { name: string; size: number; type: string };
      authorName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.submitRevision(
        payload.manuscriptId,
        payload.response,
        payload.file
      );
    } catch (e: any) {
      return rejectWithValue(e.message || 'Revision submission failed');
    }
  }
);

export const acceptManuscriptThunk = createAsyncThunk(
  'manuscripts/accept',
  async (
    payload: { manuscriptId: string; editorName?: string; comment?: string },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.acceptManuscript(payload.manuscriptId, payload.comment);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Manuscript acceptance failed');
    }
  }
);

export const rejectManuscriptThunk = createAsyncThunk(
  'manuscripts/reject',
  async (
    payload: { manuscriptId: string; reason: string; editorName?: string },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.rejectManuscript(payload.manuscriptId, payload.reason);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Manuscript rejection failed');
    }
  }
);

export const publishManuscriptThunk = createAsyncThunk(
  'manuscripts/publish',
  async (
    payload: { manuscriptId: string; details: PublicationDetails; editorName?: string },
    { rejectWithValue }
  ) => {
    try {
      return await manuscriptService.publishManuscript(payload.manuscriptId, payload.details);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Manuscript publication failed');
    }
  }
);

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

    // Published fetch
    builder.addCase(fetchPublishedManuscripts.fulfilled, (state, action) => {
      state.publishedManuscripts = action.payload || [];
    });

    // Fetch By ID
    builder.addCase(fetchManuscriptById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchManuscriptById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedManuscript = action.payload;
      const idx = state.manuscripts.findIndex((m) => m.id === action.payload?.id);
      if (idx !== -1 && action.payload) {
        state.manuscripts[idx] = action.payload;
      } else if (action.payload) {
        state.manuscripts.push(action.payload);
      }
    });
    builder.addCase(fetchManuscriptById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Submit New
    builder.addCase(submitNewManuscript.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(submitNewManuscript.fulfilled, (state, action) => {
      state.isLoading = false;
      const resp = action.payload;
      if (resp?.manuscript) {
        state.manuscripts = [resp.manuscript, ...state.manuscripts];
      }
      state.submissionSuccess = {
        manuscriptId: resp?.manuscriptId || resp?.manuscript?.id,
        generatedCredentials: resp?.generatedCredentials,
        dispatchedEmail: resp?.dispatchedEmail,
        authorName: resp?.authorName,
        isResubmission: resp?.isResubmission,
        message: resp?.message,
      };
    });
    builder.addCase(submitNewManuscript.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Updates handler (assign, revisions, decisions)
    const updateHandler = (state: ManuscriptState, action: PayloadAction<Manuscript>) => {
      state.isLoading = false;
      const updated = action.payload;
      if (!updated) return;
      const index = state.manuscripts.findIndex((m) => m.id === updated.id);
      if (index !== -1) {
        state.manuscripts[index] = updated;
      } else {
        state.manuscripts.unshift(updated);
      }
      if (state.selectedManuscript?.id === updated.id) {
        state.selectedManuscript = updated;
      }
    };

    builder.addCase(assignManuscriptReviewer.fulfilled, updateHandler);
    builder.addCase(forwardRevisionThunk.fulfilled, updateHandler);
    builder.addCase(requestManuscriptRevision.fulfilled, updateHandler);
    builder.addCase(submitManuscriptRevision.fulfilled, updateHandler);
    builder.addCase(acceptManuscriptThunk.fulfilled, updateHandler);
    builder.addCase(rejectManuscriptThunk.fulfilled, updateHandler);
    builder.addCase(publishManuscriptThunk.fulfilled, updateHandler);
  },
});

export const { clearSubmissionSuccess, setSelectedManuscript } = manuscriptSlice.actions;
export default manuscriptSlice.reducer;
