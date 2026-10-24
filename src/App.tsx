import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './store';
import { checkAuthSession } from './store/slices/authSlice';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { SubmitManuscriptPage } from './pages/author/SubmitManuscriptPage';
import { AuthorManuscriptDetails } from './pages/author/AuthorManuscriptDetails';
import { EditorDashboard } from './pages/editor/EditorDashboard';
import { EditorManuscriptDetails } from './pages/editor/EditorManuscriptDetails';
import { ReviewersManagementPage } from './pages/editor/ReviewersManagementPage';
import { OutboxPage } from './pages/editor/OutboxPage';
import { ReviewerDashboard } from './pages/reviewer/ReviewerDashboard';
import { ReviewerManuscriptDetails } from './pages/reviewer/ReviewerManuscriptDetails';
import { PublishedPapersPage } from './pages/published/PublishedPapersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleBasedRoute } from './routes/RoleBasedRoute';

function RootRedirect() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'author') return <Navigate to="/author/dashboard" replace />;
  if (user.role === 'editor') return <Navigate to="/editor/dashboard" replace />;
  if (user.role === 'reviewer') return <Navigate to="/reviewer/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Default Entry Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Authentication Route */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Public Standalone Manuscript Submission Portal (No login required) */}
        <Route path="/submit" element={<SubmitManuscriptPage />} />
        <Route path="/author-submission" element={<SubmitManuscriptPage />} />

        {/* Open Access Archive (Accessible inside Dashboard layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/published" element={<PublishedPapersPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Author Routes */}
            <Route element={<RoleBasedRoute allowedRoles={['author']} />}>
              <Route path="/author/dashboard" element={<AuthorDashboard />} />
              <Route path="/author/submit" element={<Navigate to="/submit" replace />} />
              <Route path="/author/manuscript/:id" element={<AuthorManuscriptDetails />} />
            </Route>

            {/* Editor Routes */}
            <Route element={<RoleBasedRoute allowedRoles={['editor']} />}>
              <Route path="/editor/dashboard" element={<EditorDashboard />} />
              <Route path="/editor/manuscript/:id" element={<EditorManuscriptDetails />} />
              <Route path="/editor/reviewers" element={<ReviewersManagementPage />} />
              <Route path="/editor/outbox" element={<OutboxPage />} />
            </Route>

            {/* Reviewer Routes */}
            <Route element={<RoleBasedRoute allowedRoles={['reviewer']} />}>
              <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
              <Route path="/reviewer/manuscript/:id" element={<ReviewerManuscriptDetails />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
