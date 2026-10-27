import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-['Rubik',sans-serif] selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Top Announcement Bar - exact srmu-journal.netlify.app bar */}
      <div className="bg-[#071526] text-slate-300 text-[11px] font-medium py-1.5 px-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Published by:</span>
          <span className="font-semibold text-white">Shri Ramswaroop Memorial University</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold font-mono tracking-wider">E-ISSN: 2582-8800</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px]">
          <span className="text-cyan-300 flex items-center gap-1 font-semibold">
            <span>✦</span>
            <span>Double-Blind Peer Review</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">Continuous Online Publication</span>
        </div>
      </div>

      {/* 2. Main Brand Navbar */}
      <header className="h-20 bg-white border-b border-slate-200/90 px-6 sm:px-10 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3.5">
          {/* Logo badge with gold ring & IJ */}
          <div className="w-12 h-12 rounded-2xl bg-[#0a2540] border-2 border-[#f59e0b] text-[#f59e0b] font-serif font-black flex items-center justify-center text-xl shadow-md shrink-0">
            IJ
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-[#0a2540] tracking-tight text-xl">
                IJSPAST
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-300 font-black text-[10px] tracking-wider uppercase">
                Open Access
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              International Journal of Scientific Progress in Applied Science &amp; Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>SRMU Scholarly Portal</span>
        </div>
      </header>

      {/* 3. Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-4 relative">
        <Outlet />
      </main>

      {/* 4. Institutional Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white space-y-1">
        <p className="font-semibold text-slate-700">
          International Journal of Scientific Progress in Applied Science and Technology (IJSPAST)
        </p>
        <p className="text-[11px] text-slate-400">
          Published by Shri Ramswaroop Memorial University (SRMU) • Double-Blind Peer-Reviewed &amp; Immediate Open Access under CC BY 4.0
        </p>
      </footer>
    </div>
  );
};
