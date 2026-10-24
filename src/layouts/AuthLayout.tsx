import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f3f6fb] flex flex-col justify-between font-['IBM_Plex_Sans',sans-serif]">
      {/* Top Banner Header */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-xs">
            IJ
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              IJSPAST
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold ml-2">
              E-ISSN: 2582-8800
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Shri Ramswaroop Memorial University (SRMU)
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        International Journal of Scientific Progress in Applied Science and Technology (IJSPAST) • Peer-Reviewed Scholarly Portal
      </footer>
    </div>
  );
};
