import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, OrcidBadge } from '../common/Badge';
import { TimeTag } from '../common/TimeTag';
import { KeyValueList, TrailView, FilesTable } from '../common/DataComponents';
import { InvoiceView } from '../common/InvoiceView';
import { PaymentModal } from '../modals/InteractiveModals';
import { STATUS_OWNERS, BASE_DATE, getDateString, formatINR } from '../../constants/initialData';

export function AuthorDashboardView() {
  const {
    data,
    setSession,
    showToast,
    openModal,
    closeModal,
    authorResubmitPushback,
    authorSubmitReply,
    authorSubmitCameraReady,
    authorApproveProof,
    authorRequestChanges,
    processPayment,
    authorResubmitRejected,
  } = useApp();

  const { session, papers, day, limits } = data;
  const currentAuthorEmail = session.who;
  const currentPaper = papers.find((p) => p.id === session.pid);

  // States for sub-actions
  const [resubmitTitle, setResubmitTitle] = useState('');
  const [resubmitAbstract, setResubmitAbstract] = useState('');
  const [resubmitFile, setResubmitFile] = useState(null);

  const [replyText, setReplyText] = useState('');
  const [replyTitle, setReplyTitle] = useState('');
  const [replyFile, setReplyFile] = useState(null);

  const [cameraFile, setCameraFile] = useState(null);

  const [changesText, setChangesText] = useState('');
  const [changesFile, setChangesFile] = useState(null);

  const [rejTitle, setRejTitle] = useState('');
  const [rejFile, setRejFile] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');

  // List View
  if (!currentPaper) {
    const myPapers = papers.filter((p) => p.author.email.toLowerCase() === currentAuthorEmail?.toLowerCase());

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0d3b6e] tracking-tight">
              My Research Manuscripts
            </h1>
            <p className="text-xs text-[#55657d] mt-0.5">
              Author Portal: Track status, respond to reviewers, proofread formatted papers, and complete APC payments.
            </p>
          </div>
          <button
            onClick={() => setSession({ role: 'submit', pid: null })}
            className="px-4 py-2 bg-[#f2b01e] hover:bg-[#e0a014] text-[#1d1600] font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            + Submit Another Manuscript
          </button>
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
                    Journal
                  </th>
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Current Status
                  </th>
                  <th className="py-3 px-4 text-xs uppercase font-semibold text-[#55657d] tracking-wider">
                    Action / Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {myPapers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      You have not submitted any manuscripts yet. Click "Submit Another Manuscript" to get started.
                    </td>
                  </tr>
                ) : (
                  myPapers.map((p) => {
                    const isAuthorAction = STATUS_OWNERS[p.status] === 'Author';
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSession({ pid: p.id });
                          setResubmitTitle(p.title);
                          setResubmitAbstract(p.abstract);
                          setReplyTitle(p.title);
                          setRejTitle(p.title);
                          setErrorMsg('');
                        }}
                        className="hover:bg-[#f1f5f9] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#0b5cad]">
                          {p.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 line-clamp-1 max-w-md">
                          {p.title}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {p.journal}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-3 px-4">
                          {isAuthorAction ? (
                            <div className="flex items-center gap-2">
                              <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />
                              <span className="text-xs font-semibold text-[#0d3b6e] underline">
                                Action Needed →
                              </span>
                            </div>
                          ) : p.status === 'Rejected' ? (
                            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Resubmission Open
                            </span>
                          ) : (
                            <span className="text-xs text-[#55657d] italic">
                              With {STATUS_OWNERS[p.status]?.toLowerCase() || 'editorial board'}
                            </span>
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
      </div>
    );
  }

  // Detail View for Selected Paper
  const p = currentPaper;
  const isAuthorTurn = STATUS_OWNERS[p.status] === 'Author';
  const daysLeft = p.due != null ? p.due - day : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <button
          onClick={() => setSession({ pid: null })}
          className="px-3 py-1 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
        >
          ← Back to My Manuscripts
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
              {isAuthorTurn && <TimeTag due={p.due} dueMax={p.dueMax} currentDay={day} />}
              <OrcidBadge status={p.orc.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {isAuthorTurn && p.due != null && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-between flex-wrap gap-2 ${
            daysLeft > 1
              ? 'bg-[#e0ecfa] text-[#1a5a9f] border-[#1a5a9f]/20'
              : daysLeft >= 0
              ? 'bg-[#fff0cc] text-[#7d5200] border-[#7d5200]/20'
              : 'bg-[#fde3e0] text-[#a8231b] border-[#a8231b]/20'
          }`}
        >
          <div>
            <b>Next step is yours.</b> Time limit for this step:{' '}
            <b>{getDateString(BASE_DATE, p.due)}</b>.{' '}
            {daysLeft >= 0
              ? `${daysLeft} day(s) remaining.`
              : 'The target date has passed. Please act now to proceed.'}{' '}
            No action button is blocked.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-[#fde3e0] border border-[#a8231b]/30 text-[#a8231b] p-3 rounded-xl text-xs font-semibold">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Dynamic Workflow Step Action Cards */}

      {/* Step: Pushed Back */}
      {p.status === 'Pushed Back' && (
        <div className="bg-white border-2 border-amber-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-xl">↩</span>
            <h2 className="text-base font-bold">Editor Returned Paper for Corrections</h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 leading-relaxed font-sans">
            <b>Editor Note:</b>{' '}
            {p.trail.filter((t) => t.text.startsWith('Pushed back')).slice(-1)[0]?.text ||
              'Please correct the formatting and update the manuscript.'}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manuscript Title (Edit if required)
              </label>
              <input
                type="text"
                value={resubmitTitle}
                onChange={(e) => setResubmitTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Abstract (Edit if required)
              </label>
              <textarea
                rows={4}
                value={resubmitAbstract}
                onChange={(e) => setResubmitAbstract(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corrected File (.doc, .docx, .pdf) *
              </label>
              <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={(e) => setResubmitFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white hover:file:bg-[#0a2d54] cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (!resubmitFile) {
                  setErrorMsg('Please select a corrected manuscript file to upload.');
                  return;
                }
                setErrorMsg('');
                authorResubmitPushback(p.id, resubmitTitle, resubmitAbstract, resubmitFile.name);
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Resubmit Corrected Paper to Editor
            </button>
          </div>
        </div>
      )}

      {/* Step: Comments Sent */}
      {p.status === 'Comments Sent' && (
        <div className="bg-white border-2 border-blue-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#0d3b6e]">
            <span className="text-xl">💬</span>
            <h2 className="text-base font-bold">Reviewer Evaluation Comments</h2>
          </div>

          {p.sent.length > 0 && (
            <div className="space-y-3">
              {p.sent[p.sent.length - 1].note && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900">
                  <b>Editorial Instruction:</b> {p.sent[p.sent.length - 1].note}
                </div>
              )}

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <span className="text-xs uppercase font-semibold text-slate-600 block">
                  Peer Reviewer Feedback Points:
                </span>
                <ol className="list-decimal pl-5 text-xs text-slate-800 space-y-1.5 font-medium">
                  {p.sent[p.sent.length - 1].lines.map((l, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {l.t}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900">Prepare Author Revision</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Point-by-Point Author Response *
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Detail each modification made in response to the reviewers' comments..."
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title (Modify if revised)
              </label>
              <input
                type="text"
                value={replyTitle}
                onChange={(e) => setReplyTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Revised Paper (.doc, .docx, .pdf) *
              </label>
              <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white hover:file:bg-[#0a2d54] cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (!replyText.trim()) {
                  setErrorMsg('Please write your point-by-point reply.');
                  return;
                }
                if (!replyFile) {
                  setErrorMsg('Please upload your revised manuscript file.');
                  return;
                }
                setErrorMsg('');
                authorSubmitReply(p.id, replyText, replyTitle, replyFile.name);
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Submit Reply and Revised Paper
            </button>
          </div>
        </div>
      )}

      {/* Step: Accepted */}
      {p.status === 'Accepted' && (
        <div className="bg-white border-2 border-emerald-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">🎉</span>
            <h2 className="text-base font-bold">Manuscript Officially Accepted</h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Congratulations! Your manuscript has been peer-reviewed and formally accepted for publication. Please download the official journal MS Word template and upload your final camera-ready copy.
          </p>

          <div>
            <button
              onClick={() => showToast('SRMU Word Journal Template downloaded (simulated).')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span>📥</span> Download SRMU Journal Template (.docx)
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Camera-Ready Manuscript (.doc, .docx only) *
              </label>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={(e) => setCameraFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white hover:file:bg-[#0a2d54] cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (!cameraFile) {
                  setErrorMsg('Please choose the camera-ready Word file to upload.');
                  return;
                }
                setErrorMsg('');
                authorSubmitCameraReady(p.id, cameraFile.name);
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Upload Camera-Ready Paper
            </button>
          </div>
        </div>
      )}

      {/* Step: Proofreading */}
      {p.status === 'Proofreading' && (
        <div className="bg-white border-2 border-[#f2b01e] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>🔍</span> Proofreading & Invoice Approval
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
              Exchange {p.proof} of {limits.maxProof}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The journal editorial office has typeset your paper into the official print layout. Please review the formatted copy, verify all equations, tables, figures, and author metadata. An invoice preview is shown below.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-500 block">Formatted Typeset Document:</span>
              <span className="font-mono font-semibold text-[#0b5cad]">
                {p.files.filter((f) => f.t === 'Formatted').slice(-1)[0]?.name || 'formatted_paper.docx'}
              </span>
            </div>
            <button
              onClick={() => showToast('Formatted proof downloaded (simulated).')}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 transition-colors"
            >
              Download Proof
            </button>
          </div>

          {/* Invoice Preview */}
          <InvoiceView paper={p} calc={p.calc} preview={true} currentDay={day} />

          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => authorApproveProof(p.id)}
              className="px-6 py-2.5 bg-[#13663c] hover:bg-[#0f5230] text-white font-bold rounded-lg text-sm shadow-xs transition-colors"
            >
              ✓ OK, I Approve the Proof
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Need Corrections? Request Changes
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Describe Required Typesetting Changes
              </label>
              <textarea
                rows={3}
                value={changesText}
                onChange={(e) => setChangesText(e.target.value)}
                placeholder="Specify page and paragraph numbers with highlighted corrections..."
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Annotated / Corrected File (optional)
              </label>
              <input
                type="file"
                onChange={(e) => setChangesFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (!changesText.trim()) {
                  setErrorMsg('Please describe the required changes.');
                  return;
                }
                setErrorMsg('');
                authorRequestChanges(p.id, changesText, changesFile?.name);
              }}
              disabled={p.proof >= limits.maxProof}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              Request Changes
            </button>
            {p.proof >= limits.maxProof && (
              <p className="text-xs text-rose-600 font-medium">
                The maximum proofreading exchanges ({limits.maxProof}) has been reached.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: Payment Pending */}
      {p.status === 'Payment Pending' && (
        <div className="bg-white border-2 border-amber-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-[#0d3b6e] flex items-center gap-2">
              <span>💳</span> Publication Fee (APC) Payment
            </h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Invoice #{p.invoice?.no}
            </span>
          </div>

          <InvoiceView paper={p} calc={p.calc} preview={false} currentDay={day} />

          <div className="pt-2 flex justify-end">
            <button
              onClick={() =>
                openModal(
                  <PaymentModal
                    paper={p}
                    onPayResult={(isSuccess) => {
                      closeModal();
                      processPayment(p.id, isSuccess);
                    }}
                    onCancel={closeModal}
                  />
                )
              }
              className="px-6 py-3 bg-[#f2b01e] hover:bg-[#e0a014] text-[#1d1600] font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>💳</span> Pay APC Online Now ({formatINR(p.invoice?.total || 5000)})
            </button>
          </div>
        </div>
      )}

      {/* Step: Paid / Published */}
      {(p.status === 'Paid' || p.status === 'Published') && (
        <div className="bg-white border-2 border-emerald-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">✓</span>
            <h2 className="text-base font-bold">
              {p.status === 'Paid' ? 'Payment Verified - In Queue for Publishing' : 'Published Online'}
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {p.status === 'Paid'
              ? 'Your Article Processing Charge has been received and verified. The Editor will publish your manuscript to the public journal index shortly.'
              : 'Your manuscript is live and publicly accessible on the SRMU journal portal.'}
          </p>

          <InvoiceView paper={p} calc={p.calc} preview={false} currentDay={day} />

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() =>
                openModal(
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-base text-[#0d3b6e]">Official Payment Receipt</h3>
                      <button onClick={closeModal} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
                    </div>
                    <InvoiceView paper={p} calc={p.calc} preview={false} currentDay={day} />
                  </div>
                )
              }
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
            >
              View Official Receipt
            </button>

            {p.status === 'Published' && (
              <button
                onClick={() => setSession({ role: 'public', pid: p.id })}
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
              >
                Open Published Paper on Public Portal
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step: Rejected */}
      {p.status === 'Rejected' && (
        <div className="bg-white border-2 border-rose-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <span className="text-xl">✕</span>
            <h2 className="text-base font-bold">Manuscript Evaluation Concluded</h2>
          </div>

          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl text-xs leading-relaxed space-y-1">
            <p className="font-bold">Resubmission Policy (BRD Section 5 & 12):</p>
            <p>
              This manuscript was not accepted in this evaluation cycle. As per SRMU journal rules, you may resubmit your revised work. <b>The paper ID remains permanently assigned ({p.id})</b>, all previous evaluation trails are securely preserved, and Day 0 restarts today upon resubmission.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Updated Manuscript Title
              </label>
              <input
                type="text"
                value={rejTitle}
                onChange={(e) => setRejTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Revised Manuscript File (.doc, .docx, .pdf) *
              </label>
              <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={(e) => setRejFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                if (!rejFile) {
                  setErrorMsg('Please select a revised manuscript file to resubmit.');
                  return;
                }
                setErrorMsg('');
                authorResubmitRejected(p.id, rejTitle, rejFile.name);
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Resubmit Under the Same Paper ID ({p.id})
            </button>
          </div>
        </div>
      )}

      {/* Metadata & Trail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
            Manuscript Information
          </h3>
          <KeyValueList
            items={[
              ['Journal', p.journal],
              ['Domain', p.domain],
              ['Keywords', p.keywords],
              [
                'ORCID',
                <span>
                  <OrcidBadge status={p.orc.status} />{' '}
                  <span className="font-mono text-xs text-slate-700 ml-1.5">{p.author.orcid}</span>
                </span>,
              ],
            ]}
          />

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1.5">Abstract</h4>
            <p className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
              {p.abstract}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1.5">Attached Files</h4>
            <FilesTable files={p.files} />
          </div>
        </div>

        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#0d3b6e] border-b border-slate-100 pb-2">
            Activity & Decision History
          </h3>
          <div className="max-h-96 overflow-y-auto pr-1">
            <TrailView trail={p.trail} visibility="au" />
          </div>
        </div>
      </div>
    </div>
  );
}
