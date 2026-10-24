import React, { useState } from 'react';
import { ReviewRecommendation } from '../../types/review.types';
import { Send, Star, Shield, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const SRMU_CRITERIA = [
  'Relevance and significance of the topic',
  'Originality and novelty of the research',
  'Clarity of research objectives',
  'Clarity and quality of literature review',
  'Suitability and rigor of methodology',
  'Appropriateness of analysis and interpretation',
  'Support for conclusion by empirical results',
  'Organization and clarity of writing',
  'Quality and relevance of references',
  'Quality of tables, and figures',
  'Ethical and reporting standards',
];

interface ReviewFormProps {
  manuscriptId: string;
  manuscriptTitle: string;
  reviewerId: string;
  reviewerName: string;
  isRoundTwo?: boolean;
  authorReplyText?: string;
  onSubmit: (report: {
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
  }) => Promise<void> | void;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  manuscriptId,
  manuscriptTitle,
  reviewerId,
  reviewerName,
  isRoundTwo = false,
  authorReplyText,
  onSubmit,
  isLoading = false,
}) => {
  const [recommendation, setRecommendation] = useState<ReviewRecommendation>(
    isRoundTwo ? 'Accept' : 'Minor Revision'
  );

  // 11 criteria scores (1 - 5)
  const [scores, setScores] = useState<number[]>(
    isRoundTwo ? [5, 4, 5, 4, 5, 4, 5, 5, 4, 5, 5] : [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 5]
  );

  const [commentsForAuthor, setCommentsForAuthor] = useState(
    isRoundTwo
      ? 'The revised manuscript adequately addresses the initial points. The methodology is now well justified and the figures are properly annotated.'
      : '1. Please expand the literature review to include recent benchmark algorithms from 2024-2025.\n2. Clarify the calibration error bounds and sensor drift compensations in Section 3.\n3. Enhance the resolution and font legibility of Figure 4.'
  );

  const [commentsForEditor, setCommentsForEditor] = useState(
    isRoundTwo
      ? 'The author has satisfactorily revised all flagged points. I recommend final acceptance.'
      : 'Solid scientific contribution suitable for IJSPAST after minor revision. The author should address the 3 specific points noted above.'
  );

  const [confidentialComments, setConfidentialComments] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recommendations: { label: ReviewRecommendation; desc: string }[] = [
    { label: 'Accept', desc: 'Accept as is without further revisions' },
    { label: 'Minor Revision', desc: 'Accept subject to minor changes' },
    { label: 'Major Revision', desc: 'Substantial changes needed with re-review' },
    { label: 'Reject', desc: 'Reject submission (outside scope or flawed)' },
  ];

  const handleScoreChange = (index: number, val: number) => {
    const next = [...scores];
    next[index] = val;
    setScores(next);
  };

  const handleSetAllScores = (val: number) => {
    setScores(new Array(SRMU_CRITERIA.length).fill(val));
  };

  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!commentsForAuthor.trim()) {
      newErrors.commentsForAuthor = 'Constructive feedback for the author is required.';
    }
    if (!commentsForEditor.trim()) {
      newErrors.commentsForEditor = 'Evaluation summary for the editor is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Derived high-level ratings
    const technicalQuality = Math.round((scores[0] + scores[4] + scores[5]) / 3);
    const originality = Math.round((scores[1] + scores[2]) / 2);
    const clarity = Math.round((scores[7] + scores[9]) / 2);

    onSubmit({
      manuscriptId,
      reviewerId,
      reviewerName,
      recommendation,
      technicalQuality,
      originality,
      clarity,
      commentsForAuthor: commentsForAuthor.trim(),
      commentsForEditor: commentsForEditor.trim(),
      confidentialComments: confidentialComments.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {manuscriptId}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Peer Review Form</span>
            </span>
            {isRoundTwo && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Round 2 Re-check
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#0d3b6e] tracking-tight mt-1">
            {isRoundTwo ? 'Re-check & Updated Peer Review Recommendation' : 'Manuscript Evaluation & Scorecard'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit objective evaluation across technical quality, originality, and clarity metrics.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Overall Evaluation</span>
          <span className="text-xl font-extrabold text-indigo-700">{avgScore} / 5.0</span>
        </div>
      </div>

      {/* SRMU 11 Criteria Scorecard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            SRMU 11-Point Peer Review Standard (1 = Poor, 5 = Excellent)
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Quick Fill:</span>
            {[3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSetAllScores(val)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
              >
                All {val}s
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-100/70">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Evaluation Criterion</th>
                  <th className="py-2.5 px-4 text-center">1 (Poor)</th>
                  <th className="py-2.5 px-4 text-center">2 (Fair)</th>
                  <th className="py-2.5 px-4 text-center">3 (Good)</th>
                  <th className="py-2.5 px-4 text-center">4 (V.Good)</th>
                  <th className="py-2.5 px-4 text-center">5 (Excell)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SRMU_CRITERIA.map((criterion, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{criterion}</td>
                    {[1, 2, 3, 4, 5].map((scoreVal) => (
                      <td key={scoreVal} className="py-2.5 px-4 text-center">
                        <input
                          type="radio"
                          name={`crit_${idx}`}
                          checked={scores[idx] === scoreVal}
                          onChange={() => handleScoreChange(idx, scoreVal)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendation to Editor */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 block">
          Recommendation to the Editor-in-Chief *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {recommendations.map((rec) => (
            <label
              key={rec.label}
              className={`p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                recommendation === rec.label
                  ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-600/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="recommendation"
                  value={rec.label}
                  checked={recommendation === rec.label}
                  onChange={() => setRecommendation(rec.label)}
                  className="text-indigo-600"
                />
                <span className="text-xs font-bold">{rec.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal pl-6">{rec.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comments for the Authors (Anonymized) */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 block">
            Comments to the Authors (One point per line) *
          </label>
          <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
            Passed on anonymously by Editor as "Reviewer 1"
          </span>
        </div>
        <textarea
          rows={4}
          value={commentsForAuthor}
          onChange={(e) => setCommentsForAuthor(e.target.value)}
          placeholder="1. Please clarify the experimental setup and sample size in Section 3...&#10;2. Include error bars and calibration bounds in Table 2...&#10;3. Add recent citations discussing ambient humidity compensations..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
        />
        {errors.commentsForAuthor && (
          <p className="text-rose-600 text-[11px]">{errors.commentsForAuthor}</p>
        )}
      </div>

      {/* Confidential Comments to the Editor */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 block">
            Confidential Comments &amp; Justification for the Editor *
          </label>
          <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
            Strictly Private for Editor-in-Chief
          </span>
        </div>
        <textarea
          rows={3}
          value={commentsForEditor}
          onChange={(e) => setCommentsForEditor(e.target.value)}
          placeholder="Private recommendation for the editor: technical strengths, weaknesses, publication worthiness..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
        />
        {errors.commentsForEditor && (
          <p className="text-rose-600 text-[11px]">{errors.commentsForEditor}</p>
        )}
      </div>

      {/* Confidential Remarks */}
      <div className="space-y-1.5 text-xs">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>Additional Editorial Notes (Optional)</span>
        </label>
        <textarea
          rows={2}
          value={confidentialComments}
          onChange={(e) => setConfidentialComments(e.target.value)}
          placeholder="Suspected ethical concerns, duplicate submissions, or conflict of interest notes..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 italic">
          Submitting forwards your scorecard and comments directly to the Editor. The status will update to "Review Completed".
        </span>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Forwarding to Editor...' : 'Forward Review Report to Editor'}</span>
        </button>
      </div>
    </form>
  );
};
