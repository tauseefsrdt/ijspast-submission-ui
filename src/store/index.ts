import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import manuscriptReducer from './slices/manuscriptSlice';
import reviewReducer from './slices/reviewSlice';
import reviewerReducer from './slices/reviewerSlice';
import outboxReducer from './slices/outboxSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manuscripts: manuscriptReducer,
    reviews: reviewReducer,
    reviewers: reviewerReducer,
    outbox: outboxReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
