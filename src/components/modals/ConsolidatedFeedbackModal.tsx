import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, Sparkles, Send } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ConsolidatedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  hasDualReviewers: boolean;
  canMergeConsolidatedFeedback: boolean;
  hasSentConsolidatedFeedback: boolean;
  isRev1NewSubmitted: boolean;
  isRev2NewSubmitted: boolean;
  isRev1Stage1Submitted: boolean;
  isRev2Stage1Submitted: boolean;
  bothReviewersSubmitted: boolean;
  primaryReviewerName?: string;
  secondaryReviewerName?: string;
  rev1Final?: {
    recommendation: string;
    technicalQuality: number;
    originality: number;
    clarity: number;
    commentsForAuthor: string;
  } | null;
  rev2Final?: {
    recommendation: string;
    technicalQuality: number;
    originality: number;
    clarity: number;
    commentsForAuthor: string;
  } | null;
  revisionComments: string;
  onChangeRevisionComments: (comments: string) => void;
  editorComments?: string;
  onChangeEditorComments?: (comments: string) => void;
  onAutoMerge: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const ConsolidatedFeedbackModal: React.FC<ConsolidatedFeedbackModalProps> = ({
  isOpen,
  onClose,
  manuscriptId,
  hasDualReviewers,
  canMergeConsolidatedFeedback,
  hasSentConsolidatedFeedback,
  isRev1NewSubmitted,
  isRev2NewSubmitted,
  isRev1Stage1Submitted,
  isRev2Stage1Submitted,
  bothReviewersSubmitted,
  primaryReviewerName,
  secondaryReviewerName,
  rev1Final,
  rev2Final,
  revisionComments,
  onChangeRevisionComments,
  editorComments = '',
  onChangeEditorComments,
  onAutoMerge,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        hasDualReviewers
          ? 'Consolidated Peer Review Desk (Merge & Send to Author)'
          : 'Pass Comments to Author (Request Revisions)'
      }
      subtitle={`Manuscript: ${manuscriptId} • ${
        hasDualReviewers
          ? canMergeConsolidatedFeedback
            ? 'Dual Reviews Completed (2/2)'
            : hasSentConsolidatedFeedback
            ? 'Next Review Cycle Pending'
            : 'Review Status: Incomplete'
          : 'Single Reviewer'
      }`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Double-Blind Notice */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-900">
          <Shield className="w-4 h-4 text-purple-700 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Double-Blind Guarantee:</strong> All reviewer comments forwarded to the author
            are strictly anonymized as <strong>"Reviewer 1"</strong> and <strong>"Reviewer 2"</strong>. Reviewer personal identities and contacts are NEVER disclosed.
          </p>
        </div>

        {/* Dual Reviewer Wait Barrier if reviewers have not completed the current cycle */}
        {hasDualReviewers && !canMergeConsolidatedFeedback && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {hasSentConsolidatedFeedback
                  ? 'Consolidated Feedback Sent: Waiting for Next Review Cycle Feedback'
                  : 'Editorial Hold: Waiting for Second Reviewer Feedback'}
              </span>
            </div>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              {hasSentConsolidatedFeedback ? (
                <>
                  <strong>Policy Requirement:</strong> Consolidated feedback has already been sent
                  to the Author. Under journal protocol, this button is disabled until both
                  Reviewer 1 and Reviewer 2 submit their new evaluations for the next review cycle
                  (Stage 2 / Round 2). Current progress:{' '}
                  <strong>
                    {isRev1NewSubmitted && isRev2NewSubmitted
                      ? '2 of 2'
                      : isRev1NewSubmitted || isRev2NewSubmitted
                      ? '1 of 2'
                      : '0 of 2'}
                  </strong>{' '}
                  submitted.
                </>
              ) : (
                <>
                  <strong>Policy Requirement:</strong> The Editor must not send consolidated
                  feedback to the Author until both reviewers have submitted their feedback. Because
                  only{' '}
                  <strong>
                    {isRev1Stage1Submitted || isRev2Stage1Submitted
                      ? '1 of 2 reviewers'
                      : '0 of 2 reviewers'}
                  </strong>{' '}
                  has submitted so far, you must wait for the second reviewer to submit before
                  merging and dispatching consolidated feedback.
                </>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div
                className={`p-3 rounded-lg border ${
                  (hasSentConsolidatedFeedback ? isRev1NewSubmitted : isRev1Stage1Submitted)
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-white border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold block text-[11px]">
                  Reviewer 1 ({primaryReviewerName || 'Primary'}):
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {(hasSentConsolidatedFeedback ? isRev1NewSubmitted : isRev1Stage1Submitted) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Feedback Submitted ({rev1Final?.recommendation})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Awaiting Submission</span>
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  (hasSentConsolidatedFeedback ? isRev2NewSubmitted : isRev2Stage1Submitted)
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-white border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold block text-[11px]">
                  Reviewer 2 ({secondaryReviewerName || 'Secondary'}):
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {(hasSentConsolidatedFeedback ? isRev2NewSubmitted : isRev2Stage1Submitted) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Feedback Submitted ({rev2Final?.recommendation})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Awaiting Submission</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Both Reviewers Submitted (or single reviewer) - Review & Merge Desk */}
        {bothReviewersSubmitted && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Both Reviewers' Feedback Received (2/2). Ready to merge.</span>
              </div>
              <button
                type="button"
                onClick={onAutoMerge}
                className="px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Merge Both Reviews</span>
              </button>
            </div>

            {/* Reviewer 1 & Reviewer 2 Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {rev1Final && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-indigo-950">Reviewer 1 Feedback:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {rev1Final.recommendation}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scores: Tech {rev1Final.technicalQuality}/5 • Orig {rev1Final.originality}/5 •
                    Clarity {rev1Final.clarity}/5
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px] whitespace-pre-wrap max-h-24 overflow-y-auto font-sans leading-relaxed">
                    {rev1Final.commentsForAuthor}
                  </div>
                </div>
              )}

              {rev2Final && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-purple-950">Reviewer 2 Feedback:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {rev2Final.recommendation}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scores: Tech {rev2Final.technicalQuality}/5 • Orig {rev2Final.originality}/5 •
                    Clarity {rev2Final.clarity}/5
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px] whitespace-pre-wrap max-h-24 overflow-y-auto font-sans leading-relaxed">
                    {rev2Final.commentsForAuthor}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="consolidatedComments" className="font-bold text-slate-800 block">
              Consolidated Editorial Review Report for Author *
            </label>
            {bothReviewersSubmitted && (
              <button
                type="button"
                onClick={onAutoMerge}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline cursor-pointer"
              >
                Regenerate Merged Template
              </button>
            )}
          </div>
          <textarea
            id="consolidatedComments"
            rows={8}
            value={revisionComments}
            onChange={(e) => onChangeRevisionComments(e.target.value)}
            placeholder={
              hasDualReviewers && !bothReviewersSubmitted
                ? 'Waiting for both reviewers to submit feedback before consolidated report can be composed...'
                : "Review and synthesize both reviewers' feedback above into this consolidated report to dispatch to the author..."
            }
            disabled={hasDualReviewers && !bothReviewersSubmitted}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Field label: Editor Comments */}
        <div className="space-y-1">
          <label htmlFor="editorComments" className="font-bold text-slate-800 block">
            Editor Comments
          </label>
          <textarea
            id="editorComments"
            rows={4}
            value={editorComments}
            onChange={(e) => onChangeEditorComments && onChangeEditorComments(e.target.value)}
            placeholder="Write your additional comments, clarification, or guidance for the author..."
            disabled={hasDualReviewers && !bothReviewersSubmitted}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-500">
            Optional editorial guidance or synthesis directed to the author. Double-blind integrity is strictly preserved.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!canMergeConsolidatedFeedback || !revisionComments.trim() || isLoading}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>
              {isLoading
                ? 'Dispatching...'
                : !canMergeConsolidatedFeedback
                ? hasSentConsolidatedFeedback
                  ? 'Awaiting Next-Cycle Reviewer Feedback (Cannot Send)'
                  : `Waiting for Reviewer ${isRev1Stage1Submitted ? '2' : '1'} (Cannot Send)`
                : 'Dispatch Consolidated Feedback to Author'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
