import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchManuscripts,
  fetchAuthorManuscripts,
  fetchReviewerManuscripts,
} from '../store/slices/manuscriptSlice';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'author') {
      dispatch(fetchAuthorManuscripts());
    } else if (user?.role === 'reviewer') {
      dispatch(fetchReviewerManuscripts());
    } else if (user?.role === 'editor') {
      dispatch(fetchManuscripts());
    }
  }, [dispatch, user?.role]);

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 flex flex-col font-['IBM_Plex_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Institutional Footer */}
          <footer className="bg-white border-t border-slate-200/90 py-6 px-6 text-center text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">
              International Journal of Scientific Progress in Applied Science and Engineering (IJSPAST)
            </div>
            <div className="text-[11px] text-slate-400">
              Shri Ramswaroop Memorial University (SRMU) • E-ISSN: 2582-8800
            </div>
            <div className="text-[10px] text-slate-400">
              Double-Blind Peer Review • Role-Based Editorial Lifecycle Management
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
