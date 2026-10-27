import React, { useState } from 'react';
import { useFormik } from 'formik';
import { ReviewRecommendation } from '../../types/review.types';
import { Send, Star, Shield, HelpCircle, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { reviewSubmissionSchema } from '../../utils/validationSchemas';
import { FormTextarea } from './common/FormTextarea';
import { useToast } from '../../context/ToastContext';

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
  stage?: number;
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
    stage?: number;
    stageName?: string;
    rubricScores?: number[];
    overallScore?: number;
  }) => Promise<void> | void;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  manuscriptId,
  manuscriptTitle,
  reviewerId,
  reviewerName,
  stage = 1,
  isRoundTwo = false,
  authorReplyText,
  onSubmit,
  isLoading = false,
}) => {
  const toast = useToast();
  const isStage1 = stage === 1;
  const isRound2 = stage === 3 || Boolean(isRoundTwo);

  const [recommendation, setRecommendation] = useState<ReviewRecommendation>(
    isStage1 ? 'Minor Revision' : isRound2 ? 'Accept' : 'Accept'
  );

  // 11 criteria scores (1 - 5)
  const [scores, setScores] = useState<number[]>(
    isStage1
      ? [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 5]
      : [5, 4, 5, 4, 5, 4, 5, 5, 4, 5, 5]
  );

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
    toast.info(`Scorecard updated: All criteria set to ${val}`);
  };

  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  const formik = useFormik({
    initialValues: {
      commentsForAuthor: isRound2
        ? 'Second-Round Re-evaluation:\nThe revised manuscript successfully incorporates all requested corrections. The added benchmark comparisons and revised error statistics adequately resolve our prior concerns. The manuscript is recommended for publication.'
        : isStage1
        ? '1. Scope & Novelty: The submission addresses a relevant topic with strong potential. Please expand the literature review to include recent benchmark algorithms from 2024-2025.\n2. Methodology: Clarify the calibration error bounds and sensor drift compensations in Section 3.\n3. Visual Presentation: Enhance the resolution and font legibility of Figure 4.'
        : 'Comprehensive Final Evaluation:\nThe authors have rigorously addressed all technical questions. The theoretical foundations are solid, experimental validations are robust, and statistical error analyses are verified. Recommended for publication.',
      commentsForEditor: isRound2
        ? 'Round 2 Re-evaluation: Author revisions are satisfactory and address all reviewer directives. The paper meets IJSPAST publication standards and is recommended for acceptance.'
        : isStage1
        ? 'Stage 1 Preliminary Assessment: The paper falls squarely within IJSPAST aims and scope. The work is technically sound, but warrants minor revision on experimental calibration before final acceptance.'
        : 'Stage 2 Final Evaluation: Solid scientific contribution ready for formal acceptance. The revisions and author explanations are thorough and convincing.',
      confidentialComments: '',
    },
    validationSchema: reviewSubmissionSchema,
    onSubmit: async (values) => {
      // Derived high-level ratings
      const technicalQuality = Math.round((scores[0] + scores[4] + scores[5]) / 3);
      const originality = Math.round((scores[1] + scores[2]) / 2);
      const clarity = Math.round((scores[7] + scores[9]) / 2);

      const stageTitle = isRound2
        ? 'Round 2: Revision Re-evaluation'
        : isStage1
        ? 'Stage 1: Initial Assessment'
        : 'Stage 2: Final Evaluation';

      try {
        await onSubmit({
          manuscriptId,
          reviewerId,
          reviewerName,
          recommendation,
          technicalQuality,
          originality,
          clarity,
          commentsForAuthor: values.commentsForAuthor.trim(),
          commentsForEditor: values.commentsForEditor.trim(),
          confidentialComments: values.confidentialComments.trim() || undefined,
          stage,
          stageName: stageTitle,
          rubricScores: scores,
          overallScore: parseFloat(avgScore),
        });
        toast.success(`Review report for ${manuscriptId} successfully submitted!`);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to submit review report. Please try again.');
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
      noValidate
    >
      {/* Header with Stage Banner */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {manuscriptId}
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isRound2
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : isStage1
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isRound2
                  ? 'Round 2: Revision Re-evaluation'
                  : isStage1
                  ? 'Stage 1 of 2: Initial Assessment'
                  : 'Stage 2 of 2: Comprehensive Final Evaluation'}
              </span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-2">
            {isRound2
              ? 'Second-Round Review: Re-evaluation of Revised Manuscript'
              : isStage1
              ? 'Stage 1: Preliminary Technical & Scope Assessment'
              : 'Stage 2: Comprehensive Final Evaluation Scorecard'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRound2
              ? 'Evaluate how thoroughly the authors addressed prior reviewer feedback and provide your second-round verdict.'
              : isStage1
              ? 'Step 1: Evaluate novelty, scope alignment, and core methodology to provide initial feedback to the Editor.'
              : 'Step 2: Provide thorough in-depth scorecard ratings, detailed section-by-section remarks, and final verdict.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
            <span className="text-lg font-extrabold text-indigo-700">{avgScore} / 5</span>
          </div>
        </div>
      </div>

      {/* Recommendation Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
          {isStage1 ? '1. Stage 1 Preliminary Recommendation *' : '1. Stage 2 Final Recommendation *'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {recommendations.map((rec) => {
            const isSelected = recommendation === rec.label;
            return (
              <div
                key={rec.label}
                onClick={() => setRecommendation(rec.label)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? rec.label === 'Accept'
                      ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/10'
                      : rec.label === 'Reject'
                      ? 'bg-rose-50/80 border-rose-600 ring-2 ring-rose-600/10'
                      : 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{rec.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{rec.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 11 SRMU Criteria Scorecard */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
              2. Technical Evaluation Scorecard (11-Point Rubric)
            </label>
            <p className="text-[11px] text-slate-500">
              Rate each aspect on a scale of 1 (Poor) to 5 (Outstanding)
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Quick Fill:</span>
            {[3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleSetAllScores(v)}
                className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] cursor-pointer"
              >
                All {v}s
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {SRMU_CRITERIA.map((criterion, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{criterion}</span>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isChecked = scores[idx] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleScoreChange(idx, val)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#0d3b6e] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments for Author */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <FormTextarea
          label={`3. Feedback for Author (${
            isStage1 ? 'Stage 1 Observations & Guidance' : 'Stage 2 Point-by-Point Evaluation'
          })`}
          required
          rows={4}
          id="commentsForAuthor"
          name="commentsForAuthor"
          helperText="This feedback will be relayed to the authors (identities strictly masked)."
          placeholder="Detailed scientific critiques, constructive suggestions, and requested improvements..."
          value={formik.values.commentsForAuthor}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.commentsForAuthor}
          touched={formik.touched.commentsForAuthor}
        />
      </div>

      {/* Comments for Editor */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <FormTextarea
          label="4. Confidential Assessment for the Editor-in-Chief"
          required
          rows={3}
          id="commentsForEditor"
          name="commentsForEditor"
          helperText="Direct remarks to the Editor explaining your evaluation reasoning and publication recommendation."
          placeholder="Summary evaluation notes for the Editorial Board..."
          value={formik.values.commentsForEditor}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.commentsForEditor}
          touched={formik.touched.commentsForEditor}
        />
      </div>

      {/* Confidential Notes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <FormTextarea
          label="5. Additional Editorial Remarks (Optional)"
          rows={2}
          id="confidentialComments"
          name="confidentialComments"
          helperText="Suspected ethical concerns, duplicate submissions, or conflict of interest notes..."
          placeholder="Optional remarks for editorial records..."
          value={formik.values.confidentialComments}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.confidentialComments}
          touched={formik.touched.confidentialComments}
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 italic">
          {isRound2
            ? 'Submitting Second-Round Review will conclude your re-evaluation and send your formal report to the Editor.'
            : isStage1
            ? 'Submitting Stage 1 will log your initial assessment with the Editor and unlock Stage 2 Final Evaluation.'
            : 'Submitting Stage 2 will conclude your peer review and notify the Editor.'}
        </span>
        <button
          type="submit"
          disabled={isLoading || !formik.isValid}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>
            {isLoading
              ? 'Submitting to Editor...'
              : isRound2
              ? 'Submit Second-Round Review to Editor'
              : isStage1
              ? 'Submit Stage 1 Preliminary Review to Editor'
              : 'Submit Stage 2 Final Evaluation to Editor'}
          </span>
        </button>
      </div>
    </form>
  );
};
