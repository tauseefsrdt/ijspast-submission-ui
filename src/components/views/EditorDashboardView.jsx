import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, OrcidBadge } from '../common/Badge';
import { TimeTag } from '../common/TimeTag';
import { KeyValueList, TrailView, FilesTable } from '../common/DataComponents';
import {
  STATUS_OWNERS,
  CRITERIA,
  DOMAINS,
  BASE_DATE,
  getDateString,
  formatINR,
} from '../../constants/initialData';

export function EditorDashboardView() {
  const {
    data,
    setSession,
    showToast,
    openModal,
    closeModal,
    recordSimilarity,
    editorPushBack,
    editorReject,
    editorForwardToReviewers,
    registerReviewer,
    editorSendComments,
    editorForwardRevision,
    editorFinalDecision,
    editorUploadFormatted,
    editorPublish,
    calculateFee,
  } = useApp();

  const { session, papers, reviewers, day, limits } = data;
  const currentJournal = session.who || 'IJMAR';
  const tab = session.tab || 'dash';
  const selectedPaper = papers.find((p) => p.id === session.pid);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Register Reviewer Form state
  const [newRevName, setNewRevName] = useState('');
  const [newRevEmail, setNewRevEmail] = useState('');
  const [newRevPhone, setNewRevPhone] = useState('');
  const [newRevDomain, setNewRevDomain] = useState(DOMAINS[0]);
  const [revFormError, setRevFormError] = useState('');

  // Similarity input
  const [simValue, setSimValue] = useState('');

  // Push back / Reject modal comments
  const [pbComment, setPbComment] = useState('');
  const [rejComment, setRejComment] = useState('');

  // Forward reviewers selection
  const [fwdRev1, setFwdRev1] = useState('');
  const [fwdRev2, setFwdRev2] = useState('');
  const [fwdError, setFwdError] = useState('');

  // Pass comments checkboxes
  const [selectedCommentIndices, setSelectedCommentIndices] = useState({});
  const [editorNote, setEditorNote] = useState('');

  // Decision comment
  const [decisionComment, setDecisionComment] = useState('');

  // Format & Page count state
  const [formattedFile, setFormattedFile] = useState(null);
  const [pageCount, setPageCount] = useState(10);
  const [overrideAmt, setOverrideAmt] = useState('');
  const [overrideWhy, setOverrideWhy] = useState('');
  const [fmtError, setFmtError] = useState('');

  // Publish DOI
  const [publishDoi, setPublishDoi] = useState('');

  const journalPapers = papers.filter((p) => p.journal === currentJournal);

  // Tab 1: Papers List or Detail
  if (selectedPaper) {
    const p = selectedPaper;
    const isEditorAction = STATUS_OWNERS[p.status] === 'Editor';
    const round1Reviews = p.reviews.filter((r) => r.round === 1);
    const round2Reviews = p.reviews.filter((r) => r.round === 2);

    // Prepare reviewer comments for pass-through
    const availableCommentLines = [];
    round1Reviews.forEach((rv) => {
      const revIndex = p.reviewers.indexOf(rv.rid) + 1;
      const revLabel = `Reviewer ${revIndex > 0 ? revIndex : 1}`;
      rv.toAuthor
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((line) => {
          availableCommentLines.push({ from: revLabel, text: line });
        });
    });

    return (
      <div className="space-y-6">
        {/* Paper Detail Header */}
        <div className="border-b border-slate-200 pb-4 space-y-2">
          <button
            onClick={() => setSession({ pid: null })}
            className="px-3 py-1 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            ← Back to {currentJournal} Papers List
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
                <StatusBadge status={p.status} />
                {STATUS_OWNERS[p.status] && (
                  <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />
                )}
                <OrcidBadge status={p.orc.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Action Box based on current status */}

        {/* Step: Under Screening */}
        {p.status === 'Under Screening' && (
          <div className="bg-white border-2 border-blue-400 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>📋</span> Screen Manuscript
            </h2>
            <p className="text-xs text-slate-600">
              Evaluate scope fit, review ORCID verification ({p.orc.status}), perform manual similarity check, and either push back, forward to 2 peer reviewers, or reject.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setFwdRev1('');
                  setFwdRev2('');
                  setFwdError('');
                  openModal(
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-[#0d3b6e]">
                        Assign Two Peer Reviewers
                      </h3>
                      <p className="text-xs text-slate-500">
                        Manuscript domain: <b>{p.domain}</b>. As per double-blind policy, reviewers will not receive author identities.
                      </p>

                      {fwdError && (
                        <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                          {fwdError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reviewer 1 *
                          </label>
                          <select
                            id="rev1_sel"
                            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="">Select Reviewer 1</option>
                            {reviewers.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.domain})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reviewer 2 *
                          </label>
                          <select
                            id="rev2_sel"
                            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="">Select Reviewer 2</option>
                            {reviewers.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.domain})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const r1Val = document.getElementById('rev1_sel')?.value;
                            const r2Val = document.getElementById('rev2_sel')?.value;
                            if (!r1Val || !r2Val || r1Val === r2Val) {
                              setFwdError('Please select two distinct reviewers.');
                              return;
                            }
                            closeModal();
                            editorForwardToReviewers(p.id, r1Val, r2Val);
                          }}
                          className="px-5 py-2 bg-[#0d3b6e] text-white rounded-lg text-xs font-bold hover:bg-[#0a2d54]"
                        >
                          Send to Reviewers
                        </button>
                      </div>
                    </div>
                  );
                }}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
              >
                Forward to Reviewers
              </button>

              <button
                disabled={p.pushbacks >= limits.maxPushback}
                onClick={() => {
                  setPbComment('');
                  openModal(
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-amber-800">
                        Push Back Manuscript to Author
                      </h3>
                      <p className="text-xs text-slate-500">
                        The author will receive this comment and will be prompted to resubmit a corrected file under the same paper ID.
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Reason for Push-Back *
                        </label>
                        <textarea
                          id="pb_reason_box"
                          rows={4}
                          placeholder="e.g. Please format according to SRMU IEEE template, shorten abstract to under 250 words, and update references..."
                          className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 border rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const val = document.getElementById('pb_reason_box')?.value;
                            if (!val?.trim()) {
                              showToast('Please enter a reason.');
                              return;
                            }
                            closeModal();
                            editorPushBack(p.id, val.trim());
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                        >
                          Push Back to Author
                        </button>
                      </div>
                    </div>
                  );
                }}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                Push Back to Author ({p.pushbacks}/{limits.maxPushback})
              </button>

              <button
                onClick={() => {
                  openModal(
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-rose-800">
                        Reject Manuscript
                      </h3>
                      <p className="text-xs text-slate-500">
                        Provide editorial reasons for rejection. The author retains the option to resubmit a substantially revised study under the same paper ID.
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Rejection Reason *
                        </label>
                        <textarea
                          id="rej_reason_box"
                          rows={4}
                          placeholder="e.g. Manuscript is outside the scientific scope of this journal / Similarity check exceeds acceptable thresholds without original analysis..."
                          className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 border rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const val = document.getElementById('rej_reason_box')?.value;
                            if (!val?.trim()) {
                              showToast('Please enter a reason.');
                              return;
                            }
                            closeModal();
                            editorReject(p.id, val.trim());
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  );
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold rounded-lg text-xs transition-colors"
              >
                Reject Manuscript
              </button>
            </div>

            {/* Manual Similarity Check */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Similarity Check (Manual - 10% benchmark):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={simValue}
                  onChange={(e) => setSimValue(e.target.value)}
                  placeholder={p.sim != null ? `${p.sim}%` : 'e.g. 7'}
                  className="w-24 text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#f2b01e]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = Number(simValue);
                    if (simValue === '' || isNaN(num) || num < 0 || num > 100) {
                      showToast('Enter a valid percentage between 0 and 100');
                      return;
                    }
                    recordSimilarity(p.id, num);
                    setSimValue('');
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors"
                >
                  Record
                </button>
              </div>

              {p.sim != null && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    p.sim <= 10
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Recorded: {p.sim}% ({p.sim <= 10 ? 'Within 10% benchmark' : 'Above 10% benchmark'})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step: Sent to Reviewers / Re-review */}
        {(p.status === 'Sent to Reviewers' || p.status === 'Re-review') && (
          <div className="bg-white border-2 border-blue-300 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>⏳</span> Under Peer Review (Round {p.round})
            </h2>
            <p className="text-xs text-slate-600">
              Assigned reviewers have received access credentials via secure email/SMS. Double-blind identity masking is active.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {p.reviewers.map((rid, idx) => {
                const rev = reviewers.find((r) => r.id === rid);
                const isSubmitted = p.reviews.some((rv) => rv.rid === rid && rv.round === p.round);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <b className="text-xs text-slate-900 block">
                        Reviewer {idx + 1}: {rev?.name}
                      </b>
                      <span className="text-[11px] text-slate-500 font-mono">{rev?.domain}</span>
                    </div>
                    {isSubmitted ? (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        ✓ Submitted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Review Received -> Editor Collation & Comment Passing */}
        {p.status === 'Review Received' && (
          <div className="bg-white border-2 border-amber-400 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
                <span>📝</span> Pass Selected Reviewer Comments to Author
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Both Reviews Complete
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select which feedback points to convey to the author. In accordance with double-blind guidelines, the author will only see <b>Reviewer 1</b> and <b>Reviewer 2</b> without reviewer names.
            </p>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-60 overflow-y-auto">
              {availableCommentLines.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No text comments provided.</p>
              ) : (
                availableCommentLines.map((lineObj, idx) => {
                  const isChecked = selectedCommentIndices[idx] !== false; // default true
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer p-1.5 hover:bg-white rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setSelectedCommentIndices((prev) => ({
                            ...prev,
                            [idx]: e.target.checked,
                          }))
                        }
                        className="mt-0.5 text-[#0d3b6e] rounded"
                      />
                      <span>
                        <b className="text-[#0d3b6e]">{lineObj.from}:</b> {lineObj.text}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Editorial Guidance to Author
              </label>
              <textarea
                rows={2}
                value={editorNote}
                onChange={(e) => setEditorNote(e.target.value)}
                placeholder="e.g. Please address the methodological concerns in section 3 with highest priority..."
                className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
              />
            </div>

            <button
              onClick={() => {
                const passed = availableCommentLines.filter(
                  (_, idx) => selectedCommentIndices[idx] !== false
                );
                if (passed.length === 0) {
                  showToast('Please select at least one comment to pass on.');
                  return;
                }
                editorSendComments(p.id, passed, editorNote);
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Send Selected Comments to Author
            </button>
          </div>
        )}

        {/* Step: Revision Received -> Forward to Reviewers */}
        {p.status === 'Revision Received' && (
          <div className="bg-white border-2 border-blue-400 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>📩</span> Author Submitted Point-by-Point Reply & Revised Paper
            </h2>

            {p.replies.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 space-y-1">
                <span className="font-bold block">Author's Detailed Response:</span>
                <p className="whitespace-pre-wrap font-sans leading-relaxed">
                  {p.replies[p.replies.length - 1].text}
                </p>
              </div>
            )}

            <button
              onClick={() => editorForwardRevision(p.id)}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Forward Reply & Revision to Reviewers for Re-Evaluation
            </button>
          </div>
        )}

        {/* Step: Reviews Complete -> Final Decision */}
        {p.status === 'Reviews Complete' && (
          <div className="bg-white border-2 border-purple-400 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>⚖</span> Editorial Final Decision
            </h2>
            <p className="text-xs text-slate-600">
              Both reviewers have completed their round 2 evaluation and provided final recommendations.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Editorial Decision Comments
              </label>
              <textarea
                rows={3}
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder="Detail rationale for acceptance or rejection..."
                className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => editorFinalDecision(p.id, true, decisionComment)}
                className="px-6 py-2.5 bg-[#13663c] hover:bg-[#0f5230] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                Accept Manuscript
              </button>
              <button
                onClick={() => editorFinalDecision(p.id, false, decisionComment)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                Reject Manuscript
              </button>
            </div>
          </div>
        )}

        {/* Step: Accepted -> Waiting for camera ready */}
        {p.status === 'Accepted' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs sm:text-sm font-medium">
            ✓ <b>Accepted:</b> Awaiting camera-ready submission in Word template from the author.
          </div>
        )}

        {/* Step: Camera-Ready Received / Changes Requested -> Typeset & Calculate Fee */}
        {(p.status === 'Camera-Ready Received' || p.status === 'Changes Requested') && (
          <div className="bg-white border-2 border-[#f2b01e] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
                <span>📐</span> Typeset Manuscript & Calculate APC Fee
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Exchange {p.proof + 1} of {limits.maxProof}
              </span>
            </div>

            {p.status === 'Changes Requested' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs leading-relaxed">
                <b>Author Requested Changes:</b>{' '}
                {p.trail.filter((t) => t.text.startsWith('Changes needed')).slice(-1)[0]?.text}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Download the author's Word manuscript, format offline into the official SRMU journal template, and upload the final typeset version below with the verified page count. The system will calculate the Article Processing Charge automatically.
            </p>

            {fmtError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                {fmtError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Formatted Typeset File (.doc, .docx) *
                </label>
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setFormattedFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Page Count *
                </label>
                <input
                  type="number"
                  min={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                />
              </div>
            </div>

            {/* Live Fee preview */}
            {(() => {
              const previewFee = calculateFee(p.journal, pageCount);
              const activeOverride = overrideAmt !== '' ? Number(overrideAmt) : null;
              return (
                <div className="bg-[#e0ecfa] border border-[#1a5a9f]/30 text-[#1a5a9f] p-3 rounded-lg text-xs space-y-1">
                  <div className="font-bold">
                    System APC Calculation for {pageCount} pages: {formatINR(previewFee.total)}
                  </div>
                  <div className="text-[11px] text-[#1a5a9f]">
                    Base Fee: {formatINR(previewFee.baseAmt)} (covers up to {previewFee.limit} pages)
                    {previewFee.ex > 0 &&
                      ` + Overlength charge: ${previewFee.ex} extra pages @ ${formatINR(
                        previewFee.rate
                      )}/page = ${formatINR(previewFee.ex * previewFee.rate)}`}
                  </div>
                  {activeOverride != null && (
                    <div className="font-bold text-amber-800 pt-1">
                      Override active: Author will be billed {formatINR(activeOverride)}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Override Amount (Optional, in ₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={overrideAmt}
                  onChange={(e) => setOverrideAmt(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Override Reason (Required if overriding amount)
                </label>
                <input
                  type="text"
                  value={overrideWhy}
                  onChange={(e) => setOverrideWhy(e.target.value)}
                  placeholder="e.g. Institutional discount / Grant subsidy"
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!formattedFile) {
                  setFmtError('Please upload the formatted manuscript file.');
                  return;
                }
                if (overrideAmt !== '' && !overrideWhy.trim()) {
                  setFmtError('Please provide a reason for overriding the fee amount.');
                  return;
                }
                setFmtError('');
                editorUploadFormatted(
                  p.id,
                  formattedFile.name,
                  pageCount,
                  overrideAmt !== '' ? Number(overrideAmt) : null,
                  overrideWhy
                );
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Send to Author for Proofreading
            </button>
          </div>
        )}

        {/* Step: Proofreading */}
        {p.status === 'Proofreading' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs sm:text-sm font-medium">
            ⏳ <b>Proofreading in Progress:</b> Manuscript is with the author. Quoted APC amount:{' '}
            <b>{formatINR(p.override != null ? p.override : p.calc?.total || 5000)}</b>.
          </div>
        )}

        {/* Step: Payment Pending */}
        {p.status === 'Payment Pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs sm:text-sm font-medium">
            💳 <b>Invoice #{p.invoice?.no} Issued:</b> Awaiting online UPI payment of{' '}
            <b>{formatINR(p.invoice?.total || 5000)}</b> from author. The system verifies payment callbacks automatically.
          </div>
        )}

        {/* Step: Paid -> Publish Online */}
        {p.status === 'Paid' && (
          <div className="bg-white border-2 border-emerald-400 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <span className="text-xl">✓</span>
              <h2 className="text-base font-bold">Payment Verified - Ready for Online Publication</h2>
            </div>
            <p className="text-xs text-slate-600">
              APC payment of {formatINR(p.invoice?.total || 5000)} verified automatically. You may now publish the paper to the public journal index.
            </p>

            <button
              onClick={() => {
                setPublishDoi(`10.0000/${currentJournal.toLowerCase()}.sample.${new Date().getFullYear()}.${String(p.id).slice(-4)}`);
                openModal(
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-[#0d3b6e]">
                      Publish Manuscript Online
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter the assigned Digital Object Identifier (DOI) obtained from SRMU repository indexing.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        DOI (Digital Object Identifier)
                      </label>
                      <input
                        type="text"
                        id="doi_input_field"
                        defaultValue={`10.0000/${currentJournal.toLowerCase()}.sample.${new Date().getFullYear()}.${String(p.id).slice(-4)}`}
                        className="w-full text-sm p-2.5 border rounded-lg font-mono focus:ring-2 focus:ring-[#f2b01e]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={closeModal} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const doiVal = document.getElementById('doi_input_field')?.value;
                          closeModal();
                          editorPublish(p.id, doiVal);
                        }}
                        className="px-5 py-2 bg-[#13663c] text-white font-bold rounded-lg text-xs hover:bg-[#0f5230]"
                      >
                        Publish Online Now
                      </button>
                    </div>
                  </div>
                );
              }}
              className="px-6 py-2.5 bg-[#13663c] hover:bg-[#0f5230] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Publish Manuscript Online
            </button>
          </div>
        )}

        {/* Step: Published */}
        {p.status === 'Published' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between flex-wrap gap-2">
            <div>
              ✓ <b>Published:</b> Manuscript is live on the public journal repository.
              {p.doi && <span className="font-mono text-xs block mt-0.5">DOI: {p.doi}</span>}
            </div>
            <button
              onClick={() => setSession({ role: 'public', pid: p.id })}
              className="px-3 py-1 bg-[#0d3b6e] text-white text-xs font-semibold rounded hover:bg-[#0a2d54]"
            >
              View on Website
            </button>
          </div>
        )}

        {/* Reviews Section */}
        {p.reviews.length > 0 && (
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#0d3b6e] border-b border-slate-100 pb-2">
              Peer Review Submissions (Current Cycle)
            </h3>
            <div className="space-y-4">
              {p.reviews.map((rv, idx) => {
                const revObj = reviewers.find((r) => r.id === rv.rid);
                return (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <b className="text-sm text-[#0d3b6e]">{revObj?.name || 'Reviewer'}</b>
                        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                          Round {rv.round}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            rv.rec === 'Accept'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rv.rec === 'Reject'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Recommendation: {rv.rec}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {getDateString(BASE_DATE, rv.day)}
                      </span>
                    </div>

                    {/* 11 Criteria Scores */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600">
                            <th className="py-1.5 px-2">Criterion</th>
                            <th className="py-1.5 px-2 w-24">Score (1-5)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {CRITERIA.map((crit, cIdx) => (
                            <tr key={cIdx}>
                              <td className="py-1 px-2 text-slate-700">
                                {cIdx + 1}. {crit}
                              </td>
                              <td className="py-1 px-2 font-bold text-slate-900">
                                {rv.sc[cIdx] || '-'}/5
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 text-xs pt-1 border-t border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">Comments to Authors:</span>
                        <p className="text-slate-700 whitespace-pre-wrap mt-0.5 bg-white p-2.5 rounded border border-slate-200">
                          {rv.toAuthor}
                        </p>
                      </div>
                      {rv.toEd && (
                        <div>
                          <span className="font-bold text-amber-900 block">
                            Confidential Comments to Editor (Hidden from Author):
                          </span>
                          <p className="text-amber-900 whitespace-pre-wrap mt-0.5 bg-amber-50 p-2.5 rounded border border-amber-200">
                            {rv.toEd}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Archived Reviews from prior cycles */}
        {p.archive && p.archive.length > 0 && (
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
              Archived Reviews (Prior Submission Cycle)
            </h3>
            <div className="space-y-3">
              {p.archive.map((arc, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Cycle {arc.cycle} Evaluation</span>
                    <span>{arc.rec}</span>
                  </div>
                  <p className="text-slate-600 italic">{arc.toAuthor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata & Audit Trail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
              Author & Manuscript Information
            </h3>
            <KeyValueList
              items={[
                ['Author Name', p.author.name],
                ['Email', p.author.email],
                ['Institution', p.author.inst],
                ['Department', p.author.dept || 'None listed'],
                ['City/Country', p.author.city],
                [
                  'ORCID',
                  <span>
                    <OrcidBadge status={p.orc.status} />{' '}
                    <a
                      href={`https://orcid.org/${p.author.orcid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-[#0b5cad] underline ml-1"
                    >
                      {p.author.orcid}
                    </a>
                  </span>,
                ],
                ['Domain', p.domain],
                ['Keywords', p.keywords],
                ['Day 0 (Submitted)', getDateString(BASE_DATE, p.day0)],
                ['Push-Backs', `${p.pushbacks} of ${limits.maxPushback}`],
                ['Resubmissions', p.resub || 0],
                [
                  'Similarity Check',
                  p.sim != null ? `${p.sim}%` : 'Not recorded yet',
                ],
              ]}
            />

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1.5">Abstract</h4>
              <p className="text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                {p.abstract}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1.5">Files</h4>
              <FilesTable files={p.files} />
            </div>
          </div>

          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
              Complete Editorial Trail (Editor View)
            </h3>
            <div className="max-h-96 overflow-y-auto pr-1">
              <TrailView trail={p.trail} visibility="all" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tab 2: Reviewer Registration Tab
  if (tab === 'rev') {
    return (
      <div className="space-y-6">
        <EditorTabs activeTab={tab} onSelectTab={(t) => setSession({ tab: t, pid: null })} journal={currentJournal} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0d3b6e] border-b border-slate-100 pb-2">
              Register a New Peer Reviewer
            </h2>

            {revFormError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg">
                {revFormError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRevName.trim() || !newRevEmail.trim() || !newRevPhone.trim()) {
                  setRevFormError('Name, email, and phone number are all mandatory.');
                  return;
                }
                if (reviewers.some((r) => r.email.toLowerCase() === newRevEmail.trim().toLowerCase())) {
                  setRevFormError('A reviewer with this email is already registered.');
                  return;
                }
                setRevFormError('');
                registerReviewer({
                  name: newRevName.trim(),
                  email: newRevEmail.trim(),
                  phone: newRevPhone.trim(),
                  domain: newRevDomain,
                });
                setNewRevName('');
                setNewRevEmail('');
                setNewRevPhone('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newRevName}
                  onChange={(e) => setNewRevName(e.target.value)}
                  placeholder="Prof. (Dr.) A. K. Verma"
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newRevEmail}
                  onChange={(e) => setNewRevEmail(e.target.value)}
                  placeholder="reviewer@institute.ac.in"
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={newRevPhone}
                  onChange={(e) => setNewRevPhone(e.target.value)}
                  placeholder="+91 98100 12345"
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Domain *
                </label>
                <select
                  value={newRevDomain}
                  onChange={(e) => setNewRevDomain(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#f2b01e]"
                >
                  {DOMAINS.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                Save Reviewer to Registry
              </button>
            </form>
          </div>

          {/* List */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#0d3b6e] border-b border-slate-100 pb-2">
              Registered Reviewer Database ({reviewers.length})
            </h2>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reviewers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.email}</td>
                      <td className="py-2.5 px-3 text-[#0d3b6e] font-medium">{r.domain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tab 3: Reports Tab
  if (tab === 'rep') {
    const statusCounts = {};
    journalPapers.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    const paidTotal = journalPapers
      .filter((p) => p.invoice && p.invoice.status === 'Paid')
      .reduce((acc, p) => acc + p.invoice.total, 0);

    const pendingTotal = journalPapers
      .filter((p) => p.invoice && p.invoice.status !== 'Paid')
      .reduce((acc, p) => acc + p.invoice.total, 0);

    const submissionsByDay = {};
    journalPapers.forEach((p) => {
      const dayKey = getDateString(BASE_DATE, p.day0);
      submissionsByDay[dayKey] = (submissionsByDay[dayKey] || 0) + 1;
    });

    const publishedWithPay = journalPapers.filter((p) => p.status === 'Published' && p.paidDay != null);
    const avgTurnaround = publishedWithPay.length
      ? Math.round(
          publishedWithPay.reduce((acc, p) => acc + (p.paidDay - p.day0), 0) / publishedWithPay.length
        )
      : 'N/A';

    return (
      <div className="space-y-6">
        <EditorTabs activeTab={tab} onSelectTab={(t) => setSession({ tab: t, pid: null })} journal={currentJournal} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-[#0d3b6e] border-b border-slate-100 pb-2">
              Manuscripts by Workflow Status
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.keys(statusCounts).map((st) => (
                    <tr key={st} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <StatusBadge status={st} />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800">
                        {statusCounts[st]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments & Submissions */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#0d3b6e] border-b border-slate-100 pb-2">
              Financial & Velocity Metrics
            </h3>

            <KeyValueList
              items={[
                ['Collected APC (Paid)', formatINR(paidTotal)],
                ['Outstanding APC (Pending)', formatINR(pendingTotal)],
                ['Avg Days from Submission to Payment', `${avgTurnaround} day(s)`],
              ]}
            />

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs uppercase font-bold text-slate-600 mb-2">
                Submissions Received Per Day
              </h4>
              <KeyValueList
                items={Object.keys(submissionsByDay).map((dk) => [dk, submissionsByDay[dk]])}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tab 1: Default Dashboard (Papers list)
  const countNeedAction = journalPapers.filter((p) => STATUS_OWNERS[p.status] === 'Editor').length;
  const countWithAuthors = journalPapers.filter((p) => STATUS_OWNERS[p.status] === 'Author').length;
  const countWithReviewers = journalPapers.filter((p) => STATUS_OWNERS[p.status] === 'Reviewer').length;
  const countClosed = journalPapers.filter((p) => !STATUS_OWNERS[p.status]).length;

  const filteredPapers = journalPapers.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'mine') return STATUS_OWNERS[p.status] === 'Editor';
    if (statusFilter === 'author') return STATUS_OWNERS[p.status] === 'Author';
    if (statusFilter === 'rev') return STATUS_OWNERS[p.status] === 'Reviewer';
    if (statusFilter === 'done') return !STATUS_OWNERS[p.status];
    return true;
  });

  return (
    <div className="space-y-6">
      <EditorTabs activeTab={tab} onSelectTab={(t) => setSession({ tab: t, pid: null })} journal={currentJournal} />

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#d5deeb] rounded-xl p-3.5 shadow-2xs">
          <div className="text-2xl font-bold font-mono text-[#0d3b6e]">{countNeedAction}</div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">Need Your Action</div>
        </div>
        <div className="bg-white border border-[#d5deeb] rounded-xl p-3.5 shadow-2xs">
          <div className="text-2xl font-bold font-mono text-amber-700">{countWithAuthors}</div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">With Authors</div>
        </div>
        <div className="bg-white border border-[#d5deeb] rounded-xl p-3.5 shadow-2xs">
          <div className="text-2xl font-bold font-mono text-blue-700">{countWithReviewers}</div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">With Reviewers</div>
        </div>
        <div className="bg-white border border-[#d5deeb] rounded-xl p-3.5 shadow-2xs">
          <div className="text-2xl font-bold font-mono text-emerald-700">{countClosed}</div>
          <div className="text-xs font-semibold text-slate-600 mt-0.5">Published / Closed</div>
        </div>
      </div>

      {/* Filters & Papers Table */}
      <div className="bg-white border border-[#d5deeb] rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by paper ID, manuscript title, or author name..."
            className="flex-1 w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
          >
            <option value="">All Papers</option>
            <option value="mine">Needs My Action</option>
            <option value="author">With Author</option>
            <option value="rev">With Reviewers</option>
            <option value="done">Closed / Published</option>
          </select>
        </div>

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
                  Author
                </th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                  ORCID
                </th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredPapers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No papers match the selected query.
                  </td>
                </tr>
              ) : (
                filteredPapers.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSession({ pid: p.id })}
                    className="hover:bg-[#f1f5f9] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#0b5cad]">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 line-clamp-1 max-w-sm">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">{p.author.name}</td>
                    <td className="py-3 px-4">
                      <OrcidBadge status={p.orc.status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4">
                      {STATUS_OWNERS[p.status] ? (
                        <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />
                      ) : (
                        <span className="text-xs text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditorTabs({ activeTab, onSelectTab, journal }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
      <div>
        <h1 className="text-2xl font-bold text-[#0d3b6e] tracking-tight">
          Editor Portal: {journal}
        </h1>
        <p className="text-xs text-[#55657d] mt-0.5">
          International Editorial Desk: Manage screening, reviewer registration, revisions, proofreading, and publishing.
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => onSelectTab('dash')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'dash'
              ? 'bg-white text-[#0d3b6e] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Papers
        </button>
        <button
          onClick={() => onSelectTab('rev')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'rev'
              ? 'bg-white text-[#0d3b6e] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reviewer Registration
        </button>
        <button
          onClick={() => onSelectTab('rep')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'rep'
              ? 'bg-white text-[#0d3b6e] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reports & Metrics
        </button>
      </div>
    </div>
  );
}
