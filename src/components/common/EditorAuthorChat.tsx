import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import {
  fetchCommunicationsThunk,
  sendCommunicationThunk,
} from '../../features/manuscripts/manuscriptThunk';
import { CommunicationThread, CommunicationMessage } from '../../types/manuscript.types';
import { MessageSquare, Send, ShieldAlert, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface EditorAuthorChatProps {
  manuscriptId: string;
  userRole: 'editor' | 'author';
  canCommunicate?: boolean;
}

export const EditorAuthorChat: React.FC<EditorAuthorChatProps> = ({
  manuscriptId,
  userRole,
  canCommunicate = false,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [thread, setThread] = useState<CommunicationThread | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadThread = async () => {
    setIsLoading(true);
    try {
      const res = await dispatch(
        fetchCommunicationsThunk({ manuscriptId, role: userRole })
      ).unwrap();
      setThread(res);
    } catch (err: any) {
      console.warn('Could not load communications thread:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (manuscriptId && canCommunicate) {
      loadThread();
    }
  }, [manuscriptId, canCommunicate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    if (thread && thread.totalExchanges >= 5) {
      toast.error('The maximum of five communication exchanges has been reached.');
      return;
    }

    setIsSending(true);
    try {
      const updated = await dispatch(
        sendCommunicationThunk({ manuscriptId, message: trimmed, role: userRole })
      ).unwrap();
      setThread(updated);
      setMessage('');
      toast.success('Message sent successfully.');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to send message.';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const totalExchanges = thread?.totalExchanges ?? 0;
  const isLimitReached = totalExchanges >= 5 || (thread?.limitReached ?? false);

  if (!canCommunicate) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>Editor–Author Communication Desk (Locked)</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Direct communication opens once the active peer review evaluation process has concluded for this manuscript.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0d3b6e]/10 text-[#0d3b6e] flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">
              Editor–Author Communication Desk
            </h3>
            <p className="text-[11px] text-slate-500">
              Direct, confidential exchange between Editorial Board and Author
            </p>
          </div>
        </div>

        {/* Exchanges Counter Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isLimitReached
                ? 'bg-red-50 text-red-700 border-red-200'
                : totalExchanges >= 3
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {totalExchanges}/5 Exchanges Used
          </span>
        </div>
      </div>

      {/* Security notice */}
      <div className="px-5 py-2 bg-purple-50/70 border-b border-purple-100 flex items-center gap-2 text-[11px] text-purple-900">
        <ShieldAlert className="w-3.5 h-3.5 text-purple-700 shrink-0" />
        <span>
          <strong>Double-Blind Protection:</strong> Peer reviewers have zero visibility into this discussion. Identities remain confidential.
        </span>
      </div>

      {/* Message history */}
      <div className="p-5 space-y-3 min-h-[160px] max-h-[360px] overflow-y-auto bg-slate-50/50">
        {isLoading && (!thread?.messages || thread.messages.length === 0) ? (
          <div className="text-center py-6 text-slate-400 text-xs">Loading message history...</div>
        ) : !thread?.messages || thread.messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No communication exchanges yet. Type a message below to start discussion.
          </div>
        ) : (
          thread.messages.map((m: CommunicationMessage) => {
            const isSelf =
              (userRole === 'editor' && m.senderRole === 'Editor') ||
              (userRole === 'author' && m.senderRole === 'Author');

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${
                      m.senderRole === 'Editor'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {m.senderRole}
                  </span>
                  <span className="font-medium text-slate-700">{m.senderName}</span>
                  <span>•</span>
                  <span>{m.sentAt}</span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isSelf
                      ? 'bg-[#0d3b6e] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Limit Reached Banner or Composer */}
      <div className="p-4 bg-white border-t border-slate-200">
        {isLimitReached ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-900 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>The maximum of five communication exchanges has been reached.</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-2">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to the other party..."
              disabled={isSending}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {5 - totalExchanges} {5 - totalExchanges === 1 ? 'exchange' : 'exchanges'} remaining
              </span>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
