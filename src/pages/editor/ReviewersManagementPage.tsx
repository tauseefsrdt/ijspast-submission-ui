import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { assignManuscriptReviewer } from '../../store/slices/manuscriptSlice';
import { fetchReviewers, createNewReviewer } from '../../store/slices/reviewerSlice';
import { ReviewerProfile } from '../../types/user.types';
import { Manuscript } from '../../types/manuscript.types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EditReviewerModal } from '../../components/modals/EditReviewerModal';
import { DeleteReviewerModal } from '../../components/modals/DeleteReviewerModal';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  Clock,
  Key,
  UserCheck,
  FileText,
  Calendar,
  Sparkles,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
} from 'lucide-react';

export const ReviewersManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const { reviewers, isLoading } = useAppSelector((state) => state.reviewers);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<ReviewerProfile | null>(null);
  const [deletingReviewer, setDeletingReviewer] = useState<ReviewerProfile | null>(null);
  const [newReviewer, setNewReviewer] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    domain: 'Artificial Intelligence and Machine Learning (Computing & AI)',
  });
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  // Assign Reviewer to Manuscript Modal state
  const [selectedReviewerForAssign, setSelectedReviewerForAssign] = useState<ReviewerProfile | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [assignNotes, setAssignNotes] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchReviewers());
  }, [dispatch]);

  // Compute active assignments dynamically from live manuscripts store
  const getActiveCount = (rev: ReviewerProfile) => {
    return manuscripts.filter(
      (m) =>
        (m.status === 'Under Review' || m.status === 'Reviewer Assigned') &&
        (m.assignedReviewerId === rev.id ||
          (m.assignedReviewerName && m.assignedReviewerName.toLowerCase() === rev.name.toLowerCase()))
    ).length;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewer.name.trim() || !newReviewer.email.trim()) return;

    try {
      const result = await dispatch(createNewReviewer(newReviewer)).unwrap();

      if (result?.credentials) {
        setCreatedCredentials({
          name: result.reviewer?.name || newReviewer.name,
          email: result.credentials.email,
          password: result.credentials.password,
        });
      }

      setNewReviewer({
        name: '',
        email: '',
        phone: '',
        institution: '',
        domain: 'Artificial Intelligence and Machine Learning (Computing & AI)',
      });
    } catch (err: any) {
      console.error('Failed to create reviewer:', err);
    }
  };

  const handleOpenAssignModal = (reviewer: ReviewerProfile) => {
    setSelectedReviewerForAssign(reviewer);

    // Pick candidate manuscript: prioritize unassigned or domain-matching submitted papers
    const domainMatch = manuscripts.find(
      (m) =>
        (m.status === 'Submitted' || m.status === 'Editor Assessment') &&
        (m.domain.toLowerCase().includes(reviewer.domain.toLowerCase().slice(0, 10)) ||
          reviewer.domain.toLowerCase().includes(m.domain.toLowerCase().slice(0, 10)))
    );

    const firstAwaiting = manuscripts.find(
      (m) => m.status === 'Submitted' || m.status === 'Editor Assessment'
    );

    setSelectedManuscriptId(domainMatch ? domainMatch.id : firstAwaiting ? firstAwaiting.id : manuscripts[0]?.id || '');
    setDeadlineDays(14);
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewerForAssign || !selectedManuscriptId) return;

    const targetManuscript = manuscripts.find((m) => m.id === selectedManuscriptId);
    if (!targetManuscript) return;

    const secondReviewer = reviewers.find((r) => r.id !== selectedReviewerForAssign.id);
    setIsSubmittingAssign(true);
    try {
      await dispatch(
        assignManuscriptReviewer({
          manuscriptId: targetManuscript.id,
          reviewerId: selectedReviewerForAssign.id,
          reviewerName: selectedReviewerForAssign.name,
          reviewer2Id: secondReviewer?.id,
          reviewer2Name: secondReviewer?.name,
          deadlineDays,
          notes: assignNotes,
        })
      ).unwrap();

      const reviewer2Text = secondReviewer ? ` and ${secondReviewer.name}` : '';
      setSuccessToast(
        `Successfully assigned ${selectedReviewerForAssign.name}${reviewer2Text} to manuscript "${targetManuscript.id}". Status transitioned to "Under Review". Reviewers notified via email.`
      );
      setIsAssignModalOpen(false);
    } catch (err: any) {
      console.error('Assignment error:', err);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const filtered = reviewers.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">{successToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
            Reviewer Directory &amp; Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain registered academic peer reviewers, assign incoming manuscripts, and track active workloads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreatedCredentials(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Reviewer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviewers by name, email, or domain..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Reviewer Cards Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Reviewer Name</th>
                <th className="py-3 px-4">Subject Domain</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Active Assignments</th>
                <th className="py-3 px-4 text-center">Completed Reports</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rev) => {
                const liveActiveCount = getActiveCount(rev);
                return (
                  <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{rev.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {rev.id}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs">
                        {rev.domain}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">{rev.institution}</td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">{rev.email}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          liveActiveCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{liveActiveCount} Active</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {rev.totalCompletedReviews}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(rev)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          title={`Assign a manuscript to ${rev.name}`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Paper</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewer(rev)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl transition-colors cursor-pointer"
                          title={`Edit ${rev.name}'s profile`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingReviewer(rev)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl transition-colors cursor-pointer"
                          title={`Delete ${rev.name} from directory`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Manuscript to Reviewer Modal */}
      {selectedReviewerForAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Manuscript to Reviewer"
          subtitle={`Assigning paper to ${selectedReviewerForAssign.name}`}
          size="lg"
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
            {/* Reviewer Summary Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedReviewerForAssign.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                  {selectedReviewerForAssign.domain}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                <span>{selectedReviewerForAssign.institution}</span>
                <span>•</span>
                <span className="font-mono">{selectedReviewerForAssign.email}</span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">
                  {getActiveCount(selectedReviewerForAssign)} currently active review(s)
                </span>
              </div>
            </div>

            {/* Manuscript Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-800 block">
                  Select Manuscript for Peer Review *
                </label>
                <span className="text-[11px] text-slate-400">
                  {manuscripts.length} manuscript(s) available
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {manuscripts.map((m) => {
                  const isSelected = m.id === selectedManuscriptId;
                  const isDomainMatch =
                    m.domain.toLowerCase().includes(selectedReviewerForAssign.domain.toLowerCase().slice(0, 10)) ||
                    selectedReviewerForAssign.domain.toLowerCase().includes(m.domain.toLowerCase().slice(0, 10));

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedManuscriptId(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/10'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-700 text-xs">
                              {m.id}
                            </span>
                            {isDomainMatch && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Domain Match</span>
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 leading-snug">{m.title}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>Author: {m.author.name}</span>
                            <span>•</span>
                            <span className="italic">{m.domain}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <StatusBadge status={m.status} size="sm" />
                          {m.assignedReviewerName && (
                            <p className="text-[10px] text-slate-400">
                              Assigned to: {m.assignedReviewerName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deadline selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Review Turnaround Deadline *
                </label>
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                >
                  <option value={7}>7 Days (Fast Track / Accelerated)</option>
                  <option value={14}>14 Days (Standard IJSPAST Window)</option>
                  <option value={21}>21 Days (Comprehensive Evaluation)</option>
                  <option value={30}>30 Days (Extended Domain Review)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Confidential Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Please evaluate methodology and sensor noise bounds."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Peer review assignment email with access link will be dispatched automatically.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedManuscriptId || isSubmittingAssign}
                  className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAssign ? 'Assigning...' : 'Confirm Assignment & Notify'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Enroll Reviewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll Faculty Reviewer"
        subtitle="Account credentials will be automatically generated and registered in the database"
        size="md"
      >
        {createdCredentials ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Reviewer Enrolled Successfully</span>
              </div>
              <p className="text-slate-600">
                The reviewer account has been registered. An invitation notice has been dispatched. The generated credentials are:
              </p>
              <div className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-slate-800 space-y-1">
                <p>
                  <strong>Name:</strong> {createdCredentials.name}
                </p>
                <p>
                  <strong>Email:</strong> {createdCredentials.email}
                </p>
                <p>
                  <strong>Password:</strong>{' '}
                  <span className="font-bold text-indigo-700">{createdCredentials.password}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-[#0d3b6e] text-white font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name &amp; Title *</label>
              <input
                type="text"
                required
                value={newReviewer.name}
                onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
                placeholder="e.g. Dr. A. P. Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                value={newReviewer.email}
                onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
                placeholder="reviewer@university.edu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={newReviewer.phone}
                onChange={(e) => setNewReviewer({ ...newReviewer, phone: e.target.value })}
                placeholder="+91 98100 00000"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Affiliated Institution</label>
              <input
                type="text"
                value={newReviewer.institution}
                onChange={(e) =>
                  setNewReviewer({ ...newReviewer, institution: e.target.value })
                }
                placeholder="e.g. Indian Institute of Technology"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Expert Subject Domain *</label>
              <input
                type="text"
                value={newReviewer.domain}
                onChange={(e) => setNewReviewer({ ...newReviewer, domain: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl cursor-pointer"
              >
                Create Reviewer Account
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Reviewer Modal */}
      <EditReviewerModal
        isOpen={!!editingReviewer}
        onClose={() => setEditingReviewer(null)}
        reviewer={editingReviewer}
        onSuccess={(updated) => {
          setSuccessToast(`Reviewer "${updated.name}" updated successfully.`);
          dispatch(fetchReviewers());
        }}
      />

      {/* Delete Reviewer Confirmation Modal */}
      <DeleteReviewerModal
        isOpen={!!deletingReviewer}
        onClose={() => setDeletingReviewer(null)}
        reviewer={deletingReviewer}
        onSuccess={() => {
          setSuccessToast('Reviewer deleted successfully from journal directory.');
          dispatch(fetchReviewers());
        }}
      />
    </div>
  );
};
