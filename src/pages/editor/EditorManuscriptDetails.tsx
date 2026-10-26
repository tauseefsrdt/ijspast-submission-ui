import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchManuscriptById,
  assignManuscriptReviewer,
  requestManuscriptRevision,
  forwardRevisionThunk,
  enableStage2Thunk,
  acceptManuscriptThunk,
  rejectManuscriptThunk,
  publishManuscriptThunk,
  downloadManuscriptFile,
} from '../../features/manuscripts/manuscriptThunk';
import { fetchReviewsByManuscript } from '../../features/reviews/reviewThunk';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssignReviewerModal } from '../../components/modals/AssignReviewerModal';
import { Modal } from '../../components/common/Modal';
import { ReviewReport } from '../../types/review.types';
import { SRMU_CRITERIA } from '../../components/forms/ReviewForm';
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  BookOpen,
  Calendar,
  User,
  Shield,
  FileCheck,
  RotateCcw,
  Layers,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

export const EditorManuscriptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const { reviews } = useAppSelector((state) => state.reviews);
  const manuscript = manuscripts.find((m) => m.id === id);

  const [activeTab, setActiveTab] = useState<'overview' | 'reviewReport' | 'history'>('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardDeadlineDays, setForwardDeadlineDays] = useState(14);
  const [forwardNotes, setForwardNotes] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const [revisionComments, setRevisionComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [publishForm, setPublishForm] = useState({
    doi: `10.5555/ijspast.${new Date().getFullYear()}.${id?.slice(-4) || '0001'}`,
    volume: 'Vol. 14',
    issue: 'Issue 1',
    publishedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (id) {
      if (!manuscript || manuscript.id !== id) {
        dispatch(fetchManuscriptById(id));
      }
      dispatch(fetchReviewsByManuscript(id));
    }
  }, [id, dispatch, manuscript?.status]);

  if (!manuscript) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
        <h3 className="text-base font-bold text-slate-800">Manuscript Not Found</h3>
        <button
          type="button"
          onClick={() => navigate('/editor/dashboard')}
          className="px-4 py-2 bg-[#0d3b6e] text-white text-xs font-bold rounded-xl"
        >
          Return to Editor Dashboard
        </button>
      </div>
    );
  }

  // Track Reviewer 1 and Reviewer 2 feedback submissions (Dual review policy)
  const hasReviewer1 = Boolean(manuscript.assignedReviewerName || manuscript.assignedReviewerId);
  const hasReviewer2 = Boolean(manuscript.assignedReviewer2Name || manuscript.assignedReviewer2Id);
  const hasDualReviewers = hasReviewer1 && hasReviewer2;

  const rev1Reports = (reviews || []).filter(
    (r) =>
      (manuscript.assignedReviewerId && r.reviewerId === manuscript.assignedReviewerId) ||
      (manuscript.assignedReviewerName &&
        r.reviewerName?.toLowerCase() === manuscript.assignedReviewerName.toLowerCase())
  );
  const rev2Reports = (reviews || []).filter(
    (r) =>
      (manuscript.assignedReviewer2Id && r.reviewerId === manuscript.assignedReviewer2Id) ||
      (manuscript.assignedReviewer2Name &&
        r.reviewerName?.toLowerCase() === manuscript.assignedReviewer2Name.toLowerCase())
  );

  // Workflow tracking: Check if consolidated feedback has already been sent to the author
  const lastRevisionRequested = [...(manuscript.history || [])]
    .reverse()
    .find((h) => h.status === 'Revision Requested');
  const hasSentConsolidatedFeedback = Boolean(
    manuscript.revisionRequestComments ||
    lastRevisionRequested ||
    manuscript.status === 'Revision Requested'
  );

  // Workflow tracking: Check if the author has resubmitted the revised paper
  const hasAuthorResubmitted = Boolean(
    manuscript.status === 'Revision Submitted' ||
    (manuscript.authorRevisionResponse && manuscript.authorRevisionResponse.trim().length > 0) ||
    (manuscript.revisedFiles && manuscript.revisedFiles.length > 0) ||
    manuscript.history?.some((h) => h.status === 'Revision Submitted')
  );

  // Stage 1 initial evaluation reports
  const rev1Stage1 = rev1Reports.find((r) => r.stage === 1 || (!r.stage && rev1Reports.length === 1)) || rev1Reports[0] || (hasReviewer1 && rev2Reports.length === 0 && reviews.length >= 1 ? reviews[0] : null);
  const rev2Stage1 = rev2Reports.find((r) => r.stage === 1 || (!r.stage && rev2Reports.length === 1)) || rev2Reports[0] || null;

  const isRev1Stage1Submitted = Boolean(rev1Stage1);
  const isRev2Stage1Submitted = Boolean(rev2Stage1);
  const bothStage1Submitted = hasDualReviewers
    ? (isRev1Stage1Submitted && isRev2Stage1Submitted)
    : isRev1Stage1Submitted;

  // Next-cycle / Stage 2 reports (new reviewer feedback submitted for next cycle)
  const rev1NewReport = rev1Reports.find((r) => {
    if ((r.stage && r.stage >= 2) || (r as any).round >= 2) return true;
    if (lastRevisionRequested?.date && r.submittedAt) {
      return new Date(r.submittedAt).getTime() > new Date(lastRevisionRequested.date).getTime();
    }
    return false;
  });
  const rev2NewReport = rev2Reports.find((r) => {
    if ((r.stage && r.stage >= 2) || (r as any).round >= 2) return true;
    if (lastRevisionRequested?.date && r.submittedAt) {
      return new Date(r.submittedAt).getTime() > new Date(lastRevisionRequested.date).getTime();
    }
    return false;
  });

  const isRev1NewSubmitted = Boolean(rev1NewReport);
  const isRev2NewSubmitted = Boolean(rev2NewReport);
  const bothNewReportsSubmitted = hasDualReviewers
    ? (isRev1NewSubmitted && isRev2NewSubmitted)
    : isRev1NewSubmitted;

  // Active reports for consolidated review synthesis
  const rev1Final = hasSentConsolidatedFeedback ? (rev1NewReport || rev1Stage1) : rev1Stage1;
  const rev2Final = hasSentConsolidatedFeedback ? (rev2NewReport || rev2Stage1) : rev2Stage1;

  const isRev1Submitted = Boolean(rev1Final);
  const isRev2Submitted = Boolean(rev2Final);

  // Both reviewers submitted for active round
  const bothReviewersSubmitted = hasDualReviewers
    ? (isRev1Submitted && isRev2Submitted)
    : isRev1Submitted;

  // Check if Editor has performed either Forward Revisions to Reviewers or Reassign Reviewer
  const isForwardedOrReassigned = Boolean(
    manuscript.revisionForwardedToReviewer ||
    (manuscript as any).reviewerReassignedAfterRevision ||
    manuscript.history?.some((h) =>
      h.comment && h.comment.includes('forwarded to peer reviewer')
    )
  );

  // Stage 2 actually active only if enabled and (if author resubmitted, editor has forwarded or reassigned)
  const isStage2ActuallyActive = Boolean(
    manuscript.stage2EnabledByEditor &&
    (!hasAuthorResubmitted || isForwardedOrReassigned)
  );

  // Enable Stage 2 Review requires:
  // 1. Both reviewers submitted their Stage 1 feedback
  // 2. Editor clicked Review & Merge Consolidated Feedback, merged, and sent to author
  // 3. Author resubmitted the revised paper
  // 4. Editor performed either Forward Revisions to Reviewers or Reassign Reviewer
  // 5. Stage 2 has not already been enabled
  const canEnableStage2 =
    bothStage1Submitted &&
    hasSentConsolidatedFeedback &&
    hasAuthorResubmitted &&
    isForwardedOrReassigned &&
    !isStage2ActuallyActive;

  // Consolidated Feedback Button requires:
  // - In Initial Cycle (!hasSentConsolidatedFeedback): Both reviewers have submitted Stage 1
  // - In Next Cycle (hasSentConsolidatedFeedback): Both reviewers have submitted NEW feedback for the next review cycle
  const canMergeConsolidatedFeedback = !hasSentConsolidatedFeedback
    ? bothStage1Submitted
    : bothNewReportsSubmitted;

  const handleAutoMergeReviews = () => {
    let merged = `=== CONSOLIDATED EDITORIAL PEER REVIEW REPORT ===\n`;
    merged += `Manuscript ID: ${manuscript.id}\n`;
    merged += `Title: "${manuscript.title}"\n`;
    merged += `Consolidation Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    if (rev1Final) {
      merged += `--------------------------------------------------\n`;
      merged += `REVIEWER 1 EVALUATION (Anonymized):\n`;
      merged += `Recommendation: ${rev1Final.recommendation}\n`;
      merged += `Evaluation Scores: Technical: ${rev1Final.technicalQuality}/5 | Originality: ${rev1Final.originality}/5 | Clarity: ${rev1Final.clarity}/5`;
      if (rev1Final.overallScore) {
        merged += ` | Overall Score: ${rev1Final.overallScore.toFixed(1)}/5.0`;
      }
      merged += `\n\nReviewer 1 Specific Comments & Critiques for Author:\n`;
      merged += `${rev1Final.commentsForAuthor}\n\n`;
    }

    if (rev2Final) {
      merged += `--------------------------------------------------\n`;
      merged += `REVIEWER 2 EVALUATION (Anonymized):\n`;
      merged += `Recommendation: ${rev2Final.recommendation}\n`;
      merged += `Evaluation Scores: Technical: ${rev2Final.technicalQuality}/5 | Originality: ${rev2Final.originality}/5 | Clarity: ${rev2Final.clarity}/5`;
      if (rev2Final.overallScore) {
        merged += ` | Overall Score: ${rev2Final.overallScore.toFixed(1)}/5.0`;
      }
      merged += `\n\nReviewer 2 Specific Comments & Critiques for Author:\n`;
      merged += `${rev2Final.commentsForAuthor}\n\n`;
    }

    merged += `--------------------------------------------------\n`;
    merged += `EDITORIAL BOARD DIRECTIVE & RESUBMISSION INSTRUCTIONS:\n`;
    merged += `The Editorial Board has synthesized the independent reviewer evaluations above. Before your manuscript can proceed to final decision, you are required to:\n`;
    merged += `1. Address each critique and question raised by Reviewer 1 and Reviewer 2 in a structured, point-by-point rebuttal letter.\n`;
    merged += `2. Highlight all modifications, corrections, and added data in your revised manuscript document.\n`;
    merged += `3. Submit the revised paper and rebuttal response through the Author Portal within 14 days.\n`;

    setRevisionComments(merged);
  };

  const handleAssignReviewer = async (
    reviewerId: string,
    reviewerName: string,
    reviewer2Id?: string,
    reviewer2Name?: string
  ) => {
    await dispatch(
      assignManuscriptReviewer({
        manuscriptId: manuscript.id,
        reviewerId,
        reviewerName,
        reviewer2Id,
        reviewer2Name,
      })
    );
  };

  const handleConfirmRevision = async () => {
    if (!revisionComments.trim()) return;
    try {
      await dispatch(
        requestManuscriptRevision({
          manuscriptId: manuscript.id,
          comments: revisionComments.trim(),
          editorName: user?.name || 'Editor-in-Chief',
        })
      ).unwrap();
      setIsRevisionModalOpen(false);
      setRevisionComments('');
      if (id) {
        await dispatch(fetchManuscriptById(id));
        await dispatch(fetchReviewsByManuscript(id));
      }
    } catch (err: any) {
      console.error('Failed to dispatch consolidated feedback:', err);
      alert(typeof err === 'string' ? err : err?.message || 'Failed to dispatch consolidated feedback to author.');
    }
  };

  const handleConfirmForwardRevision = async () => {
    setIsForwarding(true);
    try {
      await dispatch(
        forwardRevisionThunk({
          manuscriptId: manuscript.id,
          deadlineDays: forwardDeadlineDays,
          notes: forwardNotes.trim() || undefined,
        })
      ).unwrap();
      setIsForwardModalOpen(false);
      setForwardNotes('');
      if (id) {
        await dispatch(fetchManuscriptById(id));
      }
    } catch (err: any) {
      console.error('Failed to forward revision:', err);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      await dispatch(
        rejectManuscriptThunk({
          manuscriptId: manuscript.id,
          reason: rejectionReason.trim(),
          editorName: user?.name || 'Editor-in-Chief',
        })
      ).unwrap();
      setIsRejectModalOpen(false);
      setRejectionReason('');
      if (id) {
        await dispatch(fetchManuscriptById(id));
      }
    } catch (err: any) {
      console.error('Failed to reject manuscript:', err);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      await dispatch(
        publishManuscriptThunk({
          manuscriptId: manuscript.id,
          details: publishForm,
          editorName: user?.name || 'Editor-in-Chief',
        })
      ).unwrap();
      setIsPublishModalOpen(false);
      if (id) {
        await dispatch(fetchManuscriptById(id));
      }
    } catch (err: any) {
      console.error('Failed to publish manuscript:', err);
    }
  };

  const handleAccept = async () => {
    try {
      await dispatch(
        acceptManuscriptThunk({
          manuscriptId: manuscript.id,
          editorName: user?.name || 'Editor-in-Chief',
        })
      ).unwrap();
      if (id) {
        await dispatch(fetchManuscriptById(id));
      }
    } catch (err: any) {
      console.error('Failed to accept manuscript:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/editor/dashboard')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Editor Dashboard</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                {manuscript.id}
              </span>
              <StatusBadge status={manuscript.status} size="md" />
              {manuscript.revisionForwardedToReviewer && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Revision Forwarded to Reviewer</span>
                </span>
              )}
              {manuscript.similarityScore !== undefined && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    manuscript.similarityScore <= 10
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {manuscript.similarityScore}% Similarity Check (Benchmark: 10%)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d3b6e] tracking-tight leading-snug">
              {manuscript.title}
            </h1>

            <p className="text-xs text-slate-500">
              Subject Domain: <strong className="text-slate-700">{manuscript.domain}</strong> • Submitted: {manuscript.submissionDate}
            </p>
          </div>

          {/* Corresponding Author info card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 shrink-0 md:w-72">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Corresponding Author
            </span>
            <p className="font-bold text-slate-900">{manuscript.author?.name || 'Author'}</p>
            <p className="text-slate-500 truncate">{manuscript.author?.institution || 'Institution'}</p>
            <p className="font-mono text-[11px] text-slate-500 truncate">{manuscript.author?.email || 'N/A'}</p>
            {manuscript.author?.orcid && (
              <p className="text-[10px] text-indigo-600 font-mono">ORCID: {manuscript.author.orcid}</p>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Editorial Actions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Assign Reviewer */}
            {['Submitted', 'Editor Assessment', 'Revision Submitted'].includes(manuscript.status) && (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {manuscript.assignedReviewerName ? 'Reassign Reviewer' : 'Assign Reviewer'}
                </span>
              </button>
            )}

            {/* Forward to Reviewer (Round 2) */}
            {manuscript.status === 'Revision Submitted' && (
              <button
                type="button"
                onClick={() => setIsForwardModalOpen(true)}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Forward Revisions to Reviewers</span>
              </button>
            )}

            {/* Enable Stage 2 Review / Stage 2 Enabled indicator */}
            {['Under Review', 'Review Completed', 'Editor Assessment', 'Revision Requested', 'Revision Submitted'].includes(manuscript.status) && (
              isStage2ActuallyActive ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Stage 2 Enabled
                </span>
              ) : bothStage1Submitted ? (
                canEnableStage2 ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await dispatch(enableStage2Thunk(manuscript.id)).unwrap();
                        if (id) await dispatch(fetchManuscriptById(id));
                      } catch (err: any) {
                        alert(typeof err === 'string' ? err : err?.message || 'Failed to enable Stage 2 review.');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Enable Stage 2 Final Evaluation for assigned reviewers"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enable Stage 2 Review</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs rounded-xl shadow-none flex items-center gap-1.5 cursor-not-allowed opacity-75"
                    title={
                      !hasSentConsolidatedFeedback
                        ? "Stage 2 Review disabled: Editor must first review & merge consolidated feedback and dispatch to author."
                        : !hasAuthorResubmitted
                        ? "Stage 2 Review disabled: Waiting for author to resubmit the revised manuscript."
                        : !isForwardedOrReassigned
                        ? "Stage 2 Review disabled: Editor must first perform either 'Forward Revisions to Reviewers' or 'Reassign Reviewer'."
                        : "Stage 2 Review disabled: Workflow prerequisites not met."
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {hasAuthorResubmitted && !isForwardedOrReassigned
                        ? 'Stage 2 (Awaiting Forward / Reassign)'
                        : 'Enable Stage 2 Review'}
                    </span>
                  </button>
                )
              ) : (isRev1Stage1Submitted || isRev2Stage1Submitted) ? (
                <span
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5"
                  title="Stage 2 cannot be enabled until all assigned reviewers submit their Stage 1 feedback."
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Awaiting Donor Reviewer {isRev1Stage1Submitted ? '2' : '1'} Feedback for Stage 2
                </span>
              ) : null
            )}

            {/* Request Revision / Consolidated Review */}
            {['Under Review', 'Review Completed', 'Editor Assessment', 'Revision Requested', 'Revision Submitted'].includes(manuscript.status) && (
              canMergeConsolidatedFeedback ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsRevisionModalOpen(true);
                    if (!revisionComments) {
                      handleAutoMergeReviews();
                    }
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                  <span>
                    {hasDualReviewers ? 'Review & Merge Consolidated Feedback (2/2 Ready)' : 'Request Author Revisions'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs rounded-xl shadow-none flex items-center gap-1.5 cursor-not-allowed opacity-75"
                  title={
                    hasSentConsolidatedFeedback
                      ? !hasAuthorResubmitted
                        ? "Consolidated feedback sent to author. Waiting for author to resubmit revised paper before next review cycle."
                        : !manuscript.stage2EnabledByEditor
                        ? "Consolidated feedback sent & author resubmission received. Enable Stage 2 Review to allow reviewers to submit next-cycle feedback."
                        : `Consolidated feedback sent. Waiting for new reviewer evaluations for next review cycle (${isRev1NewSubmitted || isRev2NewSubmitted ? '1/2' : '0/2'} submitted).`
                      : "Dual review policy: Both reviewers must submit feedback before consolidated review can be sent to author."
                  }
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {hasSentConsolidatedFeedback
                      ? !hasAuthorResubmitted
                        ? 'Consolidated Feedback Sent (Awaiting Author Resubmission)'
                        : (isRev1NewSubmitted || isRev2NewSubmitted)
                        ? `Awaiting Reviewer ${isRev1NewSubmitted ? '2' : '1'} Next-Cycle Feedback (1/2)`
                        : 'Consolidated Feedback Sent (Awaiting Next-Cycle Feedback)'
                      : `Awaiting Reviewer ${isRev1Stage1Submitted ? '2' : '1'} (${isRev1Stage1Submitted || isRev2Stage1Submitted ? '1/2' : '0/2'} Submitted)`}
                  </span>
                </button>
              )
            )}

            {/* Accept */}
            {['Under Review', 'Review Completed', 'Revision Submitted'].includes(manuscript.status) && (
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Manuscript</span>
              </button>
            )}

            {/* Publish */}
            {manuscript.status === 'Accepted' && (
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Publish Manuscript Online</span>
              </button>
            )}

            {/* View Live on Public Site */}
            {manuscript.status === 'Published' && (
              <button
                type="button"
                onClick={() => navigate('/published')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Live on Public Repository</span>
              </button>
            )}

            {/* Reject */}
            {manuscript.status !== 'Published' && manuscript.status !== 'Rejected' && (
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manuscript Scope &amp; Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviewReport')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviewReport'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Reviewer Evaluation Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-bold">
              {reviews.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors ${
              activeTab === 'history'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workflow Audit History
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Abstract
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {manuscript.abstract}
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Indexed Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {manuscript.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Revision Response if available */}
            {manuscript.authorRevisionResponse && (
              <div className="pt-4 border-t border-slate-100 space-y-1 text-xs">
                <span className="font-bold text-indigo-900 block">
                  Author's Point-by-Point Revision Response:
                </span>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {manuscript.authorRevisionResponse}
                </div>
              </div>
            )}
          </div>

          {/* Files & Reviewer Info */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Uploaded Manuscript Documents
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="font-mono font-bold text-slate-900 truncate">
                  {manuscript.file.name}
                </p>
                <button
                  type="button"
                  onClick={() => downloadManuscriptFile(manuscript.file.url || manuscript.file.name, manuscript.file.name)}
                  className="w-full py-1.5 bg-[#0d3b6e] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>

              {(manuscript.revisedFiles || []).map((rf, idx) => (
                <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <span className="font-bold text-amber-900 block text-[11px]">
                    Revised Document v{rf.version || idx + 1}
                  </span>
                  <p className="font-mono text-slate-800 text-[11px] truncate">{rf.name}</p>
                  <button
                    type="button"
                    onClick={() => downloadManuscriptFile(rf.url || rf.name, rf.name)}
                    className="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Revision</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Peer Review Assignment (Dual Reviewers)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  2 Reviewers Policy
                </span>
              </div>

              {manuscript.assignedReviewerName || manuscript.assignedReviewer2Name ? (
                <div className="space-y-3">
                  {manuscript.assignedReviewerName && (
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 block">Reviewer 1 (Primary)</span>
                      <p className="font-bold text-slate-900">{manuscript.assignedReviewerName}</p>
                      <p className="text-slate-500 text-[11px]">Assigned: {manuscript.assignedDate || 'Recent'}</p>
                    </div>
                  )}

                  {manuscript.assignedReviewer2Name && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block">Reviewer 2 (Secondary)</span>
                      <p className="font-bold text-slate-900">{manuscript.assignedReviewer2Name}</p>
                      <p className="text-slate-500 text-[11px]">Assigned: {manuscript.assignedDate || 'Recent'}</p>
                    </div>
                  )}

                  <p className="text-slate-500 pt-1 text-[11px]">
                    Evaluation Deadline: <strong className="text-slate-700">{manuscript.reviewDeadline || 'Within 14 days'}</strong>
                  </p>
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <p className="text-slate-500 italic">No reviewers currently assigned.</p>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-3 py-1.5 bg-[#0d3b6e] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Assign 2 Reviewers
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Review Reports */}
      {activeTab === 'reviewReport' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              No review evaluation report has been submitted yet for this paper.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {rev.reviewerName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          rev.stage === 2
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {rev.stageName || (rev.stage === 2 ? 'Stage 2: Final Evaluation' : 'Stage 1: Initial Assessment')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Submitted on {rev.submittedAt.split('T')[0]}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rev.recommendation === 'Accept'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : rev.recommendation === 'Reject'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Recommendation: {rev.recommendation}
                  </span>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200">
                    <span className="text-indigo-600 block text-[10px] uppercase font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 text-indigo-600" />
                      <span>Overall Score</span>
                    </span>
                    <span className="text-lg font-extrabold text-indigo-950">
                      {rev.overallScore ? `${rev.overallScore.toFixed(1)} / 5.0` : rev.rubricScores && rev.rubricScores.length > 0 ? `${(rev.rubricScores.reduce((a, b) => a + b, 0) / rev.rubricScores.length).toFixed(1)} / 5.0` : '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Technical Rigor
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {rev.technicalQuality} / 5
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Originality
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {rev.originality} / 5
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Clarity &amp; Style
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      {rev.clarity} / 5
                    </span>
                  </div>
                </div>

                {/* Complete SRMU 11-Point Rubric Scorecard (Requirement 3) */}
                {rev.rubricScores && rev.rubricScores.length > 0 && (
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Complete SRMU 11-Point Rubric Scorecard:</span>
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Scorecard Average: {rev.overallScore ? rev.overallScore.toFixed(2) : (rev.rubricScores.reduce((a, b) => a + b, 0) / rev.rubricScores.length).toFixed(2)} / 5.00
                      </span>
                    </div>

                    <div className="bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3">Evaluation Rubric Criterion</th>
                            <th className="py-2.5 px-3 w-28 text-center">Score (1-5)</th>
                            <th className="py-2.5 px-3 w-32 text-center">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rev.rubricScores.map((score, sIdx) => {
                            const criterionName = SRMU_CRITERIA[sIdx] || `Criterion ${sIdx + 1}`;
                            const ratingLabel =
                              score === 5 ? 'Excellent' :
                              score === 4 ? 'Good' :
                              score === 3 ? 'Satisfactory' :
                              score === 2 ? 'Marginal' : 'Deficient';
                            const badgeStyle =
                              score >= 4 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              score === 3 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-rose-50 text-rose-800 border-rose-200';

                            return (
                              <tr key={sIdx} className="hover:bg-white/70 transition-colors">
                                <td className="py-2 px-3 text-center font-mono font-bold text-slate-400 text-[11px]">{sIdx + 1}</td>
                                <td className="py-2 px-3 text-slate-700 font-medium">{criterionName}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className="font-extrabold text-slate-900 font-mono text-xs">{score}</span>
                                  <span className="text-slate-400 text-[10px]"> / 5</span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                                    {ratingLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Comments to Author */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Reviewer Comments for the Authors:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {rev.commentsForAuthor}
                  </div>
                </div>

                {/* Comments to Editor */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Summary Notes for the Editor:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {rev.commentsForEditor}
                  </div>
                </div>

                {/* Confidential */}
                {rev.confidentialComments && (
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>Confidential Remarks to Editor (Hidden from Author):</span>
                    </span>
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950 whitespace-pre-wrap leading-relaxed">
                      {rev.confidentialComments}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Workflow Event Audit Trail</h3>
          <div className="space-y-3">
            {manuscript.history
              .slice()
              .reverse()
              .map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{evt.actor}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{evt.date}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-bold text-slate-600">
                        {evt.role}
                      </span>
                    </div>
                    <p className="text-slate-600">{evt.comment}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: Assign Reviewer */}
      <AssignReviewerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        manuscriptTitle={manuscript.title}
        manuscriptDomain={manuscript.domain}
        onAssign={handleAssignReviewer}
      />

      {/* MODAL: Forward Revisions to Reviewers (Requirement 2) */}
      <Modal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        title="Forward Revisions to Reviewers (Round 2)"
        subtitle={`Manuscript ID: ${manuscript.id} • ${manuscript.title}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
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
                <span className="font-bold text-slate-900">{manuscript.assignedReviewerName || 'Not assigned'}</span>
              </div>
              {manuscript.assignedReviewer2Name && (
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Secondary Reviewer:</span>
                  <span className="font-bold text-slate-900">{manuscript.assignedReviewer2Name}</span>
                </div>
              )}
            </div>
          </div>

          {manuscript.authorRevisionResponse && (
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">
                Author Rebuttal &amp; Modification Summary:
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap max-h-32 overflow-y-auto font-sans leading-relaxed text-[11px]">
                {manuscript.authorRevisionResponse}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Re-evaluation Deadline (Days) *
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={forwardDeadlineDays}
                onChange={(e) => setForwardDeadlineDays(parseInt(e.target.value) || 14)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              Editorial Instructions / Directives for Reviewers (Optional)
            </label>
            <textarea
              rows={3}
              value={forwardNotes}
              onChange={(e) => setForwardNotes(e.target.value)}
              placeholder="e.g., Please pay special attention to whether the author adequately addressed the methodology queries in Section 3..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isForwarding}
              onClick={() => setIsForwardModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isForwarding}
              onClick={handleConfirmForwardRevision}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isForwarding ? 'Forwarding...' : 'Forward Revisions to Reviewers'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Request Revision & Consolidated Review Desk */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title={hasDualReviewers ? 'Consolidated Peer Review Desk (Merge & Send to Author)' : 'Pass Comments to Author (Request Revisions)'}
        subtitle={`Manuscript: ${manuscript.id} • ${hasDualReviewers ? (canMergeConsolidatedFeedback ? 'Dual Reviews Completed (2/2)' : hasSentConsolidatedFeedback ? 'Next Review Cycle Pending' : 'Review Status: Incomplete') : 'Single Reviewer'}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Double-Blind Notice */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-900">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Double-Blind Guarantee:</strong> All reviewer comments forwarded to the author are strictly anonymized as <strong>"Reviewer 1"</strong> and <strong>"Reviewer 2"</strong>. Reviewer personal identities and contacts are NEVER disclosed.
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
                    <strong>Policy Requirement:</strong> Consolidated feedback has already been sent to the Author. Under journal protocol, this button is disabled until both Reviewer 1 and Reviewer 2 submit their new evaluations for the next review cycle (Stage 2 / Round 2). Current progress: <strong>{isRev1NewSubmitted && isRev2NewSubmitted ? '2 of 2' : (isRev1NewSubmitted || isRev2NewSubmitted ? '1 of 2' : '0 of 2')}</strong> submitted.
                  </>
                ) : (
                  <>
                    <strong>Policy Requirement:</strong> The Editor must not send consolidated feedback to the Author until both reviewers have submitted their feedback. Because only <strong>{isRev1Stage1Submitted || isRev2Stage1Submitted ? '1 of 2 reviewers' : '0 of 2 reviewers'}</strong> has submitted so far, you must wait for the second reviewer to submit before merging and dispatching consolidated feedback.
                  </>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className={`p-3 rounded-lg border ${(hasSentConsolidatedFeedback ? isRev1NewSubmitted : isRev1Stage1Submitted) ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-white border-amber-200 text-amber-900'}`}>
                  <span className="font-bold block text-[11px]">Reviewer 1 ({manuscript.assignedReviewerName || 'Primary'}):</span>
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

                <div className={`p-3 rounded-lg border ${(hasSentConsolidatedFeedback ? isRev2NewSubmitted : isRev2Stage1Submitted) ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-white border-amber-200 text-amber-900'}`}>
                  <span className="font-bold block text-[11px]">Reviewer 2 ({manuscript.assignedReviewer2Name || 'Secondary'}):</span>
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
                  onClick={handleAutoMergeReviews}
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
                      Scores: Tech {rev1Final.technicalQuality}/5 • Orig {rev1Final.originality}/5 • Clarity {rev1Final.clarity}/5
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
                      Scores: Tech {rev2Final.technicalQuality}/5 • Orig {rev2Final.originality}/5 • Clarity {rev2Final.clarity}/5
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
              <label className="font-bold text-slate-800 block">
                Consolidated Editorial Review Report for Author *
              </label>
              {bothReviewersSubmitted && (
                <button
                  type="button"
                  onClick={handleAutoMergeReviews}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold underline cursor-pointer"
                >
                  Regenerate Merged Template
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              placeholder={hasDualReviewers && !bothReviewersSubmitted ? "Waiting for both reviewers to submit feedback before consolidated report can be composed..." : "Review and synthesize both reviewers' feedback above into this consolidated report to dispatch to the author..."}
              disabled={hasDualReviewers && !bothReviewersSubmitted}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!canMergeConsolidatedFeedback || !revisionComments.trim()}
              onClick={handleConfirmRevision}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>
                {!canMergeConsolidatedFeedback
                  ? hasSentConsolidatedFeedback
                    ? 'Awaiting Next-Cycle Reviewer Feedback (Cannot Send)'
                    : `Waiting for Reviewer ${isRev1Stage1Submitted ? '2' : '1'} (Cannot Send)`
                  : 'Dispatch Consolidated Feedback to Author'}
              </span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reject */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Manuscript"
        subtitle={`Manuscript: ${manuscript.id}`}
        size="md"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Provide the formal editorial reason for rejection (required):
          </p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="State the scientific grounds or scope limitations..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Publish */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Manuscript Online"
        subtitle={`Issue DOI and publication volume for ${manuscript.id}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Digital Object Identifier (DOI):
            </label>
            <input
              type="text"
              value={publishForm.doi}
              onChange={(e) => setPublishForm({ ...publishForm, doi: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Volume:</label>
              <input
                type="text"
                value={publishForm.volume}
                onChange={(e) => setPublishForm({ ...publishForm, volume: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Issue:</label>
              <input
                type="text"
                value={publishForm.issue}
                onChange={(e) => setPublishForm({ ...publishForm, issue: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPublish}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
            >
              Publish to Open Access
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
