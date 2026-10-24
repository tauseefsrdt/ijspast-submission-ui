import { apiClient } from './apiClient';
import { ReviewReport } from '../types/review.types';
import { Manuscript } from '../types/manuscript.types';

export const reviewService = {
  // Reviewer Assignments (Masked Double-Blind)
  async getMyAssignments(): Promise<Manuscript[]> {
    const res: any = await apiClient.get('/reviewer/assignments');
    return res.data;
  },

  async getAssignmentById(id: string): Promise<Manuscript> {
    const res: any = await apiClient.get(`/reviewer/assignments/${id}`);
    return res.data;
  },

  async submitReview(
    manuscriptId: string,
    report: {
      recommendation: string;
      technicalQuality: number;
      originality: number;
      clarity: number;
      commentsForEditor: string;
      commentsForAuthor: string;
      confidentialComments?: string;
    }
  ): Promise<ReviewReport> {
    const res: any = await apiClient.post(`/reviewer/assignments/${manuscriptId}/reviews`, {
      recommendation: report.recommendation,
      technicalQuality: report.technicalQuality,
      originality: report.originality,
      clarity: report.clarity,
      commentsForEditor: report.commentsForEditor,
      commentsForAuthor: report.commentsForAuthor,
      confidentialComments: report.confidentialComments,
    });
    return res.data;
  },

  // Inspection by Editor or Reviewer
  async getReviewsByManuscript(manuscriptId: string, role?: string): Promise<ReviewReport[]> {
    const endpoint =
      role === 'reviewer'
        ? `/reviewer/assignments/${manuscriptId}/reviews`
        : `/editor/manuscripts/${manuscriptId}/reviews`;
    try {
      const res: any = await apiClient.get(endpoint);
      return res.data || [];
    } catch (e) {
      // Fallback try reviewer endpoint if editor endpoint gives forbidden
      if (role !== 'reviewer') {
        try {
          const fallbackRes: any = await apiClient.get(`/reviewer/assignments/${manuscriptId}/reviews`);
          return fallbackRes.data || [];
        } catch {
          return [];
        }
      }
      return [];
    }
  },
};
