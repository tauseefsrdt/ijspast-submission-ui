import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../store';
import { assignManuscriptReviewer } from '../../store/slices/manuscriptSlice';
import { fetchReviewers, createNewReviewer } from '../../store/slices/reviewerSlice';
import { ReviewerProfile } from '../../types/user.types';
import { Manuscript } from '../../types/manuscript.types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EditReviewerModal } from '../../components/modals/EditReviewerModal';
import { DeleteReviewerModal } from '../../components/modals/DeleteReviewerModal';
import { reviewerEnrollmentSchema } from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';
import { useToast } from '../../context/ToastContext';
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
  const toast = useToast();
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const { reviewers, isLoading } = useAppSelector((state) => state.reviewers);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<ReviewerProfile | null>(null);
  const [deletingReviewer, setDeletingReviewer] = useState<ReviewerProfile | null>(null);

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

  // Formik for new reviewer enrollment
  const createFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      institution: '',
      domain: 'Artificial Intelligence and Machine Learning (Computing & AI)',
    },
    validationSchema: reviewerEnrollmentSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const result = await dispatch(createNewReviewer(values)).unwrap();

        if (result?.credentials) {
          setCreatedCredentials({
            name: result.reviewer?.name || values.name,
            email: result.credentials.email,
            password: result.credentials.password,
          });
        }

        toast.success(`Reviewer "${values.name}" enrolled successfully!`);
        resetForm();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to create reviewer. Please try again.');
      }
    },
  });

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
      toast.success(
        `Assigned ${selectedReviewerForAssign.name}${reviewer2Text} to manuscript ${targetManuscript.id}`
      );
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Assignment failed. Please try again.');
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
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071526] via-[#0a2540] to-[#0f4a85] rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
              Editorial Board Office
            </span>
            <span className="text-xs text-slate-400 font-semibold">•</span>
            <span className="text-xs text-slate-300 font-semibold">SRMU Peer Review Directory</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Faculty &amp; Peer Reviewers Directory
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Manage enrolled subject specialists, inspect dual-reviewer workloads, or invite new faculty reviewers to the journal board.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => dispatch(fetchReviewers())}
            className="p-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Refresh reviewer database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              createFormik.resetForm();
              setCreatedCredentials(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer ring-1 ring-amber-300/40"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Reviewer</span>
          </button>
        </div>
      </div>

      {/* Directory Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reviewer name, email, or expert domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filtered.length}</strong> of {reviewers.length} reviewer(s)
        </div>
      </div>

      {/* Reviewer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rev) => {
          const activeCount = getActiveCount(rev);
          return (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-sm shrink-0">
                      {rev.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{rev.name}</h3>
                      <span className="font-mono text-[10px] text-slate-400 block">{rev.id}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeCount > 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {activeCount > 0 ? `${activeCount} Active` : 'Available'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rev.email}</span>
                  </div>
                  {rev.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{rev.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rev.institution}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Expert Domain
                  </span>
                  <span className="inline-block text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-1 rounded-lg border border-slate-200/80 leading-tight">
                    {rev.domain}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingReviewer(rev)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Reviewer Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingReviewer(rev)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Reviewer Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAssignModal(rev)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Paper</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Reviewers Found</h3>
          <p className="text-xs text-slate-400">
            No faculty reviewers matched your search criteria. Try a different query or enroll a new reviewer.
          </p>
        </div>
      )}

      {/* Assign Reviewer Modal */}
      {selectedReviewerForAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Manuscript to Faculty Reviewer"
          subtitle={`Assigning to: ${selectedReviewerForAssign.name}`}
          size="lg"
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
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
                            <span>Author: {m.author?.name || 'Author'}</span>
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
          <form onSubmit={createFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
            <FormInput
              label="Full Name & Title"
              required
              id="name"
              name="name"
              placeholder="e.g. Dr. A. P. Sharma"
              value={createFormik.values.name}
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
              error={createFormik.errors.name}
              touched={createFormik.touched.name}
            />

            <FormInput
              label="Institutional Email"
              required
              type="email"
              id="email"
              name="email"
              placeholder="reviewer@university.edu"
              value={createFormik.values.email}
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
              error={createFormik.errors.email}
              touched={createFormik.touched.email}
            />

            <FormInput
              label="Phone Number"
              id="phone"
              name="phone"
              placeholder="+91 98100 00000"
              value={createFormik.values.phone}
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
              error={createFormik.errors.phone}
              touched={createFormik.touched.phone}
            />

            <FormInput
              label="Affiliated Institution"
              required
              id="institution"
              name="institution"
              placeholder="e.g. Indian Institute of Technology"
              value={createFormik.values.institution}
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
              error={createFormik.errors.institution}
              touched={createFormik.touched.institution}
            />

            <FormInput
              label="Expert Subject Domain"
              required
              id="domain"
              name="domain"
              placeholder="e.g. Artificial Intelligence and Machine Learning"
              value={createFormik.values.domain}
              onChange={createFormik.handleChange}
              onBlur={createFormik.handleBlur}
              error={createFormik.errors.domain}
              touched={createFormik.touched.domain}
            />

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
                disabled={!createFormik.isValid}
                className="px-5 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
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
          toast.success(`Reviewer "${updated.name}" updated successfully.`);
          dispatch(fetchReviewers());
        }}
      />

      {/* Delete Reviewer Confirmation Modal */}
      <DeleteReviewerModal
        isOpen={!!deletingReviewer}
        onClose={() => setDeletingReviewer(null)}
        reviewer={deletingReviewer}
        onSuccess={() => {
          dispatch(fetchReviewers());
        }}
      />
    </div>
  );
};
