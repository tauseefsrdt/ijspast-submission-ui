import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReviewers, createNewReviewer } from '../../store/slices/reviewerSlice';
import { Modal } from '../common/Modal';
import { ReviewerProfile } from '../../types/user.types';
import { Users, Plus, Shield, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { reviewerEnrollmentSchema } from '../../utils/validationSchemas';
import { FormInput } from '../forms/common/FormInput';
import { useToast } from '../../context/ToastContext';

interface AssignReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptTitle: string;
  manuscriptDomain: string;
  onAssign: (
    reviewer1Id: string,
    reviewer1Name: string,
    reviewer2Id?: string,
    reviewer2Name?: string
  ) => Promise<void> | void;
}

export const AssignReviewerModal: React.FC<AssignReviewerModalProps> = ({
  isOpen,
  onClose,
  manuscriptTitle,
  manuscriptDomain,
  onAssign,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { reviewers } = useAppSelector((state) => state.reviewers);

  const [reviewer1Id, setReviewer1Id] = useState('');
  const [reviewer2Id, setReviewer2Id] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [targetSlot, setTargetSlot] = useState<1 | 2>(1);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchReviewers());
      setIsCreatingNew(false);
      setCreatedCredentials(null);
    }
  }, [isOpen, dispatch]);

  // Preselect two distinct matching or default reviewers
  useEffect(() => {
    if (reviewers.length >= 2 && (!reviewer1Id || !reviewer2Id)) {
      const match = reviewers.filter((r) =>
        r.domain.toLowerCase().includes(manuscriptDomain.toLowerCase().slice(0, 10))
      );
      if (match.length >= 2) {
        setReviewer1Id(match[0].id);
        setReviewer2Id(match[1].id);
      } else if (match.length === 1) {
        setReviewer1Id(match[0].id);
        const second = reviewers.find((r) => r.id !== match[0].id);
        if (second) setReviewer2Id(second.id);
      } else {
        setReviewer1Id(reviewers[0].id);
        setReviewer2Id(reviewers[1].id);
      }
    } else if (reviewers.length === 1 && !reviewer1Id) {
      setReviewer1Id(reviewers[0].id);
    }
  }, [reviewers, manuscriptDomain, reviewer1Id, reviewer2Id]);

  // Formik for new reviewer enrollment
  const createReviewerFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      institution: '',
      domain: manuscriptDomain || 'Applied Science, Physics & Sensor Calibration',
    },
    validationSchema: reviewerEnrollmentSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await dispatch(
          createNewReviewer({
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            institution: values.institution.trim() || 'Research Institute',
            domain: values.domain.trim(),
          })
        ).unwrap();

        if (res?.credentials) {
          setCreatedCredentials({
            name: res.reviewer?.name || values.name,
            email: res.credentials.email,
            password: res.credentials.password,
          });
        }

        if (res?.reviewer) {
          if (targetSlot === 1) {
            setReviewer1Id(res.reviewer.id);
          } else {
            setReviewer2Id(res.reviewer.id);
          }
        }

        setIsCreatingNew(false);
        resetForm();
        toast.success(`Reviewer account enrolled for ${values.name}!`);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to enroll reviewer. Please try again.');
      }
    },
  });

  const handleConfirmAssignment = async () => {
    const rev1 = reviewers.find((r) => r.id === reviewer1Id);
    const rev2 = reviewers.find((r) => r.id === reviewer2Id);

    if (rev1 && rev2 && rev1.id !== rev2.id) {
      try {
        await onAssign(rev1.id, rev1.name, rev2.id, rev2.name);
        toast.success(`Dual reviewers assigned: ${rev1.name} & ${rev2.name}!`);
        onClose();
      } catch (err: any) {
        toast.error(err?.message || 'Assignment failed. Please try again.');
      }
    }
  };

  const isSameReviewer = Boolean(reviewer1Id && reviewer2Id && reviewer1Id === reviewer2Id);
  const canAssign = Boolean(reviewer1Id && reviewer2Id && !isSameReviewer);

  const rev1 = reviewers.find((r) => r.id === reviewer1Id);
  const rev2 = reviewers.find((r) => r.id === reviewer2Id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Dual Peer Reviewers"
      subtitle="Policy Requirement: Assign exactly two expert reviewers for evaluation"
      size="lg"
    >
      {createdCredentials ? (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Reviewer Account Created &amp; Enrolled</span>
            </div>
            <p className="text-slate-600 text-xs">
              Reviewer credentials have been generated and registered in the system. An invitation notice has been dispatched.
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
              onClick={() => setCreatedCredentials(null)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Continue Assignment
            </button>
          </div>
        </div>
      ) : isCreatingNew ? (
        <form onSubmit={createReviewerFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-800">
              Enroll New Reviewer for Slot {targetSlot} (Reviewer {targetSlot})
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Back to Selection
            </button>
          </div>

          <FormInput
            label="Full Name"
            required
            id="name"
            name="name"
            placeholder="e.g. Dr. Harish Chandra"
            value={createReviewerFormik.values.name}
            onChange={createReviewerFormik.handleChange}
            onBlur={createReviewerFormik.handleBlur}
            error={createReviewerFormik.errors.name}
            touched={createReviewerFormik.touched.name}
          />

          <FormInput
            label="Email Address"
            required
            type="email"
            id="email"
            name="email"
            placeholder="reviewer@university.edu"
            value={createReviewerFormik.values.email}
            onChange={createReviewerFormik.handleChange}
            onBlur={createReviewerFormik.handleBlur}
            error={createReviewerFormik.errors.email}
            touched={createReviewerFormik.touched.email}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Institution"
              required
              id="institution"
              name="institution"
              placeholder="e.g. Indian Institute of Science"
              value={createReviewerFormik.values.institution}
              onChange={createReviewerFormik.handleChange}
              onBlur={createReviewerFormik.handleBlur}
              error={createReviewerFormik.errors.institution}
              touched={createReviewerFormik.touched.institution}
            />

            <FormInput
              label="Phone Number"
              id="phone"
              name="phone"
              placeholder="+91 9876543210"
              value={createReviewerFormik.values.phone}
              onChange={createReviewerFormik.handleChange}
              onBlur={createReviewerFormik.handleBlur}
              error={createReviewerFormik.errors.phone}
              touched={createReviewerFormik.touched.phone}
            />
          </div>

          <FormInput
            label="Expert Subject Domain"
            required
            id="domain"
            name="domain"
            placeholder="e.g. Computer Science & AI"
            value={createReviewerFormik.values.domain}
            onChange={createReviewerFormik.handleChange}
            onBlur={createReviewerFormik.handleBlur}
            error={createReviewerFormik.errors.domain}
            touched={createReviewerFormik.touched.domain}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!createReviewerFormik.isValid}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
            >
              Generate Account &amp; Set as Reviewer {targetSlot}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Editorial Two-Reviewer Policy:</span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                To guarantee academic rigor and objective evaluation, each submitted manuscript must be assigned to <strong>two distinct peer reviewers</strong>. Both will independently submit evaluations across two stages.
              </p>
            </div>
          </div>

          {/* Manuscript Context */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Paper</span>
            <p className="font-bold text-slate-900 line-clamp-1">{manuscriptTitle}</p>
            <p className="text-slate-500 text-[11px]">Domain: <strong className="text-slate-700">{manuscriptDomain}</strong></p>
          </div>

          {/* Reviewer Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slot 1: Reviewer 1 */}
            <div className="p-4 bg-white border-2 border-indigo-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-900 text-xs bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Reviewer 1 (Primary)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetSlot(1);
                    setIsCreatingNew(true);
                  }}
                  className="text-indigo-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select First Reviewer:</label>
                <select
                  value={reviewer1Id}
                  onChange={(e) => setReviewer1Id(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                >
                  <option value="">-- Choose Reviewer 1 --</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.id === reviewer2Id}>
                      {r.name} ({r.domain.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              {rev1 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <p className="font-bold text-slate-900">{rev1.name}</p>
                  <p className="text-slate-500 truncate">{rev1.institution}</p>
                  <p className="text-indigo-600 font-mono text-[10px]">{rev1.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {rev1.activeAssignmentsCount || 0} active assignments
                  </span>
                </div>
              )}
            </div>

            {/* Slot 2: Reviewer 2 */}
            <div className="p-4 bg-white border-2 border-purple-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-bold text-purple-900 text-xs bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reviewer 2 (Secondary)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetSlot(2);
                    setIsCreatingNew(true);
                  }}
                  className="text-purple-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Second Reviewer:</label>
                <select
                  value={reviewer2Id}
                  onChange={(e) => setReviewer2Id(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                >
                  <option value="">-- Choose Reviewer 2 --</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.id === reviewer1Id}>
                      {r.name} ({r.domain.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              {rev2 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <p className="font-bold text-slate-900">{rev2.name}</p>
                  <p className="text-slate-500 truncate">{rev2.institution}</p>
                  <p className="text-purple-600 font-mono text-[10px]">{rev2.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {rev2.activeAssignmentsCount || 0} active assignments
                  </span>
                </div>
              )}
            </div>
          </div>

          {isSameReviewer && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Reviewer 1 and Reviewer 2 cannot be the same person. Please pick two different reviewers.</span>
            </div>
          )}

          {(!reviewer1Id || !reviewer2Id) && (
            <p className="text-slate-500 text-[11px] italic text-center">
              Please choose both Reviewer 1 and Reviewer 2 to proceed with assignment.
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canAssign}
              onClick={handleConfirmAssignment}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              Assign Both Reviewers (2)
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
