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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-['IBM_Plex_Sans',sans-serif]">
      {/* Top Midnight Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex-1 flex min-w-0">
        {/* Responsive & Collapsible Midnight Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main Content Viewport */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Institutional Midnight Footer */}
          <footer className="bg-[#0a1124] text-slate-400 border-t border-slate-850 py-7 px-6 text-center text-xs space-y-1.5 mt-auto">
            <div className="font-bold text-white tracking-tight text-sm">
              International Journal of Scientific Progress in Applied Science and Engineering (IJSPAST)
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Shri Ramswaroop Memorial University (SRMU) • E-ISSN: 2582-8800 • Open Access Enterprise Journal
            </div>
            <div className="text-[10px] text-slate-400">
              Double-Blind Peer Review • Enterprise Editorial Lifecycle Management System
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
