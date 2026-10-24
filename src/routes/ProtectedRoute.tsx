import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isCheckingSession } = useAppSelector((state) => state.auth);

  if (isCheckingSession && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0d3b6e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
