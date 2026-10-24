import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchManuscriptById,
  assignManuscriptReviewer,
  requestManuscriptRevision,
  acceptManuscriptThunk,
  rejectManuscriptThunk,
  publishManuscriptThunk,
} from '../../store/slices/manuscriptSlice';
import { fetchReviewsByManuscript } from '../../store/slices/reviewSlice';
import { manuscriptService } from '../../services/manuscriptService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssignReviewerModal } from '../../components/modals/AssignReviewerModal';
import { Modal } from '../../components/common/Modal';
import { ReviewReport } from '../../types/review.types';
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

  const handleAssignReviewer = async (reviewerId: string, reviewerName: string) => {
    await dispatch(
      assignManuscriptReviewer({
        manuscriptId: manuscript.id,
        reviewerId,
        reviewerName,
      })
    );
  };

  const handleConfirmRevision = async () => {
    if (!revisionComments.trim()) return;
    await dispatch(
      requestManuscriptRevision({
        manuscriptId: manuscript.id,
        comments: revisionComments.trim(),
        editorName: user?.name || 'Editor-in-Chief',
      })
    );
    setIsRevisionModalOpen(false);
    setRevisionComments('');
  };

  const handleForwardToReviewer = async () => {
    if (!manuscript.assignedReviewerId && !manuscript.assignedReviewerName) return;
    await dispatch(
      assignManuscriptReviewer({
        manuscriptId: manuscript.id,
        reviewerId: manuscript.assignedReviewerId || 'rev_01',
        reviewerName: manuscript.assignedReviewerName || 'Dr. Meera Iyer',
        deadlineDays: 7,
      })
    );
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    await dispatch(
      rejectManuscriptThunk({
        manuscriptId: manuscript.id,
        reason: rejectionReason.trim(),
        editorName: user?.name || 'Editor-in-Chief',
      })
    );
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const handleConfirmPublish = async () => {
    await dispatch(
      publishManuscriptThunk({
        manuscriptId: manuscript.id,
        details: publishForm,
        editorName: user?.name || 'Editor-in-Chief',
      })
    );
    setIsPublishModalOpen(false);
  };

  const handleAccept = async () => {
    await dispatch(
      acceptManuscriptThunk({
        manuscriptId: manuscript.id,
        editorName: user?.name || 'Editor-in-Chief',
      })
    );
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
            <p className="font-bold text-slate-900">{manuscript.author.name}</p>
            <p className="text-slate-500 truncate">{manuscript.author.institution}</p>
            <p className="font-mono text-[11px] text-slate-500 truncate">{manuscript.author.email}</p>
            {manuscript.author.orcid && (
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
                onClick={handleForwardToReviewer}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Forward to Reviewer for Re-check (Round 2)</span>
              </button>
            )}

            {/* Request Revision */}
            {['Under Review', 'Review Completed', 'Editor Assessment', 'Revision Submitted'].includes(manuscript.status) && (
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                <span>Request Author Revisions</span>
              </button>
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
                  onClick={() => manuscriptService.downloadFile(manuscript.file.url || manuscript.file.name, manuscript.file.name)}
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
                    onClick={() => manuscriptService.downloadFile(rf.url || rf.name, rf.name)}
                    className="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Revision</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Peer Review Assignment
              </h3>
              {manuscript.assignedReviewerName ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{manuscript.assignedReviewerName}</p>
                  <p className="text-slate-500">Assigned: {manuscript.assignedDate}</p>
                  <p className="text-slate-500">Deadline: {manuscript.reviewDeadline}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No reviewer currently assigned.</p>
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
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {rev.reviewerName}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
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

                {/* Ratings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Technical Rigor
                    </span>
                    <span className="text-base font-extrabold text-indigo-700">
                      {rev.technicalQuality} / 5
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Originality
                    </span>
                    <span className="text-base font-extrabold text-indigo-700">
                      {rev.originality} / 5
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Clarity &amp; Presentation
                    </span>
                    <span className="text-base font-extrabold text-indigo-700">
                      {rev.clarity} / 5
                    </span>
                  </div>
                </div>

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

      {/* MODAL: Request Revision */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Pass Comments to Author (Request Revisions)"
        subtitle={`Manuscript: ${manuscript.id}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Double-Blind Notice */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-purple-900">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Double-Blind Peer Review Guarantee:</strong> All comments forwarded to the author are strictly attributed as <strong>"Reviewer 1"</strong>. Reviewer personal identity is NEVER disclosed.
            </p>
          </div>

          {/* Reviewer Feedback Importer */}
          {reviews.length > 0 && reviews[0]?.commentsForAuthor && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Received Reviewer Feedback for Author:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const template = `Reviewer 1 Comments:\n${reviews[0].commentsForAuthor}\n\nEditorial Directive:\nPlease provide a point-by-point response and submit the revised manuscript within 7 days.`;
                    setRevisionComments(template);
                  }}
                  className="px-2.5 py-1 bg-[#0d3b6e] hover:bg-[#092b52] text-white rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  Import Reviewer Comments
                </button>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto font-sans">
                {reviews[0].commentsForAuthor}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              Revision Directives to Forward to Author *
            </label>
            <textarea
              rows={5}
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              placeholder="Enter or customize the comments to be forwarded anonymously to the author..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevision}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Dispatch Revision Request to Author
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
