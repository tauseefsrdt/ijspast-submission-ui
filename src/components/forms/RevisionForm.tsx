import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Upload, Send, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/validation';
import { revisionSchema } from '../../utils/validationSchemas';
import { FormTextarea } from './common/FormTextarea';
import { useToast } from '../../context/ToastContext';

interface RevisionFormProps {
  manuscriptId: string;
  revisionRequestComments?: string;
  onSubmit: (response: string, file: { name: string; size: number; type: string }) => Promise<void> | void;
  isLoading?: boolean;
}

export const RevisionForm: React.FC<RevisionFormProps> = ({
  manuscriptId,
  revisionRequestComments,
  onSubmit,
  isLoading = false,
}) => {
  const toast = useToast();
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      response: '',
    },
    validationSchema: revisionSchema,
    onSubmit: async (values) => {
      if (!file) {
        setFileError('Please upload the revised manuscript document.');
        toast.error('Revised manuscript file is required.');
        return;
      }

      setFileError(null);

      try {
        await onSubmit(values.response.trim(), file);
        toast.success(`Revision for ${manuscriptId} submitted successfully to the Editorial Board!`);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to submit revision. Please try again.');
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const valid = validateFile(selected);
      if (!valid.isValid) {
        setFileError(valid.error || 'Invalid file format or size');
        toast.error(valid.error || 'Invalid file format or size');
        return;
      }
      setFile({
        name: selected.name,
        size: selected.size,
        type: selected.type || 'application/pdf',
      });
      setFileError(null);
      toast.info(`Selected revised file: ${selected.name}`);
    }
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
      noValidate
    >
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-[#0d3b6e] tracking-tight">
          Author Revision &amp; Resubmission Desk
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit revised manuscript and address all reviewer and editorial critiques for{' '}
          <strong>{manuscriptId}</strong>.
        </p>
      </div>

      {revisionRequestComments && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs">
          <span className="font-bold text-amber-900 block">
            Editorial Board &amp; Reviewer Requirements:
          </span>
          <p className="text-amber-950 whitespace-pre-wrap leading-relaxed">
            {revisionRequestComments}
          </p>
        </div>
      )}

      {/* Point-by-point response */}
      <FormTextarea
        label="Point-by-Point Author Response"
        required
        rows={5}
        id="response"
        name="response"
        placeholder="Detailed response indicating how each comment was addressed, citing revised section and page numbers..."
        value={formik.values.response}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.errors.response}
        touched={formik.touched.response}
      />

      {/* File Upload */}
      <div className="space-y-2 text-xs">
        <label className="font-bold text-slate-800 block">
          Upload Revised Manuscript File (.doc, .docx, .pdf up to 25MB){' '}
          <span className="text-red-500 font-bold ml-0.5">*</span>
        </label>
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/40">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700">
            {file ? file.name : 'Choose revised manuscript file'}
          </p>
          <p className="text-[11px] text-slate-400">Accepted formats: .doc, .docx, .pdf</p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <label className="px-4 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {file && (
            <p className="text-emerald-700 font-semibold text-[11px] mt-2">
              Ready: {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>

        {fileError && <p className="text-rose-600 text-xs font-semibold">{fileError}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading || !formik.isValid}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Submitting Revision...' : 'Submit Revised Manuscript to Editor'}</span>
        </button>
      </div>
    </form>
  );
};
