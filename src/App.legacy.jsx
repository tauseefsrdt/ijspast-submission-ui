import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { ManuscriptsPage } from './pages/ManuscriptsPage';
import { ManuscriptDetailPage } from './pages/ManuscriptDetailPage';
import { NewSubmissionPage } from './pages/NewSubmissionPage';
import { ReviewersPage } from './pages/ReviewersPage';
import { ReviewDeskPage } from './pages/ReviewDeskPage';
import { ApcBillingPage } from './pages/ApcBillingPage';
import { PublishedPapersPage } from './pages/PublishedPapersPage';
import { SettingsPage } from './pages/SettingsPage';
import { OutboxPage } from './pages/OutboxPage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="manuscripts" element={<ManuscriptsPage />} />
            <Route path="manuscripts/:id" element={<ManuscriptDetailPage />} />
            <Route path="submit" element={<NewSubmissionPage />} />
            <Route path="reviewers" element={<ReviewersPage />} />
            <Route path="reviews" element={<ReviewDeskPage />} />
            <Route path="billing" element={<ApcBillingPage />} />
            <Route path="published" element={<PublishedPapersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="outbox" element={<OutboxPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
