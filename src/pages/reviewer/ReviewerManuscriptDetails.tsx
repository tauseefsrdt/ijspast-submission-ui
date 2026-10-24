import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { submitReviewReport, fetchReviewsByManuscript } from '../../store/slices/reviewSlice';
import { fetchReviewerManuscripts, fetchManuscriptById } from '../../store/slices/manuscriptSlice';
import { ReviewForm } from '../../components/forms/ReviewForm';
import { manuscriptService } from '../../services/manuscriptService';
import { ReviewReport, ReviewRecommendation } from '../../types/review.types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Shield,
  Star,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const ReviewerManuscriptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const { reviews } = useAppSelector((state) => state.reviews);
  const manuscript = manuscripts.find((m) => m.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStageForm, setActiveStageForm] = useState<1 | 2 | null>(null);

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
          onClick={() => navigate('/reviewer/dashboard')}
          className="px-4 py-2 bg-[#0d3b6e] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Return to Reviewer Dashboard
        </button>
      </div>
    );
  }

  // Filter this reviewer's reports
  const myReports = (reviews || []).filter(
    (r) =>
      r.reviewerId === user?.id ||
      r.reviewerName?.toLowerCase() === user?.name?.toLowerCase()
  );

  const stage1Report = myReports.find((r) => r.stage === 1 || (!r.stage && myReports.length === 1));
  const stage2Report = myReports.find((r) => r.stage === 2);

  const isRevisionSubmitted = manuscript.status === 'Revision Submitted';
  const isRevisionForwarded = Boolean(manuscript.revisionForwardedToReviewer);

  const handleReviewSubmit = async (reportData: {
    manuscriptId: string;
    reviewerId: string;
    reviewerName: string;
    recommendation: ReviewRecommendation;
    technicalQuality: number;
    originality: number;
    clarity: number;
    commentsForEditor: string;
    commentsForAuthor: string;
    confidentialComments?: string;
    stage?: number;
    stageName?: string;
    rubricScores?: number[];
    overallScore?: number;
  }) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        submitReviewReport({
          manuscriptId: reportData.manuscriptId,
          report: reportData,
        })
      ).unwrap();
      await dispatch(fetchReviewerManuscripts());
      if (id) {
        await dispatch(fetchManuscriptById(id));
        await dispatch(fetchReviewsByManuscript(id));
      }
      setActiveStageForm(null);
    } catch (err: any) {
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only expose revised file if Editor has explicitly forwarded it
  const latestFile =
    isRevisionForwarded && manuscript.revisedFiles && manuscript.revisedFiles.length > 0
      ? manuscript.revisedFiles[manuscript.revisedFiles.length - 1]
      : manuscript.file;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/reviewer/dashboard')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Reviewer Dashboard</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                {manuscript.id}
              </span>
              <StatusBadge status={manuscript.status} size="md" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Peer Review Workspace</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d3b6e] tracking-tight leading-snug">
              {manuscript.title}
            </h1>

            <p className="text-xs text-slate-500">
              Subject Domain: <strong className="text-slate-700">{manuscript.domain}</strong> • Due Date: {manuscript.reviewDeadline || 'Within 14 days'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => manuscriptService.downloadFile(latestFile.url || latestFile.name, latestFile.name)}
              className="px-4 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {isRevisionForwarded ? 'Revised Paper' : 'Manuscript'}</span>
            </button>
          </div>
        </div>

        {/* Abstract Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Manuscript Abstract
          </span>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {manuscript.abstract}
          </p>

          <div className="pt-2 flex flex-wrap gap-1.5">
            {manuscript.keywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium text-[11px]">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Stage Review Progress Tracker */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Two-Stage Review Workflow</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Mandatory protocol: Submit preliminary feedback in Stage 1, followed by comprehensive in-depth scorecard in Stage 2.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                stage1Report && stage2Report
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : stage1Report
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {stage1Report && stage2Report
                ? 'Both Stages Completed (2/2)'
                : stage1Report
                ? 'Stage 1 Completed • Stage 2 Pending (1/2)'
                : 'Awaiting Stage 1 Submission (0/2)'}
            </span>
          </div>
        </div>

        {/* Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              stage1Report
                ? 'bg-white border-emerald-200 ring-2 ring-emerald-500/10'
                : 'bg-white border-blue-200 ring-2 ring-blue-500/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                <Layers className="w-3 h-3 text-blue-600" />
                <span>Stage 1: Initial Assessment</span>
              </span>
              {stage1Report ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Action Required</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Preliminary technical screening, novelty evaluation, and initial recommendation for the Editorial Board.
            </p>

            {stage1Report ? (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">
                  Recommendation: <strong className="text-indigo-700">{stage1Report.recommendation}</strong>
                </span>
                <span className="text-slate-400">
                  Submitted: {stage1Report.submittedAt?.split('T')[0] || 'Logged'}
                </span>
              </div>
            ) : (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStageForm(1)}
                  className="px-4 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Start Stage 1 Form
                </button>
              </div>
            )}
          </div>

          {/* Step 2 Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              stage2Report
                ? 'bg-white border-emerald-200 ring-2 ring-emerald-500/10'
                : stage1Report
                ? 'bg-white border-indigo-200 ring-2 ring-indigo-500/10'
                : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                <Layers className="w-3 h-3 text-purple-600" />
                <span>Stage 2: Final Evaluation</span>
              </span>
              {stage2Report ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Completed</span>
                </span>
              ) : stage1Report ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ready to Submit</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  Locked (Complete Stage 1 first)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Comprehensive 11-point scorecard, section-by-section critique for authors, and final publication verdict.
            </p>

            {stage2Report ? (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">
                  Verdict: <strong className="text-emerald-700">{stage2Report.recommendation}</strong>
                </span>
                <span className="text-slate-400">
                  Submitted: {stage2Report.submittedAt?.split('T')[0] || 'Logged'}
                </span>
              </div>
            ) : stage1Report ? (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStageForm(2)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Start Stage 2 Form
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Author Revision Rebuttal banner or Editorial Assessment notice */}
      {isRevisionSubmitted && !isRevisionForwarded && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200 pb-3">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Author Resubmission Under Editorial Assessment</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Pending Editor Verification
            </span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            The author has submitted a revised manuscript following editorial revision requests. The resubmitted paper is currently undergoing preliminary editorial assessment by the Editor-in-Chief. Once verified, the Editor will explicitly forward the updated manuscript and rebuttal notes to you for formal re-evaluation.
          </p>
        </div>
      )}

      {isRevisionForwarded && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Author Revised Manuscript &amp; Rebuttal (Forwarded by Editor)</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
              Ready for Re-evaluation
            </span>
          </div>

          {manuscript.authorRevisionResponse && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>Author's Response to Reviewer Feedback:</span>
              </span>
              <div className="p-4 bg-white border border-amber-200 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed font-sans shadow-xs">
                {manuscript.authorRevisionResponse}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Active Review Form if chosen */}
      {activeStageForm ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Entering Feedback for Stage {activeStageForm}
            </h3>
            <button
              type="button"
              onClick={() => setActiveStageForm(null)}
              className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel Form
            </button>
          </div>
          <ReviewForm
            manuscriptId={manuscript.id}
            manuscriptTitle={manuscript.title}
            reviewerId={user?.id || 'reviewer'}
            reviewerName={user?.name || 'Peer Reviewer'}
            stage={activeStageForm}
            isRoundTwo={isRevisionForwarded}
            authorReplyText={isRevisionForwarded ? manuscript.authorRevisionResponse : undefined}
            onSubmit={handleReviewSubmit}
            isLoading={isSubmitting}
          />
        </div>
      ) : null}

      {/* Display Stage 1 Submitted Card */}
      {stage1Report && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>Stage 1 Evaluation Report Submitted to Editor</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Stage 1: {stage1Report.recommendation}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Technical Rigor</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage1Report.technicalQuality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Originality</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage1Report.originality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Clarity</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage1Report.clarity} / 5
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Stage 1 Comments for Authors:
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{stage1Report.commentsForAuthor}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Stage 1 Confidential Remarks for Editor:
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{stage1Report.commentsForEditor}</p>
            </div>
          </div>
        </div>
      )}

      {/* Display Stage 2 Submitted Card */}
      {stage2Report && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Stage 2 Final Evaluation Report Submitted to Editor</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Stage 2 Verdict: {stage2Report.recommendation}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Technical Rigor</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage2Report.technicalQuality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Originality</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage2Report.originality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Clarity</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {stage2Report.clarity} / 5
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Stage 2 Comprehensive Comments for Authors:
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{stage2Report.commentsForAuthor}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Stage 2 Confidential Summary for Editor:
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{stage2Report.commentsForEditor}</p>
            </div>
          </div>
        </div>
      )}

      {/* If Neither Form is Active and Stage 1 Not Yet Submitted */}
      {!stage1Report && !activeStageForm && (
        <ReviewForm
          manuscriptId={manuscript.id}
          manuscriptTitle={manuscript.title}
          reviewerId={user?.id || 'reviewer'}
          reviewerName={user?.name || 'Peer Reviewer'}
          stage={1}
          isRoundTwo={isRevisionForwarded}
          authorReplyText={isRevisionForwarded ? manuscript.authorRevisionResponse : undefined}
          onSubmit={handleReviewSubmit}
          isLoading={isSubmitting}
        />
      )}

      {/* If Stage 1 is Submitted but Stage 2 is not and form not open */}
      {stage1Report && !stage2Report && !activeStageForm && (
        <div className="p-8 text-center bg-white border border-indigo-200 rounded-2xl space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              Stage 1 Complete: Ready for Stage 2 Final Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Your initial feedback has been submitted to the Editor. Please now submit your comprehensive Stage 2 evaluation scorecard to finalize your review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveStageForm(2)}
            className="px-6 py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Proceed to Stage 2 Final Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
