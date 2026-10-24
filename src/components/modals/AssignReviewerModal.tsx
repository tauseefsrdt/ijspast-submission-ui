import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReviewers, createNewReviewer } from '../../store/slices/reviewerSlice';
import { Modal } from '../common/Modal';
import { ReviewerProfile } from '../../types/user.types';
import { Users, Plus, Shield, CheckCircle2, Key } from 'lucide-react';

interface AssignReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptTitle: string;
  manuscriptDomain: string;
  onAssign: (reviewerId: string, reviewerName: string) => Promise<void> | void;
}

export const AssignReviewerModal: React.FC<AssignReviewerModalProps> = ({
  isOpen,
  onClose,
  manuscriptTitle,
  manuscriptDomain,
  onAssign,
}) => {
  const dispatch = useAppDispatch();
  const { reviewers } = useAppSelector((state) => state.reviewers);

  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const [newReviewerForm, setNewReviewerForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    domain: manuscriptDomain || 'Applied Science, Physics & Sensor Calibration',
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchReviewers());
      setIsCreatingNew(false);
      setCreatedCredentials(null);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (reviewers.length > 0 && !selectedReviewerId) {
      const match = reviewers.find((r) =>
        r.domain.toLowerCase().includes(manuscriptDomain.toLowerCase().slice(0, 10))
      );
      setSelectedReviewerId(match ? match.id : reviewers[0].id);
    }
  }, [reviewers, manuscriptDomain, selectedReviewerId]);

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerForm.name.trim() || !newReviewerForm.email.trim()) return;

    try {
      const res = await dispatch(
        createNewReviewer({
          name: newReviewerForm.name.trim(),
          email: newReviewerForm.email.trim(),
          phone: newReviewerForm.phone.trim(),
          institution: newReviewerForm.institution.trim() || 'Research Institute',
          domain: newReviewerForm.domain,
        })
      ).unwrap();

      if (res?.credentials) {
        setCreatedCredentials({
          name: res.reviewer?.name || newReviewerForm.name,
          email: res.credentials.email,
          password: res.credentials.password,
        });
      }

      if (res?.reviewer) {
        setSelectedReviewerId(res.reviewer.id);
      }
    } catch (err: any) {
      console.error('Error creating reviewer:', err);
    }
  };

  const handleConfirmAssignment = () => {
    const rev = reviewers.find((r) => r.id === selectedReviewerId);
    if (rev) {
      onAssign(rev.id, rev.name);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Peer Reviewer"
      subtitle={`Manuscript: ${manuscriptTitle}`}
      size="md"
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
            <p className="text-[11px] text-slate-500 italic">
              Note: The reviewer may now log in to the portal using these credentials.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleConfirmAssignment}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Proceed with Assignment
            </button>
          </div>
        </div>
      ) : isCreatingNew ? (
        <form onSubmit={handleCreateAndAssign} className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-800">Enroll New Reviewer</h4>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Select Existing Reviewer
            </button>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newReviewerForm.name}
              onChange={(e) => setNewReviewerForm({ ...newReviewerForm, name: e.target.value })}
              placeholder="e.g. Dr. Harish Chandra"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newReviewerForm.email}
              onChange={(e) => setNewReviewerForm({ ...newReviewerForm, email: e.target.value })}
              placeholder="reviewer@university.edu"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Institution</label>
            <input
              type="text"
              value={newReviewerForm.institution}
              onChange={(e) =>
                setNewReviewerForm({ ...newReviewerForm, institution: e.target.value })
              }
              placeholder="e.g. Indian Institute of Science"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Expert Subject Domain *</label>
            <input
              type="text"
              value={newReviewerForm.domain}
              onChange={(e) => setNewReviewerForm({ ...newReviewerForm, domain: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            >
              Generate Account &amp; Assign
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select a verified domain expert from the journal's peer review roster:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {reviewers.map((r) => {
              const isSelected = r.id === selectedReviewerId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReviewerId(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <p className="text-[11px] text-slate-500">{r.domain}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{r.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {r.activeAssignmentsCount} active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="text-indigo-600 hover:underline font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Reviewer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedReviewerId}
                onClick={handleConfirmAssignment}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Assign Reviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
