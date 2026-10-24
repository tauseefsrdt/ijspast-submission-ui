import { apiClient } from './apiClient';
import { ReviewerProfile } from '../types/user.types';

export const userService = {
  async getReviewers(search?: string, domain?: string): Promise<ReviewerProfile[]> {
    const res: any = await apiClient.get('/editor/reviewers', {
      params: { search, domain },
    });
    return res.data || [];
  },

  async createReviewer(data: {
    name: string;
    email: string;
    phone?: string;
    institution: string;
    domain: string;
  }): Promise<{ reviewer: ReviewerProfile; credentials: { email: string; password: string } }> {
    const res: any = await apiClient.post('/editor/reviewers', {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim(),
      institution: data.institution.trim(),
      domain: data.domain.trim(),
    });
    return res.data;
  },
};
