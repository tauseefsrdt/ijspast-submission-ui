import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Upload, Send, FileText, CheckCircle2, AlertCircle, X, ShieldCheck, RotateCcw } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/validation';
import { revisionSchema } from '../../utils/validationSchemas';
import { FormTextarea } from './common/FormTextarea';
import { useToast } from '../../context/ToastContext';

interface RevisionFormProps {
  manuscriptId: string;
  manuscriptTitle?: string;
  manuscriptDomain?: string;
  revisionRound?: number;
  revisionRequestComments?: string;
  editorComments?: string;
  onSubmit: (response: string, file: { name: string; size: number; type: string }) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const RevisionForm: React.FC<RevisionFormProps> = ({
  manuscriptId,
  manuscriptTitle,
  manuscriptDomain,
  revisionRound = 2,
  revisionRequestComments,
  editorComments,
  onSubmit,
  isLoading = false,
  onCancel,
}) => {
  const toast = useToast();
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [declaration, setDeclaration] = useState(true);

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

      if (!declaration) {
        toast.error('Please confirm the revision submission declaration.');
        return;
      }

      setFileError(null);

      try {
        await onSubmit(values.response.trim(), file);
        toast.success(`Revision v${revisionRound} for ${manuscriptId} submitted successfully to the Editorial Board!`);
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
      className="bg-white border-2 border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
      noValidate
    >
      {/* Revision Form Header with Version Template Badge */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-amber-700" />
              <span>Revision Submission Form — Version {revisionRound}</span>
            </span>
            <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              {manuscriptId}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0d3b6e] tracking-tight">
            Author Revision &amp; Resubmission Template
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a separate revision submission addressing all reviewer critiques and editorial directives.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-center p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Manuscript Context Info Box */}
      {(manuscriptTitle || manuscriptDomain) && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          {manuscriptTitle && (
            <p className="font-bold text-slate-900 line-clamp-1">
              Title: <span className="text-slate-700 font-semibold">{manuscriptTitle}</span>
            </p>
          )}
          {manuscriptDomain && (
            <p className="text-slate-500 text-[11px]">
              Domain: <span className="text-slate-700 font-medium">{manuscriptDomain}</span>
            </p>
          )}
        </div>
      )}

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

      {editorComments && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
          <span className="font-bold text-blue-900 block">
            Editor Comments &amp; Clarification:
          </span>
          <p className="text-blue-950 whitespace-pre-wrap leading-relaxed">
            {editorComments}
          </p>
        </div>
      )}

      {/* Point-by-point response */}
      <FormTextarea
        label={`Point-by-Point Author Response (Version ${revisionRound})`}
        required
        rows={5}
        id="response"
        name="response"
        placeholder={`Detail all modifications and corrections made for Revision v${revisionRound}, citing updated section and page numbers...`}
        value={formik.values.response}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.errors.response}
        touched={formik.touched.response}
      />

      {/* File Upload */}
      <div className="space-y-2 text-xs">
        <label className="font-bold text-slate-800 block">
          Upload Revised Manuscript File (.doc, .docx, .pdf up to 50MB){' '}
          <span className="text-red-500 font-bold ml-0.5">*</span>
        </label>
        <div className="p-4 border-2 border-dashed border-slate-200 hover:border-[#0d3b6e] rounded-xl text-center bg-slate-50/40 transition-colors">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700">
            {file ? file.name : `Choose revised manuscript file for Revision v${revisionRound}`}
          </p>
          <p className="text-[11px] text-slate-400">Accepted formats: .doc, .docx, .pdf (maximum 50 MB)</p>

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
            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg inline-flex items-center gap-2 text-emerald-800 font-medium text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready for submission: <strong>{file.name}</strong> ({formatFileSize(file.size)})</span>
            </div>
          )}
        </div>

        {fileError && <p className="text-rose-600 text-xs font-semibold">{fileError}</p>}
      </div>

      {/* Submission Declaration */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
        <input
          type="checkbox"
          id="revision-declaration"
          checked={declaration}
          onChange={(e) => setDeclaration(e.target.checked)}
          className="mt-0.5 rounded border-slate-300 text-[#0d3b6e] focus:ring-[#0d3b6e] cursor-pointer"
        />
        <label htmlFor="revision-declaration" className="cursor-pointer select-none text-[11px] leading-relaxed">
          I declare that this revised manuscript document (Version {revisionRound}) incorporates the modifications indicated in the rebuttal response and adheres to IJSPAST ethical publication guidelines.
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !formik.isValid || !file || !declaration}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? `Submitting Revision v${revisionRound}...` : `Submit Revision v${revisionRound} to Editor`}</span>
        </button>
      </div>
    </form>
  );
};
