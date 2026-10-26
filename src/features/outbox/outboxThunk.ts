import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../interceptors/axiosInterceptor';
import { DispatchedEmail } from '../../types/outbox.types';

export const fetchOutboxEmails = createAsyncThunk(
  'outbox/fetchAll',
  async (params: { type?: string; search?: string } | void, { rejectWithValue }) => {
    try {
      const p = params || {};
      const res: any = await axiosInstance.get('/editor/outbox', {
        params: { type: p.type, search: p.search },
      });
      return (res.data || []) as DispatchedEmail[];
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch outbox logs');
    }
  }
);
