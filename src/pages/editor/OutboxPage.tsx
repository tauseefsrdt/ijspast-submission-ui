import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOutboxEmails } from '../../features/outbox/outboxThunk';
import { DispatchedEmail } from '../../types/outbox.types';
import { Mail, Clock, CheckCircle2, Search, RefreshCw, X, Shield, Inbox } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const OutboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { emails, isLoading } = useAppSelector((state) => state.outbox);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(null);

  useEffect(() => {
    dispatch(fetchOutboxEmails());
  }, [dispatch]);

  const filtered = emails.filter(
    (e) =>
      (e.to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.toName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.manuscriptId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    await dispatch(fetchOutboxEmails());
    toast.info('Outbox audit log refreshed.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071526] via-[#0a2540] to-[#0f4a85] rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700/60 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide">
            <Mail className="w-3.5 h-3.5" />
            <span>Dispatched Mail Audit Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dispatched Notifications &amp; Credentials Outbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Audit system emails containing generated author login credentials, peer reviewer invitations, and editorial lifecycle notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Refresh outbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-400 rounded-xl text-xs focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs space-y-2 shadow-2xs">
          <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">
            {isLoading ? 'Loading dispatched emails from server...' : 'No dispatched emails recorded yet'}
          </p>
          <p className="max-w-md mx-auto text-slate-500">
            When authors submit manuscripts or editors assign reviewers, transaction notifications will appear in this audit log.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Email List Left Pane */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">Audit Stream ({filtered.length})</span>
              <span className="text-[10px] text-slate-400 font-medium">Click to inspect</span>
            </div>

            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin">
              {filtered.map((item) => {
                const isSelected = selectedEmail?.id === item.id;
                const isCreds = item.type === 'AUTHOR_CREDENTIALS' || item.type?.includes('CREDENTIALS');
                const isInvite = item.type === 'REVIEWER_INVITATION' || item.type?.includes('REVIEW');

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEmail(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCreds
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isInvite
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.type || 'NOTIFICATION'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {item.sentAt?.replace('T', ' ').slice(0, 16)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {item.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      To: <span className="font-semibold text-slate-700">{item.toName || item.to}</span>
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                        {item.manuscriptId || 'GENERAL'}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-bold font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.status || 'DELIVERED'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Preview Right Pane */}
          <div className="lg:col-span-7">
            {selectedEmail ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5 sticky top-24">
                <div className="border-b border-slate-100 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Message ID: {selectedEmail.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SMTP Transaction Confirmed</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {selectedEmail.subject}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-16 shrink-0">From:</span>
                      <span className="font-medium text-slate-800">
                        IJSPAST Editorial Office &lt;editorial@ijspast.org&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-16 shrink-0">To:</span>
                      <span className="font-bold text-slate-900">{selectedEmail.toName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({selectedEmail.to})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-16 shrink-0">Sent Date:</span>
                      <span className="text-slate-700 font-mono text-[11px]">{selectedEmail.sentAt}</span>
                    </div>
                    {selectedEmail.manuscriptId && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 w-16 shrink-0">Paper Ref:</span>
                        <span className="font-bold font-mono text-indigo-700">{selectedEmail.manuscriptId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-5 rounded-xl border border-slate-200/80 min-h-[240px]">
                  {selectedEmail.content}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs shadow-2xs space-y-2">
                <Mail className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No Email Selected</p>
                <p className="text-slate-500">
                  Select a message from the audit stream on the left to inspect its complete dispatched content and recipient payload.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
