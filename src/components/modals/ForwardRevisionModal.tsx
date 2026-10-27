import React, { useState } from 'react';
import { Shield, Send } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ForwardRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  manuscriptTitle: string;
  primaryReviewerName?: string;
  secondaryReviewerName?: string;
  authorRevisionResponse?: string;
  onForward: (deadlineDays: number, notes: string) => Promise<void>;
  isLoading?: boolean;
}

export const ForwardRevisionModal: React.FC<ForwardRevisionModalProps> = ({
  isOpen,
  onClose,
  manuscriptId,
  manuscriptTitle,
  primaryReviewerName,
  secondaryReviewerName,
  authorRevisionResponse,
  onForward,
  isLoading = false,
}) => {
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onForward(deadlineDays, notes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Forward Revisions to Reviewers (Round 2)"
      subtitle={`Manuscript ID: ${manuscriptId} • ${manuscriptTitle}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-blue-900">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-950">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>Editorial Transfer Control &amp; Double-Blind Anonymity</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            As Editor, forwarding this revision enables the assigned peer reviewer(s) to access the updated manuscript document and the author's rebuttal notes. Author identifying details remain strictly masked. An email notification will be dispatched to each assigned reviewer without generating or altering credentials.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-800 block">Assigned Reviewer(s):</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">Primary Reviewer:</span>
              <span className="font-bold text-slate-900">{primaryReviewerName || 'Not assigned'}</span>
            </div>
            {secondaryReviewerName && (
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">Secondary Reviewer:</span>
                <span className="font-bold text-slate-900">{secondaryReviewerName}</span>
              </div>
            )}
          </div>
        </div>

        {authorRevisionResponse && (
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">
              Author Rebuttal &amp; Modification Summary:
            </span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap max-h-32 overflow-y-auto font-sans leading-relaxed text-[11px]">
              {authorRevisionResponse}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="forwardDeadline" className="font-bold text-slate-800 block mb-1">
              Re-evaluation Deadline (Days) *
            </label>
            <input
              id="forwardDeadline"
              type="number"
              min={1}
              max={60}
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 14)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="forwardNotes" className="font-bold text-slate-800 block">
            Editorial Instructions / Directives for Reviewers (Optional)
          </label>
          <textarea
            id="forwardNotes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Please pay special attention to whether the author adequately addressed the methodology queries in Section 3..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Forwarding...' : 'Forward Revisions to Reviewers'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
