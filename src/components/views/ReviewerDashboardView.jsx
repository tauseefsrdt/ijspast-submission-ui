import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeTag } from '../common/TimeTag';
import { KeyValueList } from '../common/DataComponents';
import {
  CRITERIA,
  RECOMMENDATIONS,
  BASE_DATE,
  getDateString,
} from '../../constants/initialData';

export function ReviewerDashboardView() {
  const { data, setSession, showToast, reviewerSubmitReview } = useApp();
  const { session, papers, reviewers, day } = data;
  const currentReviewerId = session.who;
  const reviewerObj = reviewers.find(
    (r) => r.id === currentReviewerId || r.email.toLowerCase() === currentReviewerId?.toLowerCase()
  );

  const selectedPaper = papers.find((p) => p.id === session.pid);

  // Review Form state
  const [ratings, setRatings] = useState({});
  const [recommendation, setRecommendation] = useState('');
  const [toEditor, setToEditor] = useState('');
  const [toAuthor, setToAuthor] = useState('');
  const [formError, setFormError] = useState('');

  // List View
  if (!selectedPaper) {
    const assignedPapers = papers.filter(
      (p) => reviewerObj && p.reviewers.includes(reviewerObj.id)
    );

    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-[#0d3b6e] tracking-tight">
            Reviewer Assignment Portal: {reviewerObj?.name}
          </h1>
          <p className="text-xs text-[#55657d] mt-0.5">
            Peer Review Terminal: Double-blind protocol active. Reviewers evaluate manuscripts without author identification.
          </p>
        </div>

        <div className="bg-white border border-[#d5deeb] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#d5deeb]">
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Paper ID
                  </th>
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Manuscript Title
                  </th>
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Assigned Task
                  </th>
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {assignedPapers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                      No manuscripts are currently assigned to your review queue.
                    </td>
                  </tr>
                ) : (
                  assignedPapers.map((p) => {
                    const mine = p.reviews.filter((rv) => rv.rid === reviewerObj.id);
                    const isTodo =
                      (p.status === 'Sent to Reviewers' || p.status === 'Re-review') &&
                      !mine.some((rv) => rv.round === p.round);

                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSession({ pid: p.id });
                          setRatings({});
                          setRecommendation('');
                          setToEditor('');
                          setToAuthor('');
                          setFormError('');
                        }}
                        className="hover:bg-[#f1f5f9] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#0b5cad]">
                          {p.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 line-clamp-1 max-w-md">
                          {p.title}
                        </td>
                        <td className="py-3 px-4">
                          {isTodo ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff0cc] text-[#7d5200]">
                              {p.round === 2 ? 'Re-check Due' : 'Initial Review Due'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e1f4e9] text-[#13663c]">
                              ✓ Submitted
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isTodo ? (
                            <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />
                          ) : (
                            <span className="text-xs text-slate-400">Complete</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#55657d]">
          <b>Double-Blind Identity Rule:</b> Reviewers see only the anonymous manuscript text and the structured 11-point evaluation form. Each reviewer reviews a paper at most twice.
        </p>
      </div>
    );
  }

  // Detail & Evaluation View
  const p = selectedPaper;
  const myReviews = p.reviews.filter((rv) => rv.rid === reviewerObj?.id);
  const isTodo =
    (p.status === 'Sent to Reviewers' || p.status === 'Re-review') &&
    !myReviews.some((rv) => rv.round === p.round);
  const latestReply = p.replies[p.replies.length - 1];

  const handleRatingChange = (criterionIndex, score) => {
    setRatings((prev) => ({
      ...prev,
      [criterionIndex]: score,
    }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const scoresArray = [];
    for (let i = 0; i < CRITERIA.length; i++) {
      if (!ratings[i]) {
        setFormError(`Please rate all 11 criteria (missing rating for criterion #${i + 1}).`);
        return;
      }
      scoresArray.push(Number(ratings[i]));
    }

    if (!recommendation) {
      setFormError('Please select a formal recommendation to the Editor.');
      return;
    }

    if (!toAuthor.trim()) {
      setFormError('Please provide evaluation feedback comments to the authors.');
      return;
    }

    setFormError('');
    reviewerSubmitReview({
      paperId: p.id,
      reviewerId: reviewerObj.id,
      round: p.round,
      scores: scoresArray,
      recommendation,
      toEditor: toEditor.trim(),
      toAuthor: toAuthor.trim(),
    });

    setSession({ pid: null });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <button
          onClick={() => setSession({ pid: null })}
          className="px-3 py-1 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
        >
          ← Back to Review Assignments
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0d3b6e] tracking-tight">
              {p.title}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#0b5cad] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {p.id}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                {isTodo ? `Round ${p.round} Review Active` : 'Review Completed'}
              </span>
              {isTodo && <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />}
            </div>
          </div>
        </div>
      </div>

      {/* Manuscript Content (Author Hidden) */}
      <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-sm text-[#0d3b6e]">
            Manuscript Under Review (Double-Blind: Author Details Hidden)
          </h2>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Double-Blind Active
          </span>
        </div>

        <KeyValueList
          items={[
            ['Subject Domain', p.domain],
            ['Keywords', p.keywords],
          ]}
        />

        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Abstract</h3>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">{p.abstract}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-mono text-[#0b5cad]">
            {p.files[p.files.length - 1]?.name || 'manuscript.pdf'}
          </span>
          <button
            onClick={() => showToast('Manuscript downloaded for peer review (simulated).')}
            className="px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>📥</span> Download Full Manuscript (.pdf)
          </button>
        </div>
      </div>

      {/* Author Reply (Round 2 only) */}
      {p.round === 2 && latestReply && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs space-y-2">
          <h3 className="font-bold text-sm text-[#0d3b6e]">
            Author's Point-by-Point Rebuttal to Your Earlier Review
          </h3>
          <p className="text-xs text-blue-900 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-lg border border-blue-100">
            {latestReply.text}
          </p>
        </div>
      )}

      {/* Earlier Review Submitted by This Reviewer */}
      {myReviews.length > 0 && (
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
            Your Previous Evaluation (Round 1)
          </h3>
          {myReviews.map((rv, idx) => (
            <div key={idx} className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Recommendation: {rv.rec}</span>
                <span>Submitted: {getDateString(BASE_DATE, rv.day)}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{rv.toAuthor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Official 11-point Review Form */}
      {isTodo && (
        <div className="bg-white border-2 border-[#0d3b6e] rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-[#0d3b6e]">
              {p.round === 2
                ? 'Re-Check & Final Recommendation Form'
                : 'Official Peer Review Evaluation Form'}
            </h2>
            <p className="text-xs text-[#55657d] mt-1">
              Format supplied by SRMU Research Directorate. Rate each criterion from 1 (Poor) to 5 (Excellent).
            </p>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold">
              ⚠ {formError}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Criteria Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200 text-[#55657d]">
                    <th className="py-2.5 px-3 font-semibold">Evaluation Criterion</th>
                    <th className="py-2.5 px-2 text-center w-12">1<br/><span className="text-[10px] font-normal">Poor</span></th>
                    <th className="py-2.5 px-2 text-center w-12">2<br/><span className="text-[10px] font-normal">Fair</span></th>
                    <th className="py-2.5 px-2 text-center w-12">3<br/><span className="text-[10px] font-normal">Good</span></th>
                    <th className="py-2.5 px-2 text-center w-12">4<br/><span className="text-[10px] font-normal">V. Good</span></th>
                    <th className="py-2.5 px-2 text-center w-12">5<br/><span className="text-[10px] font-normal">Excel.</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {CRITERIA.map((criterion, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {idx + 1}. {criterion}
                      </td>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <td key={score} className="py-2.5 px-2 text-center">
                          <input
                            type="radio"
                            name={`criterion_${idx}`}
                            value={score}
                            checked={ratings[idx] === score}
                            onChange={() => handleRatingChange(idx, score)}
                            className="w-4 h-4 text-[#0d3b6e] focus:ring-[#f2b01e] cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommendation Radio Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                Formal Recommendation to the Editor *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RECOMMENDATIONS.map((rec, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                      recommendation === rec
                        ? 'border-[#0d3b6e] bg-blue-50/50 text-[#0d3b6e]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={rec}
                      checked={recommendation === rec}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="text-[#0d3b6e] focus:ring-[#f2b01e]"
                    />
                    <span>{rec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Confidential Comments to Editor */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                Confidential Comments to the Editor (Never shared with author)
              </label>
              <textarea
                rows={3}
                value={toEditor}
                onChange={(e) => setToEditor(e.target.value)}
                placeholder="Share frank assessments regarding methodological rigor, ethical standards, or publication priority..."
                className="w-full text-xs sm:text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            {/* Comments to Authors */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1">
                Comments to the Authors (One feedback item per line) *
              </label>
              <textarea
                rows={5}
                value={toAuthor}
                onChange={(e) => setToAuthor(e.target.value)}
                placeholder="List constructive recommendations, required clarifications, and citation additions for the authors..."
                className="w-full text-xs sm:text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-xl text-sm shadow-sm transition-colors"
            >
              Submit Review and Press OK
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
