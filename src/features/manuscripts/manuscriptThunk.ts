import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { axiosInstance, API_BASE_URL } from '../../interceptors/axiosInterceptor';
import {
  Manuscript,
  ManuscriptSubmissionPayload,
  PublicationDetails,
  CommunicationThread,
} from '../../types/manuscript.types';

// Fetch manuscripts for editor
export const fetchManuscripts = createAsyncThunk(
  'manuscripts/fetchEditorAll',
  async (params: { status?: string; domain?: string; search?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      const res: any = await axiosInstance.get('/editor/manuscripts', {
        params: { status: p.status, domain: p.domain, search: p.search },
      });
      return res.data as Manuscript[];
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
      const res: any = await axiosInstance.get('/author/manuscripts', {
        params: { status: p.status, search: p.search },
      });
      return res.data as Manuscript[];
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
      const res: any = await axiosInstance.get('/reviewer/assignments');
      return res.data as Manuscript[];
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
      const res: any = await axiosInstance.get('/manuscripts/published', {
        params: { search: p.search, domain: p.domain },
      });
      return res.data as Manuscript[];
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
      const state = getState() as any;
      const role = state.auth?.user?.role;

      let res: any;
      if (role === 'author') {
        res = await axiosInstance.get(`/author/manuscripts/${id}`);
      } else if (role === 'reviewer') {
        res = await axiosInstance.get(`/reviewer/assignments/${id}`);
      } else {
        res = await axiosInstance.get(`/editor/manuscripts/${id}`);
      }
      return res.data as Manuscript;
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
      const p = payload.formData;
      const res: any = await axiosInstance.post('/manuscripts', {
        author: p.author,
        title: p.title,
        domain: p.domain,
        abstractText: p.abstract,
        keywords:
          typeof p.keywords === 'string'
            ? p.keywords
            : Array.isArray(p.keywords)
            ? (p.keywords as string[]).join(', ')
            : '',
        coauthors: p.coauthors,
        file: p.file,
        declaration: p.declaration ?? true,
      });
      return res.data;
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
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/assign-reviewer`, {
        reviewerId: payload.reviewerId,
        reviewerName: payload.reviewerName,
        reviewer2Id: payload.reviewer2Id,
        reviewer2Name: payload.reviewer2Name,
        deadlineDays: payload.deadlineDays ?? 14,
        notes: payload.notes,
      });
      return res.data as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Reviewer assignment failed');
    }
  }
);

export const requestManuscriptRevision = createAsyncThunk(
  'manuscripts/requestRevision',
  async (
    payload: {
      manuscriptId: string;
      comments: string;
      editorComments?: string;
      editorName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/decision`, {
        decision: 'REQUEST_REVISION',
        comments: payload.comments,
        editorComments: payload.editorComments,
      });
      return (res.data || res) as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Revision request failed');
    }
  }
);

export const reassignReviewerThunk = createAsyncThunk(
  'manuscripts/reassignReviewer',
  async (
    payload: {
      manuscriptId: string;
      slot: number;
      replacementReviewerId: string;
      reason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/reassign-reviewer`, {
        slot: payload.slot,
        replacementReviewerId: payload.replacementReviewerId,
        reason: payload.reason,
      });
      return (res.data || res) as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Reassigning reviewer failed');
    }
  }
);

export const fetchCommunicationsThunk = createAsyncThunk(
  'manuscripts/fetchCommunications',
  async (
    payload: { manuscriptId: string; role?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as any;
      const role = payload.role || state.auth?.user?.role || 'editor';
      const prefix = role === 'author' ? 'author' : 'editor';
      const res: any = await axiosInstance.get(`/${prefix}/manuscripts/${payload.manuscriptId}/communications`);
      return res.data as CommunicationThread;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch communications');
    }
  }
);

export const sendCommunicationThunk = createAsyncThunk(
  'manuscripts/sendCommunication',
  async (
    payload: {
      manuscriptId: string;
      message: string;
      role?: string;
      attachmentName?: string;
      attachmentUrl?: string;
      attachmentSize?: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as any;
      const role = payload.role || state.auth?.user?.role || 'editor';
      const prefix = role === 'author' ? 'author' : 'editor';
      const res: any = await axiosInstance.post(`/${prefix}/manuscripts/${payload.manuscriptId}/communications`, {
        message: payload.message,
        attachmentName: payload.attachmentName,
        attachmentUrl: payload.attachmentUrl,
        attachmentSize: payload.attachmentSize,
      });
      return res.data as CommunicationThread;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to send message');
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
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/forward-revision`, {
        deadlineDays: payload.deadlineDays,
        notes: payload.notes,
      });
      return (res.data || res) as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Forwarding revision to reviewer failed');
    }
  }
);

export const enableStage2Thunk = createAsyncThunk(
  'manuscripts/enableStage2',
  async (manuscriptId: string, { rejectWithValue }) => {
    try {
      const res: any = await axiosInstance.post(`/editor/manuscripts/${manuscriptId}/enable-stage2`);
      return (res.data || res) as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to enable Stage 2 review');
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
      const res: any = await axiosInstance.post(`/author/manuscripts/${payload.manuscriptId}/revision`, {
        response: payload.response,
        file: payload.file || { name: 'revised-manuscript.pdf', size: 1024, type: 'application/pdf' },
      });
      return (res.data || res) as Manuscript;
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
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/decision`, {
        decision: 'ACCEPT',
        comments: payload.comment,
      });
      return (res.data || res) as Manuscript;
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
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/decision`, {
        decision: 'REJECT',
        rejectionReason: payload.reason,
      });
      return (res.data || res) as Manuscript;
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
      const res: any = await axiosInstance.post(`/editor/manuscripts/${payload.manuscriptId}/decision`, {
        decision: 'PUBLISH',
        ...payload.details,
      });
      return (res.data || res) as Manuscript;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Manuscript publication failed');
    }
  }
);

// Binary file download helper function
export const downloadManuscriptFile = async (fileIdOrUrl: string, fileName?: string): Promise<void> => {
  // Build the absolute download URL
  let absoluteUrl: string;
  if (fileIdOrUrl.startsWith('http')) {
    // Already a full URL (e.g. http://localhost:8080/api/v1/files/{id}/download)
    absoluteUrl = fileIdOrUrl;
  } else if (fileIdOrUrl.startsWith('/api/v1')) {
    // Relative path with /api/v1 prefix — prepend the host origin
    absoluteUrl = `${window.location.origin}${fileIdOrUrl}`;
  } else if (fileIdOrUrl.startsWith('/')) {
    // Relative path without prefix — append to API base
    absoluteUrl = `${API_BASE_URL}${fileIdOrUrl}`;
  } else {
    // Plain file ID — build the standard download endpoint
    absoluteUrl = `${API_BASE_URL}/files/${fileIdOrUrl}/download`;
  }

  // Read JWT token from session storage
  let token: string | null = null;
  try {
    const sessionStr = localStorage.getItem('ijspast_session_v2');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      token = session?.token || null;
    }
  } catch {
    // ignore parse errors
  }

  // Use raw axios (not the intercepted instance) so responseType: 'blob' is preserved
  const response = await axios.get(absoluteUrl, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName || 'manuscript-document.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const getAuthorsTable = async (): Promise<any[]> => {
  const res: any = await axiosInstance.get('/editor/authors-table');
  return res.data;
};

export const getReviewersTable = async (): Promise<any[]> => {
  const res: any = await axiosInstance.get('/editor/reviewers-table');
  return res.data;
};

