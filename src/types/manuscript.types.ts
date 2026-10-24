export type ManuscriptStatus =
  | 'Draft'
  | 'Submitted'
  | 'Editor Assessment'
  | 'Reviewer Assigned'
  | 'Under Review'
  | 'Review Completed'
  | 'Revision Requested'
  | 'Revision Submitted'
  | 'Accepted'
  | 'Rejected'
  | 'Published';

export interface AuthorInfo {
  name: string;
  email: string;
  institution: string;
  department?: string;
  cityCountry: string;
  orcid?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
  version?: number;
}

export interface StatusHistoryItem {
  id: string;
  status: ManuscriptStatus;
  date: string;
  actor: string;
  role: 'Author' | 'Editor' | 'Reviewer' | 'System';
  comment?: string;
}

export interface PublicationDetails {
  doi: string;
  volume: string;
  issue: string;
  publishedDate: string;
  pages?: string;
}

export interface Manuscript {
  id: string;
  title: string;
  domain: string;
  abstract: string;
  keywords: string[];
  author: AuthorInfo;
  coauthors?: string;
  file: UploadedFile;
  revisedFiles?: UploadedFile[];
  status: ManuscriptStatus;
  submissionDate: string;
  updatedAt: string;
  similarityScore?: number;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedDate?: string;
  reviewDeadline?: string;
  revisionRequestComments?: string;
  authorRevisionResponse?: string;
  reviewerFeedbackForAuthor?: string;
  reviewerFeedbackForEditor?: string;
  rejectionReason?: string;
  publicationDetails?: PublicationDetails;
  history: StatusHistoryItem[];
}

export interface ManuscriptSubmissionPayload {
  author: AuthorInfo;
  title: string;
  domain: string;
  abstract: string;
  keywords: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  coauthors?: string;
  declaration: boolean;
}
