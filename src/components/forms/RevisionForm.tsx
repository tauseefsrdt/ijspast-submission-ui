import React, { useState } from 'react';
import { Upload, Send, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateFile, formatFileSize } from '../../utils/validation';

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
  const [response, setResponse] = useState('');
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const valid = validateFile(selected);
      if (!valid.isValid) {
        setError(valid.error || 'Invalid file');
        return;
      }
      setFile({
        name: selected.name,
        size: selected.size,
        type: selected.type || 'application/pdf',
      });
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) {
      setError('Please provide a point-by-point response to the editorial and reviewer comments.');
      return;
    }
    if (!file) {
      setError('Please upload the revised manuscript document.');
      return;
    }
    setError(null);
    onSubmit(response.trim(), file);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-[#0d3b6e] tracking-tight">
          Author Revision &amp; Resubmission Desk
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit revised manuscript and address all reviewer and editorial critiques for <strong>{manuscriptId}</strong>.
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
      <div className="space-y-1.5 text-xs">
        <label className="font-bold text-slate-800 block">
          Point-by-Point Author Response *
        </label>
        <textarea
          rows={5}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Detailed response indicating how each comment was addressed, citing revised section and page numbers..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 leading-relaxed font-sans"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2 text-xs">
        <label className="font-bold text-slate-800 block">
          Upload Revised Manuscript File (.doc, .docx, .pdf up to 25MB) *
        </label>
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/40">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700">
            {file ? file.name : 'Choose revised manuscript file'}
          </p>
          <p className="text-[11px] text-slate-400">Accepted formats: .doc, .docx, .pdf</p>
          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleFileChange}
            className="mt-3 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0d3b6e] file:text-white cursor-pointer"
          />
        </div>
      </div>

      {error && <p className="text-rose-600 text-xs font-semibold">{error}</p>}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Submitting Revision...' : 'Submit Revised Manuscript to Editor'}</span>
        </button>
      </div>
    </form>
  );
};
