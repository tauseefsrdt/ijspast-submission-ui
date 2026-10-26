import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../interceptors/axiosInterceptor';
import { ReviewReport } from '../../types/review.types';

export const fetchReviewsByManuscript = createAsyncThunk(
  'reviews/fetchByManuscript',
  async (manuscriptId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const role = state.auth?.user?.role;
      const endpoint =
        role === 'reviewer'
          ? `/reviewer/assignments/${manuscriptId}/reviews`
          : `/editor/manuscripts/${manuscriptId}/reviews`;

      try {
        const res: any = await axiosInstance.get(endpoint);
        return (res.data || []) as ReviewReport[];
      } catch (e) {
        if (role !== 'reviewer') {
          try {
            const fallbackRes: any = await axiosInstance.get(`/reviewer/assignments/${manuscriptId}/reviews`);
            return (fallbackRes.data || []) as ReviewReport[];
          } catch {
            return [];
          }
        }
        return [];
      }
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
        stage?: number;
        stageName?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.post(`/reviewer/assignments/${payload.manuscriptId}/reviews`, {
        recommendation: payload.report.recommendation,
        technicalQuality: payload.report.technicalQuality,
        originality: payload.report.originality,
        clarity: payload.report.clarity,
        commentsForEditor: payload.report.commentsForEditor,
        commentsForAuthor: payload.report.commentsForAuthor,
        confidentialComments: payload.report.confidentialComments,
        stage: payload.report.stage || 1,
        stageName: payload.report.stageName,
      });
      return res.data as ReviewReport;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Review submission failed');
    }
  }
);

export const getReviewsByManuscriptApi = async (manuscriptId: string, role?: string): Promise<ReviewReport[]> => {
  const endpoint =
    role === 'reviewer'
      ? `/reviewer/assignments/${manuscriptId}/reviews`
      : `/editor/manuscripts/${manuscriptId}/reviews`;
  try {
    const res: any = await axiosInstance.get(endpoint);
    return (res.data || []) as ReviewReport[];
  } catch (e) {
    if (role !== 'reviewer') {
      try {
        const fallbackRes: any = await axiosInstance.get(`/reviewer/assignments/${manuscriptId}/reviews`);
        return (fallbackRes.data || []) as ReviewReport[];
      } catch {
        return [];
      }
    }
    return [];
  }
};

