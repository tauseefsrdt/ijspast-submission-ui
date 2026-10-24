import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ReviewerProfile } from '../../types/user.types';
import { useAppDispatch } from '../../store';
import { updateExistingReviewer } from '../../store/slices/reviewerSlice';
import { User, Mail, Phone, Building, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: ReviewerProfile | null;
  onSuccess: (updated: ReviewerProfile) => void;
}

export const EditReviewerModal: React.FC<EditReviewerModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    department: 'Academic Peer Review Board',
    domain: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (reviewer) {
      setFormData({
        name: reviewer.name || '',
        email: reviewer.email || '',
        phone: reviewer.phone || '',
        institution: reviewer.institution || '',
        department: (reviewer as any).department || 'Academic Peer Review Board',
        domain: reviewer.domain || '',
      });
      setErrorMessage(null);
    }
  }, [reviewer, isOpen]);

  if (!reviewer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.institution.trim() || !formData.domain.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resultAction = await dispatch(
        updateExistingReviewer({
          id: reviewer.id,
          data: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
            institution: formData.institution.trim(),
            department: formData.department.trim() || undefined,
            domain: formData.domain.trim(),
          },
        })
      );

      if (updateExistingReviewer.fulfilled.match(resultAction)) {
        onSuccess(resultAction.payload);
        onClose();
      } else {
        setErrorMessage(
          (resultAction.payload as string) || 'Failed to update reviewer details. Please check the information and try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Reviewer Details"
      subtitle={`Update profile information for ${reviewer.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Full Name &amp; Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
              placeholder="e.g. Dr. Rajesh Kumar"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Institutional Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
              placeholder="reviewer@university.edu"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Affiliated Institution / University <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
                placeholder="e.g. SRMU Lucknow"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Expert Subject Domain / Specialization <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
              placeholder="e.g. Artificial Intelligence and Machine Learning"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isLoading ? 'Saving Changes...' : 'Save Reviewer Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
