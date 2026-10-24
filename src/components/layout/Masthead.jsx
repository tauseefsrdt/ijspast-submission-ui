import React from 'react';
import { useApp } from '../../context/AppContext';
import { BASE_DATE, getDateString } from '../../constants/initialData';

export function Masthead({ onOpenOutbox }) {
  const { data, setSession, advanceDay, resetDemo } = useApp();
  const { session, day, mail, reviewers, users } = data;

  const getRoleLabel = () => {
    switch (session.role) {
      case 'author': {
        const u = users[session.who];
        return `Author: ${u?.name || session.who}`;
      }
      case 'editor':
        return `Editor: ${session.who}`;
      case 'reviewer': {
        const r = reviewers.find((x) => x.id === session.who || x.email === session.who);
        return `Reviewer: ${r?.name || session.who}`;
      }
      case 'admin':
        return 'Admin';
      case 'public':
        return 'Public Journal Website';
      default:
        return 'Not signed in';
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Primary Navy Bar */}
      <div className="bg-[#0d3b6e] text-white">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setSession({ role: 'login', who: null, pid: null, tab: null })}
          >
            <div className="w-9 h-9 rounded-lg bg-[#f2b01e] text-[#1d1600] font-bold flex items-center justify-center text-sm shadow">
              IJ
            </div>
            <div>
              <div className="font-bold text-base leading-tight tracking-tight">SRMU Journals Portal</div>
              <div className="text-xs text-blue-200 opacity-90 leading-none mt-0.5">
                IJMAR and IJSPAST | Working mockup
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
              {getRoleLabel()}
            </span>

            <button
              onClick={onOpenOutbox}
              className="px-3 py-1 text-xs font-medium bg-transparent hover:bg-white/10 active:bg-white/20 border border-white/30 rounded-md transition-colors"
            >
              Outbox ({mail.length})
            </button>

            <button
              onClick={() => setSession({ role: 'login', who: null, pid: null, tab: null })}
              className="px-3 py-1 text-xs font-medium bg-white text-[#0d3b6e] hover:bg-slate-100 rounded-md font-semibold transition-colors shadow-xs"
            >
              Switch role
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Demo Date Navigation Bar */}
      <div className="bg-[#0a2d54] text-white text-xs border-t border-blue-900/40">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-medium border border-white/20">
              Demo date: <b className="font-semibold text-amber-300">{getDateString(BASE_DATE, day)}</b>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => advanceDay(1)}
                className="px-2 py-0.5 bg-transparent hover:bg-white/15 border border-white/25 rounded transition-colors text-xs"
                title="Advance simulation by 1 day"
              >
                +1 day
              </button>
              <button
                onClick={() => advanceDay(3)}
                className="px-2 py-0.5 bg-transparent hover:bg-white/15 border border-white/25 rounded transition-colors text-xs"
                title="Advance simulation by 3 days"
              >
                +3 days
              </button>
              <button
                onClick={() => advanceDay(7)}
                className="px-2 py-0.5 bg-transparent hover:bg-white/15 border border-white/25 rounded transition-colors text-xs"
                title="Advance simulation by 7 days"
              >
                +7 days
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-blue-200 text-xs opacity-90">
              Simulated data. Moving the date triggers automated reminders.
            </span>
            <button
              onClick={resetDemo}
              className="text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 px-2 py-0.5 border border-rose-300/30 rounded transition-colors"
            >
              Reset demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
