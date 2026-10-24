import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOutboxEmails } from '../../store/slices/outboxSlice';
import { DispatchedEmail } from '../../services/outboxService';
import { Mail, Key, Clock, CheckCircle2, Search, ExternalLink, Shield, RefreshCw } from 'lucide-react';

export const OutboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Dispatched Mail Audit Log</span>
          </div>
          <h1 className="text-2xl font-black text-[#0d3b6e] tracking-tight">
            Dispatched Notifications &amp; Credentials Outbox
          </h1>
          <p className="text-xs text-slate-500">
            Audit system emails containing generated author login credentials, peer reviewer invitations, and editorial notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(fetchOutboxEmails())}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh outbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0d3b6e]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
          <Mail className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-600">
            {isLoading ? 'Loading dispatched emails from server...' : 'No dispatched emails recorded yet.'}
          </p>
          <p>When an author submits a paper or an editor performs actions, notification logs will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedEmail(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedEmail?.id === item.id
                    ? 'bg-blue-50/50 border-[#0d3b6e] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      item.type === 'AUTHOR_CREDENTIALS' || item.type?.includes('CREDENTIALS')
                        ? 'bg-amber-100 text-amber-800'
                        : item.type === 'REVIEWER_INVITATION' || item.type?.includes('REVIEW')
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type || 'NOTIFICATION'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.sentAt?.replace('T', ' ').slice(0, 16)}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 truncate">{item.subject}</h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">To: {item.toName || item.to}</p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.manuscriptId || 'GENERAL'}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold font-sans">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{item.status || 'SENT'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 sticky top-24">
                <div className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Message ID: {selectedEmail.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Dispatched via SMTP Server</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0d3b6e]">{selectedEmail.subject}</h3>
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-500 w-16 inline-block">From:</span>
                      <span className="font-medium text-slate-800">
                        IJSPAST Editorial Office &lt;editorial@ijspast.org&gt;
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 w-16 inline-block">To:</span>
                      <span className="font-bold text-slate-900">{selectedEmail.toName}</span>
                      <span className="text-slate-400 ml-1">({selectedEmail.to})</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 w-16 inline-block">Date:</span>
                      <span className="text-slate-700">{selectedEmail.sentAt}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-xl border border-slate-100 min-h-[220px]">
                  {selectedEmail.content}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                Select an email from the left pane to inspect full audit details and credentials dispatch log.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
