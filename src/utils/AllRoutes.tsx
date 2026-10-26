import React from 'react';
import { useRoutes, Navigate, Outlet, RouteObject } from 'react-router-dom';
import { useAppSelector } from '../store';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleBasedRoute } from '../routes/RoleBasedRoute';

// Page imports
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { ActivateAccountPage } from '../pages/auth/ActivateAccountPage';
import { SubmitManuscriptPage } from '../pages/author/SubmitManuscriptPage';
import { AuthorDashboard } from '../pages/author/AuthorDashboard';
import { AuthorManuscriptDetails } from '../pages/author/AuthorManuscriptDetails';
import { EditorDashboard } from '../pages/editor/EditorDashboard';
import { EditorManuscriptDetails } from '../pages/editor/EditorManuscriptDetails';
import { ReviewersManagementPage } from '../pages/editor/ReviewersManagementPage';
import { OutboxPage } from '../pages/editor/OutboxPage';
import { ReviewerDashboard } from '../pages/reviewer/ReviewerDashboard';
import { ReviewerManuscriptDetails } from '../pages/reviewer/ReviewerManuscriptDetails';
import { PublishedPapersPage } from '../pages/published/PublishedPapersPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage';

/**
 * RootRedirect determines user destination based on authentication status and role
 */
export function RootRedirect() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'author':
      return <Navigate to="/author/dashboard" replace />;
    case 'editor':
      return <Navigate to="/editor/dashboard" replace />;
    case 'reviewer':
      return <Navigate to="/reviewer/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

/**
 * Route Configuration Object Tree following enterprise modular pattern
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      // 1. Root Entry Switchboard
      {
        index: true,
        element: <RootRedirect />,
      },

      // 2. Public Authentication Pages
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
          {
            path: "activate-account",
            element: <ActivateAccountPage />,
          },
        ],
      },

      // 3. Public Standalone Submission Portal
      {
        path: "submit",
        element: <SubmitManuscriptPage />,
      },
      {
        path: "author-submission",
        element: <Navigate to="/submit" replace />,
      },

      // 4. Open Access Archive
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "published",
            element: <PublishedPapersPage />,
          },
        ],
      },

      // 5. Role-Protected Dashboard Workspaces
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              // 5.1 Author Central Routes
              {
                element: <RoleBasedRoute allowedRoles={['author']} />,
                children: [
                  {
                    path: "author/dashboard",
                    element: <AuthorDashboard />,
                  },
                  {
                    path: "author/submit",
                    element: <Navigate to="/submit" replace />,
                  },
                  {
                    path: "author/manuscript/:id",
                    element: <AuthorManuscriptDetails />,
                  },
                ],
              },

              // 5.2 Editorial Office Routes
              {
                element: <RoleBasedRoute allowedRoles={['editor']} />,
                children: [
                  {
                    path: "editor/dashboard",
                    element: <EditorDashboard />,
                  },
                  {
                    path: "editor/manuscript/:id",
                    element: <EditorManuscriptDetails />,
                  },
                  {
                    path: "editor/reviewers",
                    element: <ReviewersManagementPage />,
                  },
                  {
                    path: "editor/outbox",
                    element: <OutboxPage />,
                  },
                ],
              },

              // 5.3 Peer Review Desk Routes
              {
                element: <RoleBasedRoute allowedRoles={['reviewer']} />,
                children: [
                  {
                    path: "reviewer/dashboard",
                    element: <ReviewerDashboard />,
                  },
                  {
                    path: "reviewer/manuscript/:id",
                    element: <ReviewerManuscriptDetails />,
                  },
                ],
              },
            ],
          },
        ],
      },

      // 6. Security and Status Routes
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "404",
        element: <NotFoundPage />,
      },
    ],
  },

  // 7. Global Catch-All Fallback
  {
    path: "/*",
    element: <NotFoundPage />,
  },
];

/**
 * AllRoutes component rendering the route object tree
 */
export const AllRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

export default AllRoutes;
