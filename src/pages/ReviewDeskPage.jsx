import React, { useState } from 'react';
import {
  CheckSquare,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Send,
  Star,
  Users,
  Eye,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CRITERIA, RECOMMENDATIONS, BASE_DATE, getDateString } from '../constants/initialData';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';

export function ReviewDeskPage() {
  const { data, reviewerSubmitReview, showToast, setSession } = useApp();

  const reviewers = data?.reviewers || [];
  const papers = data?.papers || [];
  const currentRole = data?.session?.role;
  const currentWho = data?.session?.who || 'R1';

  // Determine active reviewer
  const activeReviewer =
    reviewers.find((r) => r.id === currentWho) || reviewers[0] || { id: 'R1', name: 'Dr. Meera Iyer' };

  // Papers assigned to this reviewer
  const assignedPapers = papers.filter((p) => (p.reviewers || []).includes(activeReviewer.id));

  const [selectedPaperId, setSelectedPaperId] = useState(
    assignedPapers.length > 0 ? assignedPapers[0].id : null
  );

  const selectedPaper = papers.find((p) => p.id === selectedPaperId);

  // Form state for 11 criteria (scores 1-5)
  const [scores, setScores] = useState(Array(11).fill(4));
  const [recommendation, setRecommendation] = useState('Accept with minor revisions');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [confidentialToEditor, setConfidentialToEditor] = useState('');

  // Check if reviewer has already reviewed current round
  const existingReviews = selectedPaper
    ? (selectedPaper.reviews || []).filter((r) => r.rid === activeReviewer.id)
    : [];

  const hasReviewedCurrentRound = selectedPaper
    ? existingReviews.some((r) => r.round === selectedPaper.round)
    : false;

  const isReviewAllowed =
    selectedPaper &&
    (selectedPaper.status === 'Sent to Reviewers' || selectedPaper.status === 'Re-review') &&
    !hasReviewedCurrentRound;

  const handleScoreChange = (index, value) => {
    const next = [...scores];
    next[index] = Number(value);
    setScores(next);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedPaper) return;

    if (!commentsToAuthor.trim()) {
      showToast('Please provide constructive comments to the authors');
      return;
    }

    reviewerSubmitReview({
      paperId: selectedPaper.id,
      reviewerId: activeReviewer.id,
      scores,
      recommendation,
      commentsToAuthor: commentsToAuthor.trim(),
      confidentialToEditor: confidentialToEditor.trim(),
    });

    setCommentsToAuthor('');
    setConfidentialToEditor('');
    showToast('Peer review evaluation submitted successfully');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Double-Blind Peer Review Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reviewer Workstation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate assigned manuscripts anonymously according to the SRMU 11-point review standard.
          </p>
        </div>

        {/* Switch Reviewer Identity dropdown */}
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            Simulate Reviewer:
          </span>
          <select
            value={activeReviewer.id}
            onChange={(e) => {
              const rId = e.target.value;
              setSession({ role: 'reviewer', who: rId });
              const nextPapers = papers.filter((p) => (p.reviewers || []).includes(rId));
              if (nextPapers.length > 0) setSelectedPaperId(nextPapers[0].id);
            }}
            className="text-xs font-bold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 cursor-pointer focus:outline-indigo-500"
          >
            {reviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.domain})
              </option>
            ))}
          </select>
        </div>
      </div>

      {assignedPapers.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={`No manuscripts currently assigned to ${activeReviewer.name}`}
          description="Use the dropdown above to switch to another reviewer or forward papers from the Manuscripts screen."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assigned Papers List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Assigned Manuscripts ({assignedPapers.length})
            </h3>

            <div className="space-y-2">
              {assignedPapers.map((p) => {
                const isSelected = p.id === selectedPaperId;
                const isDone = (p.reviews || []).some(
                  (r) => r.rid === activeReviewer.id && r.round === p.round
                );
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPaperId(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-700">{p.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isDone ? 'Completed' : `Round ${p.round} Due`}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 line-clamp-2">{p.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{p.domain}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Review Evaluation Workspace (8 Cols) */}
          {selectedPaper && (
            <div className="lg:col-span-8 space-y-6">
              {/* Manuscript Overview Card (Double-Blind: Author Masked) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {selectedPaper.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{selectedPaper.title}</h2>
                    <p className="text-xs text-slate-500">
                      Subject Domain: <strong className="text-slate-800">{selectedPaper.domain}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Simulated download of manuscript ${selectedPaper.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Paper</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                    Abstract (Author details masked for double-blind integrity)
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* If round 2, show author's response */}
                {selectedPaper.round === 2 && selectedPaper.replies?.length > 0 && (
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-900 uppercase text-[10px] tracking-wider block">
                      Author's Point-by-Point Revision Reply:
                    </span>
                    <p className="text-purple-950 whitespace-pre-wrap">
                      {selectedPaper.replies[selectedPaper.replies.length - 1].text}
                    </p>
                  </div>
                )}
              </div>

              {/* Already Submitted View */}
              {hasReviewedCurrentRound ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>You have completed the evaluation for Round {selectedPaper.round}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your assessment has been transmitted to the Editor-in-Chief. You will be notified if a Round 2 re-check is required.
                  </p>
                </div>
              ) : isReviewAllowed ? (
                /* Interactive 11 Criteria Review Form */
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      Standard SRMU Paper Review Form (Round {selectedPaper.round})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rate each evaluation criterion from 1 (Poor) to 5 (Excellent).
                    </p>
                  </div>

                  {/* 11 Criteria Grid */}
                  <div className="space-y-3">
                    {CRITERIA.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium text-slate-800 flex-1">
                          {idx + 1}. {criterion}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <label
                              key={val}
                              className={`flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                                scores[idx] === val
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`crit_${idx}`}
                                value={val}
                                checked={scores[idx] === val}
                                onChange={() => handleScoreChange(idx, val)}
                                className="sr-only"
                              />
                              {val}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Overall Recommendation to the Editor *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {RECOMMENDATIONS.map((rec) => (
                        <label
                          key={rec}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium cursor-pointer transition-all ${
                            recommendation === rec
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="overall_rec"
                            value={rec}
                            checked={recommendation === rec}
                            onChange={(e) => setRecommendation(e.target.value)}
                            className="text-indigo-600"
                          />
                          <span>{rec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Author Comments */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Constructive Comments to the Authors * (One point per line, anonymous)
                    </label>
                    <textarea
                      required
                      value={commentsToAuthor}
                      onChange={(e) => setCommentsToAuthor(e.target.value)}
                      rows={4}
                      placeholder="1. Clarify the methodology in Section 3.2...&#10;2. Add comparative baselines to Table 2...&#10;3. State study limitations in the conclusion..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-indigo-500 font-sans"
                    />
                  </div>

                  {/* Confidential Editor remarks */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Confidential Remarks to Editor (Strictly hidden from authors)
                    </label>
                    <textarea
                      value={confidentialToEditor}
                      onChange={(e) => setConfidentialToEditor(e.target.value)}
                      rows={2}
                      placeholder="Special notes regarding rigor, originality, or ethical considerations..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-indigo-500 font-sans"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Official Evaluation</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-center text-xs text-slate-500 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <p>Manuscript is currently in stage: <strong>{selectedPaper.status}</strong>.</p>
                  <p>No review action is pending for this submission at this time.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
