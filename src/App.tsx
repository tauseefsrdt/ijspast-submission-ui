import React, { useEffect } from 'react';
import { useAppDispatch } from './store';
import { checkAuthSession } from './store/slices/authSlice';
import { AllRoutes } from "./utils/AllRoutes";
import { ToastProvider } from './context/ToastContext';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <ToastProvider>
      <AllRoutes />
    </ToastProvider>
  );
}

export default App;
