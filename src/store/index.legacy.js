import { configureStore } from '@reduxjs/toolkit';
import journalReducer from './journalSlice';

export const store = configureStore({
  reducer: {
    journal: journalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // allow JSX / components in modal payloads if needed
    }),
});

const STORAGE_KEY = 'ijmar_portal_mock_v4';

store.subscribe(() => {
  try {
    const state = store.getState().journal;
    const { toastMessage, modal, ...persistedState } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (e) {
    console.error('Failed to sync Redux state to localStorage:', e);
  }
});

export default store;
