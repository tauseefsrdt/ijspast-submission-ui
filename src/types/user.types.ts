import { UserRole } from './auth.types';

export interface ReviewerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  domain: string;
  activeAssignmentsCount: number;
  totalCompletedReviews: number;
}
