import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchManuscripts,
  fetchManuscriptById,
  submitManuscriptRevision,
  downloadManuscriptFile,
} from '../../features/manuscripts/manuscriptThunk';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RevisionForm } from '../../components/forms/RevisionForm';
import { EditorAuthorChat } from '../../components/common/EditorAuthorChat';
import {
  ArrowLeft,
  FileText,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  History,
  RotateCcw,
  BookOpen,
  MessageSquare,
  UploadCloud,
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AuthorManuscriptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);

  const [activeTab, setActiveTab] = useState<'details' | 'files' | 'feedback' | 'communications' | 'history'>('details');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [modalResponse, setModalResponse] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const manuscript = manuscripts.find((m) => m.id === id);

  useEffect(() => {
    if (id && (!manuscript || manuscript.id !== id)) {
      dispatch(fetchManuscriptById(id));
    }
  }, [id, dispatch]);

  const handleRevisionSubmit = async (
    response: string,
    file: { name: string; size: number; type: string }
  ) => {
    if (!manuscript || !user) return;
    await dispatch(
      submitManuscriptRevision({
        manuscriptId: manuscript.id,
        response,
        file,
        authorName: user.name,
      })
    );
    dispatch(fetchManuscriptById(manuscript.id));
    setActiveTab('details');
  };

  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must not exceed 50 MB.');
      return;
    }

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Supported document formats are PDF, DOC, and DOCX.');
      return;
    }

    setModalFile({
      name: file.name,
      size: file.size,
      type: file.type || 'application/pdf',
    });
  };

  const handleModalUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFile || !manuscript || !user) {
      toast.error('Please select a revised file to upload.');
      return;
    }

    setIsSubmittingRevision(true);
    try {
      await dispatch(
        submitManuscriptRevision({
          manuscriptId: manuscript.id,
          response:
            modalResponse.trim() ||
            'Author uploaded an updated revised manuscript document after changes.',
          file: modalFile,
          authorName: user.name,
        })
      ).unwrap();
      toast.success(`Revised document "${modalFile.name}" successfully uploaded!`);
      setIsUploadModalOpen(false);
      setModalFile(null);
      setModalResponse('');
      if (modalFileInputRef.current) {
        modalFileInputRef.current.value = '';
      }
      dispatch(fetchManuscriptById(manuscript.id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload revised manuscript.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (!manuscript) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
        <h3 className="text-base font-bold text-slate-800">Manuscript Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested submission could not be located in your account.
        </p>
        <button
          type="button"
          onClick={() => navigate('/author/dashboard')}
          className="px-4 py-2 bg-[#0d3b6e] text-white text-xs font-bold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Back */}
      <button
        type="button"
        onClick={() => navigate('/author/dashboard')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Author Dashboard</span>
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
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d3b6e] tracking-tight leading-snug">
              {manuscript.title}
            </h1>

            <p className="text-xs text-slate-500">
              Subject Domain: <strong className="text-slate-700">{manuscript.domain}</strong> • Submitted on {manuscript.submissionDate}
            </p>
          </div>

          {/* Quick Status Action Banner & Upload Options */}
          <div className="flex flex-col gap-2 shrink-0 md:w-72">
            {['Revision Requested', 'Revision Submitted', 'Under Review', 'Editor Assessment'].includes(
              manuscript.status
            ) && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full py-2.5 px-4 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Revised File</span>
              </button>
            )}

            {manuscript.status === 'Revision Requested' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Revision Action Required</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Editorial board has requested revisions before final decision.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className="mt-2 w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-center cursor-pointer transition-colors"
                >
                  Submit Revisions Now
                </button>
              </div>
            )}

            {manuscript.status === 'Published' && manuscript.publicationDetails && (
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Published Online</span>
                </div>
                <p className="text-teal-800 text-[11px] font-mono">
                  DOI: {manuscript.publicationDetails.doi}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors ${
              activeTab === 'details'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manuscript Metadata &amp; Abstract
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Attached Files</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-bold">
              {1 + (manuscript.revisedFiles?.length || 0)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Review &amp; Editorial Decisions</span>
            {manuscript.status === 'Revision Requested' && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('communications')}
            className={`py-3 px-1 border-b-2 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'communications'
                ? 'border-[#0d3b6e] text-[#0d3b6e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Editor Communications</span>
            {manuscript.canCommunicate && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                {manuscript.communicationExchanges || 0}/5
              </span>
            )}
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
            Status History Trail
          </button>
        </div>
      </div>

      {/* Tab 1: Metadata */}
      {activeTab === 'details' && (
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
                Keywords
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
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Authorship Details
            </h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block text-[10px]">Corresponding Author:</span>
                <span className="font-bold text-slate-900">{manuscript.author.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Institution:</span>
                <span className="text-slate-800">{manuscript.author.institution}</span>
              </div>
              {manuscript.author.department && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Department:</span>
                  <span className="text-slate-800">{manuscript.author.department}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px]">Location:</span>
                <span className="text-slate-800">{manuscript.author.cityCountry}</span>
              </div>
              {manuscript.author.orcid && (
                <div>
                  <span className="text-slate-400 block text-[10px]">ORCID iD:</span>
                  <span className="font-mono text-indigo-700">{manuscript.author.orcid}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Files */}
      {activeTab === 'files' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Manuscript Document Versions</h3>
              <p className="text-[11px] text-slate-500">Initial submission and all revised manuscript files</p>
            </div>
            {['Revision Requested', 'Revision Submitted', 'Under Review', 'Editor Assessment'].includes(
              manuscript.status
            ) && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New Version</span>
              </button>
            )}
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Document File Name</th>
                <th className="py-3 px-4">Upload Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-800">Initial Submission</td>
                <td className="py-3 px-4 font-mono text-indigo-700">{manuscript.file.name}</td>
                <td className="py-3 px-4 text-slate-500">{manuscript.submissionDate}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => downloadManuscriptFile(manuscript.file.url || manuscript.file.name, manuscript.file.name)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>

              {(manuscript.revisedFiles || []).map((rf, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-bold text-amber-700">Revision v{rf.version || idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-indigo-700">{rf.name}</td>
                  <td className="py-3 px-4 text-slate-500">{rf.uploadedAt.split('T')[0]}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => downloadManuscriptFile(rf.url || rf.name, rf.name)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold cursor-pointer"
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

      {/* Tab 3: Feedback & Revisions */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {manuscript.status === 'Revision Requested' && (
            <RevisionForm
              manuscriptId={manuscript.id}
              revisionRequestComments={manuscript.revisionRequestComments}
              editorComments={manuscript.editorComments}
              onSubmit={handleRevisionSubmit}
              isLoading={isLoading}
            />
          )}

          {manuscript.status === 'Accepted' && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-2 text-xs">
              <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Editorial Acceptance Decision</span>
              </h3>
              <p className="leading-relaxed">
                We are pleased to inform you that your manuscript has been formally accepted for publication in the upcoming issue of IJSPAST. The production department is currently preparing typeset proofs.
              </p>
            </div>
          )}

          {manuscript.status === 'Rejected' && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-950 space-y-2 text-xs">
              <h3 className="text-base font-bold text-rose-900">Editorial Decision: Not Accepted</h3>
              <p className="leading-relaxed">{manuscript.rejectionReason}</p>
            </div>
          )}

          {manuscript.status === 'Published' && manuscript.publicationDetails && (
            <div className="p-6 bg-teal-50 border border-teal-200 rounded-2xl text-teal-950 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-teal-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <span>Official Journal Publication Record</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-200/60 text-teal-900 font-bold text-[10px] uppercase">
                  Live Online
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <p>Volume: <strong>{manuscript.publicationDetails.volume}</strong> • Issue: <strong>{manuscript.publicationDetails.issue}</strong></p>
                <p className="font-mono">DOI: <strong className="text-teal-800">{manuscript.publicationDetails.doi}</strong></p>
                <p>Publication Date: <strong>{manuscript.publicationDetails.publishedDate}</strong></p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/published')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Article on Public Journal Website</span>
                </button>
              </div>
            </div>
          )}

          {manuscript.status === 'Revision Submitted' && (
            <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Revision Resubmission Under Active Re-evaluation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-2xs cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Further Revisions</span>
                </button>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Your point-by-point rebuttal and revised manuscript have been safely received. The paper is currently being re-evaluated by the assigned peer reviewers and editor. If the editor has requested further adjustments in the Communications Desk, you may upload an updated document version anytime.
              </p>
              {manuscript.authorRevisionResponse && (
                <div className="p-3.5 bg-white border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 block text-[11px]">Your Point-by-Point Rebuttal:</span>
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{manuscript.authorRevisionResponse}</p>
                </div>
              )}
            </div>
          )}

          {['Submitted', 'Editor Assessment', 'Under Review', 'Review Completed'].includes(
            manuscript.status
          ) && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-2">
              <Clock className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800">
                Manuscript is under active editorial and peer review assessment ({manuscript.status})
              </p>
              <p>
                You will be notified once reviewers submit their evaluation reports and the Editor-in-Chief formulates a formal decision.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Editor Communications Desk */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          {['Revision Requested', 'Revision Submitted', 'Under Review', 'Editor Assessment'].includes(
            manuscript.status
          ) && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <UploadCloud className="w-4 h-4 text-[#0d3b6e] shrink-0" />
                <span>
                  <strong>Need to submit updated files?</strong> You can attach your revised document directly into a message below, or use the dedicated upload button.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-colors shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Revised File</span>
              </button>
            </div>
          )}

          <EditorAuthorChat
            manuscriptId={manuscript.id}
            userRole="author"
            canCommunicate={manuscript.canCommunicate}
          />
        </div>
      )}

      {/* Tab 4: History Trail */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submission Workflow Event History</h3>
              <p className="text-[11px] text-slate-500">Official lifecycle events and milestone audit log.</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Double-Blind Protected
            </span>
          </div>
          <div className="space-y-3">
            {(manuscript.history || [])
              .filter((evt) => {
                const role = (evt.role || '').toLowerCase();
                const actor = (evt.actor || '').toLowerCase();
                const comment = (evt.comment || '').toLowerCase();
                // Requirement 1: Hide all reviewer-related information from Author's status history
                if (role === 'reviewer') return false;
                if (actor.includes('reviewer')) return false;
                if (comment.includes('submitted to editor by') && role !== 'author') return false;
                return true;
              })
              .map((evt) => {
                let sanitized = evt.comment || '';
                if (/Assigned to Reviewer/i.test(sanitized)) {
                  sanitized = sanitized.replace(/Assigned to Reviewer.*?for/i, 'Assigned for');
                }
                return { ...evt, comment: sanitized };
              })
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

      {/* Upload Revised Manuscript Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0d3b6e]/10 text-[#0d3b6e] flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Upload Revised Manuscript</h3>
                  <p className="text-[11px] text-slate-500">Attach updated document with your modifications</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setModalFile(null);
                  setModalResponse('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleModalUploadSubmit} className="p-6 space-y-4">
              {/* File Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Revised Document File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileSelect}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                {modalFile ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-[#0d3b6e] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-blue-950 truncate">{modalFile.name}</p>
                        <p className="text-[10px] text-blue-700 font-mono">
                          {(modalFile.size / 1024).toFixed(1)} KB • {modalFile.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalFile(null);
                        if (modalFileInputRef.current) modalFileInputRef.current.value = '';
                      }}
                      className="p-1 hover:bg-blue-100 rounded-lg text-blue-700 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0d3b6e] rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
                  >
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      Click to select revised document
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF, DOC, or DOCX (maximum 50 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Author Notes / Changes Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Summary of Changes / Response to Editor (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalResponse}
                  onChange={(e) => setModalResponse(e.target.value)}
                  placeholder="Describe the changes made in this version (e.g., corrected heading sizes, revised figures, updated references)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setModalFile(null);
                    setModalResponse('');
                  }}
                  disabled={isSubmittingRevision}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalFile || isSubmittingRevision}
                  className="px-5 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSubmittingRevision ? 'Uploading...' : 'Submit Revised Version'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
