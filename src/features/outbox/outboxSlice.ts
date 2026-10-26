import { createSlice } from '@reduxjs/toolkit';
import { OutboxState } from '../../types/outbox.types';
import { fetchOutboxEmails } from './outboxThunk';

const initialState: OutboxState = {
  emails: [],
  isLoading: false,
  error: null,
};

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
