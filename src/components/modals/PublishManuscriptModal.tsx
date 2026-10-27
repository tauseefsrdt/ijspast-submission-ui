import React from 'react';
import { useFormik } from 'formik';
import { Modal } from '../common/Modal';
import { FormInput } from '../forms/common/FormInput';
import { publishSchema } from '../../utils/validationSchemas';

interface PublishManuscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  initialData?: {
    doi: string;
    volume: string;
    issue: string;
    publishedDate?: string;
  };
  onPublish: (publishData: { doi: string; volume: string; issue: string; publishedDate?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const PublishManuscriptModal: React.FC<PublishManuscriptModalProps> = ({
  isOpen,
  onClose,
  manuscriptId,
  initialData = {
    doi: `10.5555/srmu.${new Date().getFullYear()}.${manuscriptId.toLowerCase()}`,
    volume: `${new Date().getFullYear() - 2023}`,
    issue: `${Math.ceil((new Date().getMonth() + 1) / 3)}`,
  },
  onPublish,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: initialData,
    enableReinitialize: true,
    validationSchema: publishSchema,
    onSubmit: async (values, { resetForm }) => {
      await onPublish(values);
      resetForm();
    },
  });

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Manuscript Online"
      subtitle={`Issue DOI and publication volume for ${manuscriptId}`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
        <div>
          <label htmlFor="doi" className="font-bold text-slate-700 block mb-1">
            Digital Object Identifier (DOI):
          </label>
          <FormInput
            id="doi"
            name="doi"
            type="text"
            className="font-mono"
            placeholder="10.5555/srmu.2025.ms-1234"
            value={formik.values.doi}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.doi}
            touched={formik.touched.doi}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="volume" className="font-bold text-slate-700 block mb-1">
              Volume:
            </label>
            <FormInput
              id="volume"
              name="volume"
              type="text"
              placeholder="e.g. 3"
              value={formik.values.volume}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.volume}
              touched={formik.touched.volume}
            />
          </div>
          <div>
            <label htmlFor="issue" className="font-bold text-slate-700 block mb-1">
              Issue:
            </label>
            <FormInput
              id="issue"
              name="issue"
              type="text"
              placeholder="e.g. 1"
              value={formik.values.issue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.issue}
              touched={formik.touched.issue}
            />
          </div>
        </div>

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
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Publishing...' : 'Publish to Open Access'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
