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
} from 'lucide-react';

export const ReviewerManuscriptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const { reviews } = useAppSelector((state) => state.reviews);
  const manuscript = manuscripts.find((m) => m.id === id);

  const [existingReport, setExistingReport] = useState<ReviewReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReReviewForm, setShowReReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      if (!manuscript || manuscript.id !== id) {
        dispatch(fetchManuscriptById(id));
      }
      dispatch(fetchReviewsByManuscript(id));
    }
  }, [id, dispatch, manuscript?.status]);

  useEffect(() => {
    if (reviews && user) {
      const mine = reviews.find((r) => r.reviewerId === user.id || r.reviewerName?.toLowerCase() === user.name?.toLowerCase());
      if (mine) setExistingReport(mine);
    }
  }, [reviews, user]);

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

  const isRevisionSubmitted = manuscript.status === 'Revision Submitted';
  const needsReReview = isRevisionSubmitted && (!existingReport || showReReviewForm);

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
      }
      setShowReReviewForm(false);
    } catch (err: any) {
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestFile = manuscript.revisedFiles && manuscript.revisedFiles.length > 0
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

          {/* Corresponding Author info card */}
          {manuscript.author && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 shrink-0 md:w-72">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Corresponding Author
              </span>
              <p className="font-bold text-slate-900">{manuscript.author.name}</p>
              <p className="text-slate-500 truncate">{manuscript.author.institution}</p>
              {manuscript.author.department && (
                <p className="text-[11px] text-slate-400 truncate">{manuscript.author.department}</p>
              )}
              <p className="font-mono text-[11px] text-slate-500 truncate">{manuscript.author.email}</p>
              {manuscript.author.orcid && (
                <p className="text-[10px] text-indigo-600 font-mono">ORCID: {manuscript.author.orcid}</p>
              )}
              {manuscript.coauthors && (
                <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
                  <span className="font-semibold text-slate-700">Co-Authors: </span>
                  {manuscript.coauthors}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => manuscriptService.downloadFile(latestFile.url || latestFile.name, latestFile.name)}
              className="px-4 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {isRevisionSubmitted ? 'Revised Paper' : 'Manuscript'}</span>
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

      {/* Author Resubmission Notice & Response to Reviewer Comments (Round 2) */}
      {isRevisionSubmitted && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Author Revised Manuscript &amp; Rebuttal Submitted (Round 2)</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
              Awaiting Re-evaluation
            </span>
          </div>

          {manuscript.authorRevisionResponse && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>Author's Point-by-Point Response to Reviewer Comments:</span>
              </span>
              <div className="p-4 bg-white border border-amber-200 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed font-sans shadow-xs">
                {manuscript.authorRevisionResponse}
              </div>
            </div>
          )}

          {manuscript.revisedFiles && manuscript.revisedFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-xl text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[10px] block">Uploaded Revised File:</span>
                <span className="font-mono font-bold text-indigo-700">{latestFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => manuscriptService.downloadFile(latestFile.url || latestFile.name, latestFile.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0d3b6e] text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-[#092b52]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Revised File</span>
              </button>
            </div>
          )}

          {!showReReviewForm && existingReport && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReReviewForm(true)}
                className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Round 2 Re-evaluation Form</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Form or Submitted Report State */}
      {existingReport && !showReReviewForm && !needsReReview ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Peer Review Report Submitted to Editor</span>
            </div>
            {isRevisionSubmitted && (
              <button
                type="button"
                onClick={() => setShowReReviewForm(true)}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Re-evaluate Revision (Round 2)
              </button>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Your Recommendation to Editor:</span>
              <span className="font-bold text-indigo-700 text-sm">
                {existingReport.recommendation}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Technical Rigor</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {existingReport.technicalQuality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Originality</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {existingReport.originality} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Clarity</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {existingReport.clarity} / 5
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Comments for Authors (Relayed anonymously through Editor):
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{existingReport.commentsForAuthor}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-700 font-bold block">
                Confidential Summary for Editor-in-Chief:
              </span>
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{existingReport.commentsForEditor}</p>
            </div>
          </div>
        </div>
      ) : (
        <ReviewForm
          manuscriptId={manuscript.id}
          manuscriptTitle={manuscript.title}
          reviewerId={user?.id || 'rev_01'}
          reviewerName={user?.name || 'Dr. Meera Iyer'}
          isRoundTwo={isRevisionSubmitted}
          authorReplyText={manuscript.authorRevisionResponse}
          onSubmit={handleReviewSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};
