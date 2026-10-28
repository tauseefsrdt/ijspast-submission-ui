import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReviewers } from '../../store/slices/reviewerSlice';
import { Modal } from '../common/Modal';
import { UserCheck, AlertTriangle, Shield, Clock, RefreshCw } from 'lucide-react';

interface ReassignReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  manuscriptTitle: string;
  slot: 1 | 2;
  currentReviewerName: string;
  currentReviewerAssignedDate?: string;
  currentReviewerDeadline?: string;
  daysOverdue?: number;
  otherReviewerId?: string;
  onReassign: (slot: number, replacementReviewerId: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export const ReassignReviewerModal: React.FC<ReassignReviewerModalProps> = ({
  isOpen,
  onClose,
  manuscriptId,
  manuscriptTitle,
  slot,
  currentReviewerName,
  currentReviewerAssignedDate,
  currentReviewerDeadline,
  daysOverdue,
  otherReviewerId,
  onReassign,
  isLoading = false,
}) => {
  const dispatch = useAppDispatch();
  const { reviewers } = useAppSelector((state) => state.reviewers);

  const [replacementReviewerId, setReplacementReviewerId] = useState('');
  const [reason, setReason] = useState('Unresponsive after 15-day review deadline');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchReviewers());
      setReplacementReviewerId('');
      setReason('Unresponsive after 15-day review deadline');
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // Filter eligible replacement reviewers:
  // Must not be the other reviewer
  const eligibleReviewers = reviewers.filter(
    (r) => r.id !== otherReviewerId && r.name.toLowerCase() !== currentReviewerName.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementReviewerId) return;
    await onReassign(slot, replacementReviewerId, reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reassign Reviewer ${slot} (Overdue 15 Days)`}
      subtitle={`Manuscript: ${manuscriptId}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Overdue Banner */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-[12px]">
              Reviewer {slot} ({currentReviewerName}) is Overdue
            </div>
            <div className="text-[11px] leading-relaxed text-red-800">
              Assigned on: <strong>{currentReviewerAssignedDate || 'N/A'}</strong> • Deadline was:{' '}
              <strong>{currentReviewerDeadline || '15 days from assignment'}</strong>
              {daysOverdue !== undefined && daysOverdue > 0 && (
                <span> ({daysOverdue} days overdue)</span>
              )}.
            </div>
          </div>
        </div>

        {/* 15-day Policy Note */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-700">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>15-Day Editorial Reassignment Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Reassigning Reviewer {slot} will appoint a new reviewer with their own fresh 15-calendar-day deadline. The other reviewer's evaluation status and deadline will not be affected.
          </p>
        </div>

        {/* Replacement Reviewer Selection */}
        <div className="space-y-1.5">
          <label htmlFor="replacementReviewer" className="font-bold text-slate-800 block">
            Select Replacement Reviewer *
          </label>
          <select
            id="replacementReviewer"
            value={replacementReviewerId}
            onChange={(e) => setReplacementReviewerId(e.target.value)}
            required
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#0d3b6e]/20 focus:outline-none"
          >
            <option value="">-- Choose an eligible replacement reviewer --</option>
            {eligibleReviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.domain}) — {r.institution || 'Affiliation N/A'}
              </option>
            ))}
          </select>
        </div>

        {/* Reason for Reassignment */}
        <div className="space-y-1.5">
          <label htmlFor="reassignReason" className="font-bold text-slate-800 block">
            Reason for Reassignment (Audit Log)
          </label>
          <input
            id="reassignReason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Unresponsive after 15-day review deadline"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#0d3b6e]/20 focus:outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!replacementReviewerId || isLoading}
            className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reassigning...' : 'Confirm Reassignment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
