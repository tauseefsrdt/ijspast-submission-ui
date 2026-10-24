import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  Smartphone,
  Search,
  Filter,
  ExternalLink,
  Clock,
  ArrowRight,
  Send,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/EmptyState';
import { BASE_DATE, getDateString } from '../constants/initialData';

export function OutboxPage() {
  const { data, setSession, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedKind, setSelectedKind] = useState('ALL');

  const mailList = data?.mail || [];

  const filtered = mailList.filter((m) => {
    if (selectedKind !== 'ALL' && m.kind !== selectedKind) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (m.subject || '').toLowerCase().includes(q);
      const matchTo = (m.to || '').toLowerCase().includes(q);
      const matchBody = (m.body || '').toLowerCase().includes(q);
      return matchSub || matchTo || matchBody;
    }
    return true;
  });

  const handleLinkClick = (link) => {
    if (link.a === 'setpw') {
      showToast(`Simulated set-password opened for ${link.d}`);
      navigate('/manuscripts');
      return;
    }

    if (link.a === 'login') {
      const parts = link.d.split('|');
      const role = parts[0];
      const who = parts[1];
      setSession({ role, who, pid: null });
      showToast(`Switched active perspective to ${role} (${who})`);
      navigate('/manuscripts');
      return;
    }

    showToast(`Action dispatched: ${link.l}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-2">
          <Mail className="w-3.5 h-3.5" />
          <span>Communications Audit Hub</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Communications Outbox
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological record of all automated transactional emails, reviewer notifications, and SMS alerts dispatched by the portal.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outbox by recipient, paper ID, subject, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedKind('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedKind === 'ALL'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Channels ({mailList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedKind('Email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedKind === 'Email'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emails ({mailList.filter((m) => m.kind === 'Email').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedKind('SMS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedKind === 'SMS'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS Alerts ({mailList.filter((m) => m.kind === 'SMS').length})
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No communication records match"
          description="Messages will appear here as submission, review, proofreading, and payment actions are taken."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((msg, idx) => (
            <div
              key={msg.n || idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      msg.kind === 'SMS'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {msg.kind === 'SMS' ? (
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Mail className="w-3 h-3 text-blue-600" />
                    )}
                    <span>{msg.kind}</span>
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    To: <span className="font-mono text-indigo-700">{msg.to}</span>
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {getDateString(BASE_DATE, msg.day)} at {msg.time}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{msg.subject}</h3>
                <div className="mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.body}
                </div>
              </div>

              {msg.links && msg.links.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Actionable Deep Links:</span>
                  {msg.links.map((link, lIdx) => (
                    <button
                      key={lIdx}
                      type="button"
                      onClick={() => handleLinkClick(link)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>{link.l}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
