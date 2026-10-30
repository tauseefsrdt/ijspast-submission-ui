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
  phone?: string;
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
  revisionCount?: number;
  status: ManuscriptStatus;
  submissionDate: string;
  updatedAt: string;
  similarityScore?: number;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewer1Date?: string;
  assignedReviewer1Deadline?: string;
  reviewer1Status?: 'Pending' | 'Overdue' | 'Completed' | string;
  reviewer1DaysRemaining?: number;
  reviewer1CanReassign?: boolean;
  reviewer1SubmissionCount?: number;
  reviewer1RoleEnded?: boolean;

  assignedReviewer2Id?: string;
  assignedReviewer2Name?: string;
  assignedReviewer2Date?: string;
  assignedReviewer2Deadline?: string;
  reviewer2Status?: 'Pending' | 'Overdue' | 'Completed' | string;
  reviewer2DaysRemaining?: number;
  reviewer2CanReassign?: boolean;
  reviewer2SubmissionCount?: number;
  reviewer2RoleEnded?: boolean;

  assignedDate?: string;
  reviewDeadline?: string;
  revisionRequestComments?: string;
  editorComments?: string;
  feedbackProgress?: string;
  feedbackReadyCount?: number;
  canAccept?: boolean;
  canReject?: boolean;
  canCommunicate?: boolean;
  communicationExchanges?: number;

  authorRevisionResponse?: string;
  revisionForwardedToReviewer?: boolean;
  stage2EnabledByEditor?: boolean;
  reviewerFeedbackForAuthor?: string;
  reviewerFeedbackForEditor?: string;
  rejectionReason?: string;
  publicationDetails?: PublicationDetails;
  history: StatusHistoryItem[];
}

export interface CommunicationMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole: 'Editor' | 'Author' | string;
  message: string;
  sentAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentSize?: number;
}

export interface CommunicationThread {
  manuscriptId: string;
  totalExchanges: number;
  maxExchanges: number;
  limitReached: boolean;
  canSend: boolean;
  messages: CommunicationMessage[];
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

export interface AuthorTableReviewerBrief {
  id: string;
  name: string;
  email: string;
  institution?: string;
  domain?: string;
  stage1Submitted: boolean;
  stage2Submitted: boolean;
}

export interface AuthorTablePaperItem {
  id: string;
  title: string;
  domain: string;
  status: string;
  submissionDate: string;
  reviewer1?: AuthorTableReviewerBrief;
  reviewer2?: AuthorTableReviewerBrief;
}

export interface AuthorTableItem {
  id: string;
  name: string;
  email: string;
  institution: string;
  department?: string;
  cityCountry: string;
  orcid: string;
  phone?: string;
  totalPapers: number;
  papers: AuthorTablePaperItem[];
}

export interface ReviewerTableAuthorBrief {
  id: string;
  name: string;
  email: string;
  institution: string;
  cityCountry?: string;
  orcid?: string;
}

export interface ReviewerTableCoReviewerBrief {
  id: string;
  name: string;
  email: string;
  institution?: string;
}

export interface ReviewerTablePaperAssignment {
  paperId: string;
  paperTitle: string;
  domain: string;
  status: string;
  assignedRole: 'Reviewer 1' | 'Reviewer 2';
  assignedDate?: string;
  reviewDeadline?: string;
  stage1Completed: boolean;
  stage2Completed: boolean;
  author: ReviewerTableAuthorBrief;
  coReviewer?: ReviewerTableCoReviewerBrief;
}

export interface ReviewerTableItem {
  id: string;
  name: string;
  email: string;
  institution: string;
  department?: string;
  domain: string;
  phone?: string;
  activeAssignmentsCount: number;
  completedReviewsCount: number;
  totalAssignedPapers: number;
  assignedPapers: ReviewerTablePaperAssignment[];
}

