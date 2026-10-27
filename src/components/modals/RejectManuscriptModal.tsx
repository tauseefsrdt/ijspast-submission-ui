import React from 'react';
import { useFormik } from 'formik';
import { Modal } from '../common/Modal';
import { FormTextarea } from '../forms/common/FormTextarea';
import { rejectSchema } from '../../utils/validationSchemas';

interface RejectManuscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  onReject: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const RejectManuscriptModal: React.FC<RejectManuscriptModalProps> = ({
  isOpen,
  onClose,
  manuscriptId,
  onReject,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: rejectSchema,
    onSubmit: async (values, { resetForm }) => {
      await onReject(values.reason.trim());
      resetForm();
    },
  });

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Manuscript"
      subtitle={`Manuscript: ${manuscriptId}`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
        <p className="text-slate-600">
          Provide the formal editorial reason for rejection (required):
        </p>

        <FormTextarea
          rows={3}
          id="reason"
          name="reason"
          placeholder="State the scientific grounds or scope limitations..."
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.reason}
          touched={formik.touched.reason}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Confirming...' : 'Confirm Rejection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
