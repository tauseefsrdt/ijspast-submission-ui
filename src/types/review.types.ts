export type ReviewRecommendation =
  | 'Accept'
  | 'Minor Revision'
  | 'Major Revision'
  | 'Reject';

export interface ReviewReport {
  id: string;
  manuscriptId: string;
  reviewerId: string;
  reviewerName: string;
  recommendation: ReviewRecommendation;
  technicalQuality: number; // 1 - 5
  originality: number; // 1 - 5
  clarity: number; // 1 - 5
  commentsForEditor: string;
  commentsForAuthor: string;
  confidentialComments?: string;
  submittedAt: string;
}

export interface ReviewState {
  reviews: ReviewReport[];
  isLoading: boolean;
  error: string | null;
}
