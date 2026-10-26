import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import manuscriptReducer from '../features/manuscripts/manuscriptSlice';
import reviewReducer from '../features/reviews/reviewSlice';
import reviewerReducer from '../features/reviewers/reviewerSlice';
import outboxReducer from '../features/outbox/outboxSlice';

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

export default store;
