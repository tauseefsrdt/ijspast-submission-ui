import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Download,
  Send,
  Users,
  Eye,
  CreditCard,
  BookOpen,
  History,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Printer,
  ChevronRight,
  MessageSquare,
  FileCheck,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrcidBadge } from '../components/common/OrcidBadge';
import { TimeTag } from '../components/common/TimeTag';
import { Modal } from '../components/common/Modal';
import { InvoiceView } from '../components/common/InvoiceView';
import { QrCode } from '../components/common/QrCode';
import {
  CRITERIA,
  BASE_DATE,
  getDateString,
  formatINR,
  STATUS_OWNERS,
} from '../constants/initialData';

export function ManuscriptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data,
    showToast,
    recordSimilarity,
    editorPushBack,
    editorReject,
    authorResubmitPushback,
    authorResubmitRejected,
    editorForwardToReviewers,
    editorSendComments,
    authorSubmitReply,
    editorForwardRevision,
    editorFinalDecision,
    authorSubmitCameraReady,
    editorUploadFormatted,
    authorApproveProof,
    authorRequestChanges,
    processPayment,
    editorPublish,
    registerReviewer,
  } = useApp();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'files' | 'reviews' | 'trail'

  // Modals state
  const [modalType, setModalType] = useState(null); // 'pushback' | 'reject' | 'forward' | 'payment' | 'publish' | 'register_reviewer' | 'changes' | 'invoice_preview'
  const [formInput, setFormInput] = useState({});

  const papers = data?.papers || [];
  const currentDay = data?.day || 0;
  const limits = data?.limits || {};
  const currentRole = data?.session?.role || 'admin';
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Manuscript Not Found</h3>
        <p className="text-sm text-slate-500">
          No manuscript with ID <span className="font-mono font-bold text-indigo-700">{id}</span> exists.
        </p>
        <button
          type="button"
          onClick={() => navigate('/manuscripts')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Manuscripts</span>
        </button>
      </div>
    );
  }

  const reviewers = data?.reviewers || [];
  const currentStatus = paper.status;
  const currentOwner = STATUS_OWNERS[currentStatus] || 'Editor';

  // Fee calculation helper
  const calc = paper.calc || {
    pages: paper.pages || 10,
    limit: 10,
    baseAmt: 5000,
    rate: 500,
    ex: Math.max(0, (paper.pages || 10) - 10),
    sub: 5000 + Math.max(0, (paper.pages || 10) - 10) * 500,
    total: 5000 + Math.max(0, (paper.pages || 10) - 10) * 500,
  };

  // Workflow Stage Steps
  const workflowSteps = [
    { name: 'Screening', active: ['Under Screening', 'Pushed Back'].includes(currentStatus) },
    {
      name: 'Peer Review',
      active: [
        'Sent to Reviewers',
        'Review Received',
        'Comments Sent',
        'Revision Received',
        'Re-review',
        'Reviews Complete',
      ].includes(currentStatus),
    },
    { name: 'Decision', active: ['Reviews Complete', 'Accepted'].includes(currentStatus) },
    {
      name: 'Camera-Ready & Proofing',
      active: [
        'Camera-Ready Received',
        'Proofreading',
        'Changes Requested',
      ].includes(currentStatus),
    },
    {
      name: 'APC Billing',
      active: ['Payment Pending', 'Paid'].includes(currentStatus),
    },
    { name: 'Published', active: currentStatus === 'Published' },
  ];

  // Helper actions
  const handleRecordSimilarity = (val) => {
    const num = Number(val);
    if (isNaN(num) || num < 0 || num > 100) {
      showToast('Enter similarity percentage between 0 and 100%');
      return;
    }
    recordSimilarity(paper.id, num);
    showToast(`Similarity check recorded: ${num}%`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/manuscripts')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manuscripts</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/outbox?q=${encodeURIComponent(paper.id)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>View Related Emails</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                {paper.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] tracking-wider uppercase ${
                  paper.journal === 'IJMAR'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {paper.journal}
              </span>
              <StatusBadge status={paper.status} size="md" />
              <TimeTag
                due={paper.due}
                dueMax={paper.dueMax}
                currentDay={currentDay}
                size="md"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {paper.title}
            </h1>

            <p className="text-xs font-medium text-slate-500">
              Subject Domain: <strong className="text-slate-700">{paper.domain}</strong> • Submitted:{' '}
              {getDateString(BASE_DATE, paper.day0)} (Day 0)
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 text-xs space-y-2 shrink-0 md:w-72">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Corresponding Author
              </span>
              <OrcidBadge orc={paper.orc} orcid={paper.author.orcid} size="sm" />
            </div>
            <p className="font-bold text-slate-900 text-sm">{paper.author.name}</p>
            <p className="text-slate-600 line-clamp-1">{paper.author.inst}</p>
            <p className="text-slate-500 font-mono text-[11px] truncate">{paper.author.email}</p>
          </div>
        </div>

        {/* Workflow Lifecycle Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.name}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  step.active
                    ? 'bg-indigo-600 text-white font-bold border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-80">Step {idx + 1}</div>
                <div className="text-xs truncate">{step.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC ACTION CENTER: State-specific editorial / author workstation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Current Workflow Desk ({currentStatus})
              </h3>
              <p className="text-xs text-slate-300">
                Action currently residing with:{' '}
                <strong className="text-amber-300 font-semibold">{currentOwner}</strong>
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            {paper.due !== null && (
              <span>
                Target SLA:{' '}
                <strong className="text-white font-mono">{getDateString(BASE_DATE, paper.due)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* 1. UNDER SCREENING */}
        {currentStatus === 'Under Screening' && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Editorial Screening &amp; Plagiarism Benchmark Check
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The editor manually verifies the manuscript scope, format compliance, and similarity check against the 10% benchmark.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-300">Similarity Check:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={paper.sim ?? ''}
                    placeholder="%"
                    id="sim_input"
                    className="w-16 px-2 py-1 text-xs bg-white text-slate-900 font-bold rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('sim_input');
                      if (el) handleRecordSimilarity(el.value);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                  >
                    Save %
                  </button>
                </div>

                {paper.sim !== null && paper.sim !== undefined && (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      paper.sim <= 10
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {paper.sim}% Similarity ({paper.sim <= 10 ? 'Within 10% Benchmark' : 'Above 10% Threshold'})
                  </span>
                )}
              </div>
            </div>

            {/* Screening Decision Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setModalType('forward')}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Forward to 2 Reviewers</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('pushback')}
                disabled={paper.pushbacks >= (limits.maxPushback || 2)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  paper.pushbacks >= (limits.maxPushback || 2)
                    ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>
                  Push Back to Author ({paper.pushbacks}/{limits.maxPushback || 2} used)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('reject')}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Paper</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PUSHED BACK (AUTHOR ACTION) */}
        {currentStatus === 'Pushed Back' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-200 text-xs">
              <strong>Returned by Editor:</strong> Please address editorial remarks and resubmit corrected manuscript.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Updated Title (optional):</label>
                <input
                  type="text"
                  defaultValue={paper.title}
                  id="pb_resub_title"
                  className="w-full text-xs p-2.5 bg-black/40 border border-white/20 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Upload Corrected File (.doc, .docx, .pdf):</label>
                <input
                  type="file"
                  id="pb_resub_file"
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const title = document.getElementById('pb_resub_title')?.value || paper.title;
                  const fileEl = document.getElementById('pb_resub_file');
                  const fileName = fileEl?.files?.[0]?.name || `corrected_${paper.id}.docx`;
                  authorResubmitPushback(paper.id, title, paper.abstract, fileName);
                  showToast('Corrected manuscript resubmitted to editor for screening');
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all cursor-pointer"
              >
                Resubmit to Editor
              </button>
            </div>
          </div>
        )}

        {/* 3. SENT TO REVIEWERS / RE-REVIEW */}
        {(currentStatus === 'Sent to Reviewers' || currentStatus === 'Re-review') && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              Double-Blind Peer Review in Progress (Round {paper.round})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paper.reviewers.map((rId, idx) => {
                const rObj = reviewers.find((r) => r.id === rId);
                const hasSubmitted = (paper.reviews || []).some(
                  (v) => v.rid === rId && v.round === paper.round
                );
                return (
                  <div
                    key={rId}
                    className="p-3 bg-black/30 rounded-xl border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Reviewer {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-white">
                        {currentRole === 'author' ? `Anonymous Reviewer ${idx + 1}` : rObj?.name || rId}
                      </p>
                      <p className="text-[11px] text-slate-400">{rObj?.domain}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        hasSubmitted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {hasSubmitted ? 'Review Submitted' : 'Pending Review'}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              Double-blind integrity maintained: Reviewer credentials and login links were dispatched via the automated email outbox.
            </p>
          </div>
        )}

        {/* 4. REVIEW RECEIVED (EDITOR PASSES COMMENTS) */}
        {currentStatus === 'Review Received' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              Both Peer Reviews Received: Select Comments to Dispatch
            </h4>
            <p className="text-xs text-slate-300">
              In accordance with BRD Section 7.3, the editor curates and passes comments without revealing reviewer identities to the author.
            </p>

            <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/10 max-h-60 overflow-y-auto">
              {(paper.reviews || [])
                .filter((v) => v.round === 1)
                .map((v, i) => (
                  <div key={i} className="text-xs border-b border-white/10 pb-2 mb-2 last:border-0">
                    <span className="font-bold text-indigo-300 block mb-1">
                      Reviewer {paper.reviewers.indexOf(v.rid) + 1} ({v.rec}):
                    </span>
                    <p className="text-slate-200 whitespace-pre-wrap">{v.toAuthor}</p>
                  </div>
                ))}
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Editorial Note / Instructions to Author:</label>
              <textarea
                id="ed_note_input"
                defaultValue="Please revise your manuscript in accordance with the reviewer comments above and submit your point-by-point reply within 7 days."
                className="w-full text-xs p-2.5 bg-black/40 border border-white/20 rounded-xl text-white"
                rows={2}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const note = document.getElementById('ed_note_input')?.value || '';
                const lines = [];
                (paper.reviews || [])
                  .filter((v) => v.round === 1)
                  .forEach((v) => {
                    v.toAuthor
                      .split('\n')
                      .filter((x) => x.trim())
                      .forEach((t) => {
                        lines.push({
                          f: `Reviewer ${paper.reviewers.indexOf(v.rid) + 1}`,
                          t: t.trim(),
                        });
                      });
                  });
                editorSendComments(paper.id, lines, note);
                showToast('Reviewer comments and editorial note dispatched to author');
              }}
              className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all cursor-pointer"
            >
              Send Comments to Author
            </button>
          </div>
        )}

        {/* 5. COMMENTS SENT (AUTHOR ACTION) */}
        {currentStatus === 'Comments Sent' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Action Required: Author Revision &amp; Point-by-Point Reply
            </h4>

            {paper.sent && paper.sent.length > 0 && (
              <div className="p-3 bg-black/30 rounded-xl border border-white/10 space-y-2 text-xs">
                <span className="font-bold text-amber-300 block">Reviewer Feedback:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-200">
                  {paper.sent[paper.sent.length - 1].lines.map((l, i) => (
                    <li key={i}>
                      <strong>{l.f}:</strong> {l.t}
                    </li>
                  ))}
                </ul>
                {paper.sent[paper.sent.length - 1].note && (
                  <p className="text-slate-300 italic pt-1 border-t border-white/10">
                    Editor Note: {paper.sent[paper.sent.length - 1].note}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Point-by-Point Author Response:</label>
                <textarea
                  id="author_reply_text"
                  placeholder="Address each reviewer critique specifically..."
                  className="w-full text-xs p-2.5 bg-black/40 border border-white/20 rounded-xl text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Upload Revised Manuscript (Word or PDF):</label>
                <input
                  type="file"
                  id="author_revised_file"
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const replyText =
                    document.getElementById('author_reply_text')?.value ||
                    'All reviewer comments addressed in the revised manuscript.';
                  const fileEl = document.getElementById('author_revised_file');
                  const fileName = fileEl?.files?.[0]?.name || `revised_${paper.id}.docx`;
                  authorSubmitReply(paper.id, replyText, paper.title, fileName);
                  showToast('Author reply and revised paper submitted to editor');
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all cursor-pointer"
              >
                Submit Revisions &amp; Author Reply
              </button>
            </div>
          </div>
        )}

        {/* 6. REVISION RECEIVED (EDITOR FORWARDS TO REVIEWERS) */}
        {currentStatus === 'Revision Received' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Author Revision Received: Forward for Round 2 Re-Review
            </h4>

            {paper.replies && paper.replies.length > 0 && (
              <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-400 font-bold block mb-1">Author's Response Note:</span>
                <p className="text-slate-200">{paper.replies[paper.replies.length - 1].text}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                editorForwardRevision(paper.id);
                showToast('Revision forwarded to reviewers for Round 2 re-check');
              }}
              className="px-4 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all cursor-pointer"
            >
              Forward Revision for Round 2 Re-Review
            </button>
          </div>
        )}

        {/* 7. REVIEWS COMPLETE (EDITOR FINAL DECISION) */}
        {currentStatus === 'Reviews Complete' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Peer Review Concluded: Editorial Board Final Decision
            </h4>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Editorial Board Decision Notes (optional):</label>
              <textarea
                id="final_decision_notes"
                placeholder="Congratulations, your paper has met the rigorous standards of the journal..."
                className="w-full text-xs p-2.5 bg-black/40 border border-white/20 rounded-xl text-white"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const comment = document.getElementById('final_decision_notes')?.value || '';
                  editorFinalDecision(paper.id, true, comment);
                  showToast('Paper accepted! Camera-ready Word manuscript requested from author');
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all cursor-pointer"
              >
                Accept Manuscript
              </button>

              <button
                type="button"
                onClick={() => {
                  const comment = document.getElementById('final_decision_notes')?.value || '';
                  editorFinalDecision(paper.id, false, comment);
                  showToast('Paper rejected following peer review');
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all cursor-pointer"
              >
                Reject Manuscript
              </button>
            </div>
          </div>
        )}

        {/* 8. ACCEPTED (AUTHOR UPLOADS CAMERA-READY) */}
        {currentStatus === 'Accepted' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-200 text-xs">
              <strong>Manuscript Accepted!</strong> Author must upload the final Camera-Ready Word document in the official journal format.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Upload Final Camera-Ready Manuscript (.doc, .docx):
                </label>
                <input
                  type="file"
                  id="camera_ready_file"
                  accept=".doc,.docx"
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const fileEl = document.getElementById('camera_ready_file');
                  const fileName = fileEl?.files?.[0]?.name || `camera_ready_${paper.id}.docx`;
                  authorSubmitCameraReady(paper.id, fileName);
                  showToast('Camera-ready manuscript uploaded');
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl transition-all cursor-pointer"
              >
                Upload Camera-Ready Paper
              </button>
            </div>
          </div>
        )}

        {/* 9. CAMERA-READY RECEIVED / CHANGES REQUESTED (EDITOR FORMATS & COMPUTES FEE) */}
        {(currentStatus === 'Camera-Ready Received' || currentStatus === 'Changes Requested') && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Typesetting &amp; Final Page Verification (Proof Exchange {(paper.proof || 0) + 1} of {limits.maxProof || 5})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Formatted Typeset File (.doc, .docx):</label>
                <input
                  type="file"
                  id="fmt_file"
                  className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Verified Final Page Count:</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={paper.pages || 10}
                  id="fmt_pages"
                  className="w-full text-xs p-2 bg-black/40 border border-white/20 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Fee Override (optional INR):</label>
                <input
                  type="number"
                  placeholder="Leave empty for auto"
                  defaultValue={paper.override ?? ''}
                  id="fmt_override"
                  className="w-full text-xs p-2 bg-black/40 border border-white/20 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Reason for Override (if amount altered):</label>
              <input
                type="text"
                id="fmt_why"
                placeholder="e.g. Authorized institutional waiver / editorial concession"
                className="w-full text-xs p-2 bg-black/40 border border-white/20 rounded-xl text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const fileEl = document.getElementById('fmt_file');
                const fileName = fileEl?.files?.[0]?.name || `formatted_${paper.id}.docx`;
                const pages = Number(document.getElementById('fmt_pages')?.value) || 10;
                const ovVal = document.getElementById('fmt_override')?.value;
                const ovReason = document.getElementById('fmt_why')?.value;
                const overrideAmt = ovVal !== '' && !isNaN(Number(ovVal)) ? Number(ovVal) : null;

                if (overrideAmt !== null && !ovReason) {
                  showToast('Please provide a reason for overriding the computed fee');
                  return;
                }

                editorUploadFormatted(paper.id, fileName, pages, overrideAmt, ovReason);
                showToast('Formatted paper sent to author for proofreading and APC approval');
              }}
              className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all cursor-pointer"
            >
              Send for Author Proofreading &amp; Fee Approval
            </button>
          </div>
        )}

        {/* 10. PROOFREADING (AUTHOR APPROVES OR REQUESTS CHANGES) */}
        {currentStatus === 'Proofreading' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Proofreading &amp; Invoice Preview
            </h4>
            <p className="text-xs text-slate-300">
              Check the formatted paper. If satisfied, click <strong>OK, I Approve</strong> to freeze the calculated APC and generate the official payment invoice.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setModalType('invoice_preview')}
                className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>Preview APC Invoice ({formatINR(paper.override != null ? paper.override : calc.total)})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  authorApproveProof(paper.id);
                  showToast('Proof approved! Official invoice generated. Ready for payment.');
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>OK, I Approve (Freeze Fee &amp; Issue Invoice)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('changes')}
                disabled={(paper.proof || 0) >= (limits.maxProof || 5)}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Changes Needed ({(paper.proof || 0)}/{limits.maxProof || 5})</span>
              </button>
            </div>
          </div>
        )}

        {/* 11. PAYMENT PENDING (PAY VIA UPI QR) */}
        {currentStatus === 'Payment Pending' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Publication Fee Pending Settlement
                </h4>
                <p className="text-xs text-slate-300">
                  Invoice <strong className="text-white font-mono">{paper.invoice?.no}</strong> for{' '}
                  <strong className="text-amber-300">{formatINR(paper.invoice?.total || calc.total)}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalType('invoice_preview')}
                  className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  View Invoice Document
                </button>

                <button
                  type="button"
                  onClick={() => setModalType('payment')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Scan &amp; Pay APC Online</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 12. PAID (EDITOR PUBLISHES ONLINE) */}
        {currentStatus === 'Paid' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>APC Payment Verified by System</span>
              </div>
              <p className="text-xs text-slate-300">
                Settled on Day {paper.paidDay || currentDay}. Ready for publication with DOI assignment.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalType('invoice_preview')}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                View Paid Receipt
              </button>

              <button
                type="button"
                onClick={() => setModalType('publish')}
                className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Publish Paper Online</span>
              </button>
            </div>
          </div>
        )}

        {/* 13. PUBLISHED */}
        {currentStatus === 'Published' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-300 text-sm font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Live in Journal Digital Repository</span>
              </div>
              <p className="text-xs text-slate-300">
                Official DOI: <strong className="text-white font-mono">{paper.doi || '10.srmu.org/pending'}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/published')}
              className="px-4 py-2 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl transition-all cursor-pointer"
            >
              Open in Published Library
            </button>
          </div>
        )}

        {/* 14. REJECTED (AUTHOR RESUBMISSION) */}
        {currentStatus === 'Rejected' && (
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 space-y-4">
            <div className="p-3 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-200 text-xs">
              <strong>Manuscript Rejected:</strong> Under SRMU editorial guidelines (BRD Section 12), you may resubmit under the same Paper ID ({paper.id}). Day 0 will restart, and earlier reviews are archived in the audit record.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Revised Paper Title (optional):</label>
                <input
                  type="text"
                  defaultValue={paper.title}
                  id="rej_resub_title"
                  className="w-full text-xs p-2.5 bg-black/40 border border-white/20 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Upload Revised Manuscript File:</label>
                <input
                  type="file"
                  id="rej_resub_file"
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-slate-900 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const title = document.getElementById('rej_resub_title')?.value || paper.title;
                  const fileEl = document.getElementById('rej_resub_file');
                  const fileName = fileEl?.files?.[0]?.name || `resubmitted_${paper.id}.docx`;
                  authorResubmitRejected(paper.id, title, fileName);
                  showToast(`Manuscript resubmitted under ${paper.id}. Day 0 restarted.`);
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all cursor-pointer"
              >
                Resubmit Under Same Paper ID
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Strip: Details, Files, Reviews, Trail */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-1 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manuscript Abstract &amp; Metadata
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-3 px-1 border-b-2 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Attached Files &amp; Versions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-bold">
              {paper.files?.length || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Peer Review Evaluations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-bold">
              {paper.reviews?.length || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trail')}
            className={`py-3 px-1 border-b-2 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trail'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Audit Trail &amp; History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-bold">
              {paper.trail?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
              Abstract
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {paper.abstract}
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Indexed Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(paper.keywords || '')
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200"
                    >
                      {kw}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Authorship &amp; Affiliation
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Corresponding Author:</span>
                <span className="font-bold text-slate-900">{paper.author.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address:</span>
                <span className="font-mono text-slate-700">{paper.author.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Institution:</span>
                <span className="text-slate-800">{paper.author.inst}</span>
              </div>
              {paper.author.dept && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Department:</span>
                  <span className="text-slate-800">{paper.author.dept}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px]">Location:</span>
                <span className="text-slate-800">{paper.author.city}</span>
              </div>
              {paper.author.coauthors && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Co-Authors:</span>
                  <span className="text-slate-800">{paper.author.coauthors}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Files */}
      {activeTab === 'files' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Date Uploaded</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(paper.files || []).map((file, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{file.t}</td>
                  <td className="py-3 px-4 font-mono text-indigo-700">{file.name}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {getDateString(BASE_DATE, file.day)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => showToast(`Simulated download: ${file.name}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {(paper.reviews || []).length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
              No review evaluations submitted yet.
            </div>
          ) : (
            (paper.reviews || []).map((rev, idx) => {
              const rObj = reviewers.find((r) => r.id === rev.rid);
              const scores = rev.sc || [];
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {currentRole === 'author'
                          ? `Reviewer ${paper.reviewers.indexOf(rev.rid) + 1}`
                          : rObj?.name || rev.rid}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        Round {rev.round}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          rev.rec === 'Accept'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rev.rec === 'Reject'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        Recommendation: {rev.rec}
                      </span>
                      <span className="text-xs text-slate-400">
                        {getDateString(BASE_DATE, rev.day)}
                      </span>
                    </div>
                  </div>

                  {/* 11 Criteria Scores */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="py-2 px-3">Evaluation Criterion (SRMU Standard Form)</th>
                          <th className="py-2 px-3 text-right">Score (1 - 5)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {CRITERIA.map((crit, cIdx) => (
                          <tr key={cIdx}>
                            <td className="py-1.5 px-3 text-slate-700 font-medium">
                              {cIdx + 1}. {crit}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-indigo-700">
                              {scores[cIdx] || '-'}/5
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Author Remarks */}
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold uppercase text-slate-400">
                      Comments to the Authors:
                    </h5>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap">
                      {rev.toAuthor}
                    </div>
                  </div>

                  {/* Confidential Editor remarks */}
                  {currentRole !== 'author' && rev.toEd && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold uppercase text-amber-600">
                        Confidential to Editor (Masked from Authors):
                      </h5>
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 whitespace-pre-wrap">
                        {rev.toEd}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'trail' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Official Audit Trail &amp; Lifecycle Events
          </h3>
          <div className="space-y-3">
            {(paper.trail || [])
              .slice()
              .reverse()
              .map((evt, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{evt.actor}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {getDateString(BASE_DATE, evt.day)} {evt.time}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{evt.text}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Forward to Reviewers */}
      <Modal
        isOpen={modalType === 'forward'}
        onClose={() => setModalType(null)}
        title="Forward Manuscript for Peer Review"
        subtitle={`Select exactly 2 reviewers from the registry for domain: ${paper.domain}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Reviewer 1:</label>
            <select
              id="fwd_r1"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="">-- Choose Reviewer 1 --</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Reviewer 2:</label>
            <select
              id="fwd_r2"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="">-- Choose Reviewer 2 --</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.domain})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-[11px]">
            Reviewers will immediately receive assignment notifications and secure credentials in their inbox/SMS without exposing author details.
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setModalType('register_reviewer')}
              className="text-indigo-600 hover:underline font-bold"
            >
              + Register New Reviewer
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const r1 = document.getElementById('fwd_r1')?.value;
                  const r2 = document.getElementById('fwd_r2')?.value;
                  if (!r1 || !r2) {
                    showToast('Please select two reviewers');
                    return;
                  }
                  if (r1 === r2) {
                    showToast('Please select two distinct reviewers');
                    return;
                  }
                  editorForwardToReviewers(paper.id, r1, r2);
                  setModalType(null);
                  showToast('Manuscript successfully dispatched to 2 reviewers');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              >
                Dispatch to Reviewers
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Register Reviewer on the fly */}
      <Modal
        isOpen={modalType === 'register_reviewer'}
        onClose={() => setModalType('forward')}
        title="Register New Peer Reviewer"
        size="md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name &amp; Title *</label>
            <input
              type="text"
              id="new_rev_name"
              placeholder="Dr. John Smith"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Institutional Email *</label>
            <input
              type="email"
              id="new_rev_email"
              placeholder="reviewer@university.edu"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number (with code) *</label>
            <input
              type="text"
              id="new_rev_phone"
              placeholder="+91 98100 00000"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Domain *</label>
            <input
              type="text"
              id="new_rev_dom"
              defaultValue={paper.domain}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalType('forward')}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const name = document.getElementById('new_rev_name')?.value;
                const email = document.getElementById('new_rev_email')?.value;
                const phone = document.getElementById('new_rev_phone')?.value;
                const domain = document.getElementById('new_rev_dom')?.value;
                if (!name || !email || !phone) {
                  showToast('Please fill all mandatory fields');
                  return;
                }
                registerReviewer({ name, email, phone, domain });
                setModalType('forward');
                showToast(`Reviewer ${name} registered successfully`);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Save Reviewer &amp; Return
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Push Back */}
      <Modal
        isOpen={modalType === 'pushback'}
        onClose={() => setModalType(null)}
        title="Push Back Manuscript to Author"
        subtitle={`Exchange ${paper.pushbacks + 1} of ${limits.maxPushback || 2}`}
        size="md"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Specify the formatting issues, missing declarations, or corrections required from the author before peer review can proceed.
          </p>
          <textarea
            id="pb_reason_box"
            rows={3}
            placeholder="Please reformat tables according to journal template and reduce abstract length..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const reason = document.getElementById('pb_reason_box')?.value;
                if (!reason) {
                  showToast('Please state the push-back reason');
                  return;
                }
                editorPushBack(paper.id, reason);
                setModalType(null);
                showToast('Paper pushed back to author');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
            >
              Confirm Push Back
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Reject */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        title="Reject Manuscript"
        size="md"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Provide the formal rejection grounds (e.g. out of journal scope, similarity threshold exceeded, or negative peer review recommendations).
          </p>
          <textarea
            id="reject_reason_box"
            rows={3}
            placeholder="The editorial board has determined that this paper falls outside the stated aims..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const reason = document.getElementById('reject_reason_box')?.value;
                if (!reason) {
                  showToast('Please state the rejection reason');
                  return;
                }
                editorReject(paper.id, reason);
                setModalType(null);
                showToast('Paper rejected. Notification dispatched.');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Payment Gateway Simulation */}
      <Modal
        isOpen={modalType === 'payment'}
        onClose={() => setModalType(null)}
        title="Instant UPI Payment Gateway"
        subtitle={`Invoice No: ${paper.invoice?.no} • Amount: ${formatINR(paper.invoice?.total || calc.total)}`}
        size="md"
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500">
            Scan with Google Pay, PhonePe, Paytm, or BHIM. System automatically verifies the payment confirmation webhook.
          </p>

          <div className="flex justify-center">
            <QrCode size={140} />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                processPayment(paper.id, true);
                setModalType(null);
                showToast('Payment verified successfully! Receipt generated.');
              }}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simulate: Payment Success
            </button>

            <button
              type="button"
              onClick={() => {
                processPayment(paper.id, false);
                setModalType(null);
                showToast('Payment failed / declined. Invoice remains active.');
              }}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simulate: Payment Failure
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: Publish with DOI */}
      <Modal
        isOpen={modalType === 'publish'}
        onClose={() => setModalType(null)}
        title="Publish Article Online"
        subtitle={`Assign DOI and make paper live on the ${paper.journal} portal`}
        size="md"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Digital Object Identifier (DOI):
            </label>
            <input
              type="text"
              id="doi_input"
              defaultValue={`10.5555/${paper.journal.toLowerCase()}.${new Date().getFullYear()}.${paper.id.slice(-4)}`}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const doi = document.getElementById('doi_input')?.value;
                editorPublish(paper.id, doi);
                setModalType(null);
                showToast('Article published online!');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
            >
              Confirm Publication
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 7: Invoice Preview / Print Modal */}
      <Modal
        isOpen={modalType === 'invoice_preview'}
        onClose={() => setModalType(null)}
        wide={true}
      >
        <InvoiceView
          paper={paper}
          calc={calc}
          preview={currentStatus === 'Proofreading'}
          currentDay={currentDay}
        />
      </Modal>

      {/* MODAL 8: Changes Needed (Proofreading) */}
      <Modal
        isOpen={modalType === 'changes'}
        onClose={() => setModalType(null)}
        title="Request Typesetting Corrections"
        subtitle={`Exchange ${paper.proof || 1} of ${limits.maxProof || 5}`}
        size="md"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Specify specific typos, layout adjustments, or figure corrections required in the formatted proof.
          </p>
          <textarea
            id="changes_needed_text"
            rows={3}
            placeholder="Please fix the caption of Table 3 and adjust alignment on page 4..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Upload Annotated Corrections File (optional):
            </label>
            <input
              type="file"
              id="changes_file"
              className="text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const text = document.getElementById('changes_needed_text')?.value;
                if (!text) {
                  showToast('Please state the corrections needed');
                  return;
                }
                const file = document.getElementById('changes_file')?.files?.[0]?.name;
                authorRequestChanges(paper.id, text, file);
                setModalType(null);
                showToast('Corrections submitted to editor');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
            >
              Send to Editor
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
