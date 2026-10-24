import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { UserRole } from '../types/auth.types';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAppSelector((state) => state.auth);

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
