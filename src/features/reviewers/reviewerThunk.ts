import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../interceptors/axiosInterceptor';
import { ReviewerProfile } from '../../types/user.types';

export const fetchReviewers = createAsyncThunk(
  'reviewers/fetchAll',
  async (params: { search?: string; domain?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      const res: any = await axiosInstance.get('/editor/reviewers', {
        params: { search: p.search, domain: p.domain },
      });
      return (res.data || []) as ReviewerProfile[];
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch reviewers');
    }
  }
);

export const createNewReviewer = createAsyncThunk(
  'reviewers/createNew',
  async (
    data: {
      name: string;
      email: string;
      phone?: string;
      institution: string;
      domain: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.post('/editor/reviewers', {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim(),
        institution: data.institution.trim(),
        domain: data.domain.trim(),
      });
      return res.data as { reviewer: ReviewerProfile; credentials: { email: string; password: string } };
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to create reviewer account');
    }
  }
);

export const updateExistingReviewer = createAsyncThunk(
  'reviewers/updateExisting',
  async (
    payload: {
      id: string;
      data: {
        name: string;
        email: string;
        phone?: string;
        institution: string;
        department?: string;
        domain: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await axiosInstance.put(`/editor/reviewers/${payload.id}`, {
        name: payload.data.name.trim(),
        email: payload.data.email.trim(),
        phone: payload.data.phone?.trim(),
        institution: payload.data.institution.trim(),
        department: payload.data.department?.trim(),
        domain: payload.data.domain.trim(),
      });
      return res.data as ReviewerProfile;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to update reviewer');
    }
  }
);

export const deleteExistingReviewer = createAsyncThunk(
  'reviewers/deleteExisting',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/editor/reviewers/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to delete reviewer');
    }
  }
);
