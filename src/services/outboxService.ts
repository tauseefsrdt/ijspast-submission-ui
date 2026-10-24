import { apiClient } from './apiClient';

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

export const outboxService = {
  async getOutbox(type?: string, search?: string): Promise<DispatchedEmail[]> {
    const res: any = await apiClient.get('/editor/outbox', {
      params: { type, search },
    });
    return res.data || [];
  },
};
