import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { outboxService, DispatchedEmail } from '../../services/outboxService';

interface OutboxState {
  emails: DispatchedEmail[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OutboxState = {
  emails: [],
  isLoading: false,
  error: null,
};

export const fetchOutboxEmails = createAsyncThunk(
  'outbox/fetchAll',
  async (params: { type?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await outboxService.getOutbox(params.type, params.search);
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch outbox logs');
    }
  }
);

export const outboxSlice = createSlice({
  name: 'outbox',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOutboxEmails.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOutboxEmails.fulfilled, (state, action) => {
      state.isLoading = false;
      state.emails = action.payload || [];
    });
    builder.addCase(fetchOutboxEmails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export default outboxSlice.reducer;
