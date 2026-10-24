import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Calendar,
  FastForward,
  RotateCcw,
  Search,
  Plus,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BASE_DATE, getDateString } from '../constants/initialData';

export function TopNavbar({ onToggleSidebar, onOpenOutbox }) {
  const { data, advanceDay, resetDemo, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const currentDay = data?.day || 0;
  const mailCount = data?.mail?.length || 0;
  const currentDateStr = getDateString(BASE_DATE, currentDay);

  // Generate breadcrumbs from location
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Portal', to: '/' },
    ...pathParts.map((part, index) => {
      const url = `/${pathParts.slice(0, index + 1).join('/')}`;
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === 'manuscripts') label = 'Manuscripts';
      if (part === 'reviewers') label = 'Reviewers';
      if (part === 'reviews') label = 'Review Desk';
      if (part === 'billing') label = 'APC Billing';
      if (part === 'published') label = 'Published Library';
      if (part === 'settings') label = 'System Settings';
      if (part === 'outbox') label = 'Outbox';
      if (part === 'submit') label = 'Submission Wizard';
      return { label, to: url };
    }),
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.to}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-bold text-slate-900 truncate">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.to}
                  className="hover:text-indigo-600 transition-colors font-medium truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Controls: Simulator + Outbox + Submit Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Simulation Date Widget */}
        <div className="flex items-center bg-slate-100/90 border border-slate-200/90 rounded-xl p-1 gap-1">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">
              {currentDateStr}
            </span>
          </div>

          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
            <button
              type="button"
              onClick={() => {
                advanceDay(1);
                showToast(`Simulation advanced 1 day (${getDateString(BASE_DATE, currentDay + 1)})`);
              }}
              title="Advance 1 day to trigger deadlines & reminders"
              className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              +1d
            </button>
            <button
              type="button"
              onClick={() => {
                advanceDay(3);
                showToast(`Simulation advanced 3 days (${getDateString(BASE_DATE, currentDay + 3)})`);
              }}
              title="Advance 3 days"
              className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              +3d
            </button>
            <button
              type="button"
              onClick={() => {
                advanceDay(7);
                showToast(`Simulation advanced 7 days (${getDateString(BASE_DATE, currentDay + 7)})`);
              }}
              title="Advance 7 days (checks automated reminders)"
              className="hidden sm:inline-block px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                showToast('Database reset to baseline state');
              }}
              title="Reset simulation data"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Outbox Notifications Bell */}
        <button
          type="button"
          onClick={onOpenOutbox}
          className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 transition-colors cursor-pointer"
          title="Open Communications Outbox (Emails & SMS)"
        >
          <Mail className="w-4 h-4" />
          {mailCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
              {mailCount}
            </span>
          )}
        </button>

        {/* Direct Action: New Submission */}
        <button
          type="button"
          onClick={() => navigate('/submit')}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Manuscript</span>
        </button>
      </div>
    </header>
  );
}
