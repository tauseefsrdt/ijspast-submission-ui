import React, { useEffect } from 'react';
import { useAppDispatch } from './store';
import { checkAuthSession } from './store/slices/authSlice';
import { AllRoutes } from "./utils/AllRoutes";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <>
      <AllRoutes />
    </>
  );
}

export default App;
