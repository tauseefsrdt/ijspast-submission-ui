export interface DispatchedEmail {
  id: string;
  to: string;
  toName: string;
  subject: string;
  type: string;
  manuscriptId: string;
  content: string;
  sentAt: string;
  status: string;
}

export interface OutboxState {
  emails: DispatchedEmail[];
  isLoading: boolean;
  error: string | null;
}
