import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Modal } from '../common/Modal';
import { ReviewerProfile } from '../../types/user.types';
import { useAppDispatch } from '../../store';
import { updateExistingReviewer } from '../../store/slices/reviewerSlice';
import { User, Mail, Phone, Building, Briefcase, AlertCircle } from 'lucide-react';
import { editReviewerSchema } from '../../utils/validationSchemas';
import { FormInput } from '../forms/common/FormInput';
import { useToast } from '../../context/ToastContext';

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
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: reviewer?.name || '',
      email: reviewer?.email || '',
      phone: reviewer?.phone || '',
      institution: reviewer?.institution || '',
      department: (reviewer as any)?.department || 'Academic Peer Review Board',
      domain: reviewer?.domain || '',
    },
    validationSchema: editReviewerSchema,
    onSubmit: async (values) => {
      if (!reviewer) return;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const resultAction = await dispatch(
          updateExistingReviewer({
            id: reviewer.id,
            data: {
              name: values.name.trim(),
              email: values.email.trim(),
              phone: values.phone.trim() || undefined,
              institution: values.institution.trim(),
              department: values.department.trim() || undefined,
              domain: values.domain.trim(),
            },
          })
        );

        if (updateExistingReviewer.fulfilled.match(resultAction)) {
          toast.success(`Reviewer profile for ${values.name} updated successfully!`);
          onSuccess(resultAction.payload);
          onClose();
        } else {
          const msg =
            (resultAction.payload as string) ||
            'Failed to update reviewer details. Please check the information and try again.';
          setErrorMessage(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        const msg = err.message || 'An unexpected error occurred.';
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!reviewer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Reviewer Details"
      subtitle={`Update profile information for ${reviewer.name}`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <FormInput
          label="Full Name & Title"
          required
          id="name"
          name="name"
          placeholder="e.g. Dr. Rajesh Kumar"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.name}
          touched={formik.touched.name}
          leftIcon={<User className="w-4 h-4" />}
        />

        <FormInput
          label="Institutional Email Address"
          required
          type="email"
          id="email"
          name="email"
          placeholder="reviewer@university.edu"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="Affiliated Institution / University"
            required
            id="institution"
            name="institution"
            placeholder="e.g. SRMU Lucknow"
            value={formik.values.institution}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.institution}
            touched={formik.touched.institution}
            leftIcon={<Building className="w-4 h-4" />}
          />

          <FormInput
            label="Contact Phone"
            id="phone"
            name="phone"
            placeholder="+91 98765 43210"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.phone}
            touched={formik.touched.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        <FormInput
          label="Expert Subject Domain / Specialization"
          required
          id="domain"
          name="domain"
          placeholder="e.g. Artificial Intelligence and Machine Learning"
          value={formik.values.domain}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.domain}
          touched={formik.touched.domain}
          leftIcon={<Briefcase className="w-4 h-4" />}
        />

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
            disabled={isLoading || !formik.isValid}
            className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isLoading ? 'Saving Changes...' : 'Save Reviewer Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
