import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { UserRole } from '../types/auth.types';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user, isCheckingSession } = useAppSelector((state) => state.auth);

  if (isCheckingSession && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0d3b6e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's appropriate dashboard
    const defaultRoute =
      user.role === 'author'
        ? '/author/dashboard'
        : user.role === 'editor'
        ? '/editor/dashboard'
        : '/reviewer/dashboard';

    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};
