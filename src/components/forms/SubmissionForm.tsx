import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Upload,
  Send,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ManuscriptSubmissionPayload } from '../../types/manuscript.types';
import { countWords, parseKeywords, validateFile, formatFileSize } from '../../utils/validation';
import { submissionSchema } from '../../utils/validationSchemas';
import { FormInput } from './common/FormInput';
import { FormTextarea } from './common/FormTextarea';
import { FormSelect } from './common/FormSelect';
import { useToast } from '../../context/ToastContext';

interface SubmissionFormProps {
  initialAuthor?: {
    name?: string;
    email?: string;
    institution?: string;
    department?: string;
  };
  onSubmit: (payload: ManuscriptSubmissionPayload) => Promise<void> | void;
  isLoading?: boolean;
}

export const DOMAIN_OPTIONS = [
  'Artificial Intelligence and Machine Learning (Computing & AI)',
  'Applied Science, Physics & Sensor Calibration',
  'Electrical, Electronics & Communications Engineering',
  'Information Technology and Cloud Computing',
  'Mechanical and Aerospace Engineering',
  'Civil and Structural Engineering',
  'Environmental Engineering & Biotechnology',
  'Applied Mathematics & Computational Statistics',
];

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  initialAuthor,
  onSubmit,
  isLoading = false,
}) => {
  const toast = useToast();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: initialAuthor?.name || '',
      email: initialAuthor?.email || '',
      institution: initialAuthor?.institution || '',
      department: initialAuthor?.department || '',
      cityCountry: '',
      orcid: '',
      title: '',
      domain: DOMAIN_OPTIONS[0],
      abstract: '',
      keywords: '',
      coauthors: '',
      declaration: false,
    },
    validationSchema: submissionSchema,
    onSubmit: async (values) => {
      if (!selectedFile) {
        setFileError('Please upload a manuscript file (.doc, .docx, or .pdf)');
        toast.error('Manuscript document file is required.');
        const el = document.getElementById('file-upload-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setFileError(null);

      try {
        await onSubmit({
          author: {
            name: values.name.trim(),
            email: values.email.trim(),
            institution: values.institution.trim(),
            department: values.department.trim(),
            cityCountry: values.cityCountry.trim(),
            orcid: values.orcid.trim(),
          },
          title: values.title.trim(),
          domain: values.domain || DOMAIN_OPTIONS[0],
          abstract: values.abstract.trim(),
          keywords: values.keywords.trim(),
          coauthors: values.coauthors.trim(),
          file: selectedFile,
          declaration: true,
        });
        toast.success('Manuscript submission prepared and dispatched successfully!');
      } catch (err: any) {
        toast.error(err?.message || 'Submission failed. Please check form details.');
      }
    },
  });

  const wordCount = countWords(formik.values.abstract);
  const keywordCount = parseKeywords(formik.values.keywords).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setFileError(validation.error || 'Invalid file format or size');
        toast.error(validation.error || 'Invalid file format or size');
        return;
      }

      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
      });
      setFileError(null);
      toast.info(`Selected file: ${file.name}`);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 max-w-4xl mx-auto" noValidate>
      {/* SECTION 1: Corresponding Author Information */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
            1. Corresponding Author Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary academic contact for editorial decisions, peer review queries, and automated notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <FormInput
            label="Full Name"
            required
            id="name"
            name="name"
            placeholder="Prof. (Dr.) Jane Doe"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.name}
            touched={formik.touched.name}
          />

          <FormInput
            label="Email Address (Institutional preferred)"
            required
            type="email"
            id="email"
            name="email"
            placeholder="author@university.edu"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
          />

          <FormInput
            label="Institution / University"
            required
            id="institution"
            name="institution"
            placeholder="Shri Ramswaroop Memorial University"
            value={formik.values.institution}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.institution}
            touched={formik.touched.institution}
          />

          <FormInput
            label="Department"
            id="department"
            name="department"
            placeholder="Dept. of Computer Science & Engineering"
            value={formik.values.department}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.department}
            touched={formik.touched.department}
          />

          <FormInput
            label="City & Country"
            required
            id="cityCountry"
            name="cityCountry"
            placeholder="Lucknow, India"
            value={formik.values.cityCountry}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.cityCountry}
            touched={formik.touched.cityCountry}
          />

          <FormInput
            label="ORCID ID"
            required
            id="orcid"
            name="orcid"
            placeholder="0000-0002-1825-0097"
            value={formik.values.orcid}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.orcid}
            touched={formik.touched.orcid}
            helperText="16-digit open researcher contributor ID"
          />
        </div>
      </div>

      {/* SECTION 2: Manuscript Metadata */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
            2. Manuscript Metadata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bibliographic information and indexing metadata for peer review evaluation.
          </p>
        </div>

        <div className="space-y-5 text-xs">
          <FormInput
            label="Manuscript Title"
            required
            id="title"
            name="title"
            placeholder="Concise, informative, and free of unnecessary abbreviations..."
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.title}
            touched={formik.touched.title}
          />

          <FormSelect
            label="Primary Subject Domain"
            required
            id="domain"
            name="domain"
            value={formik.values.domain}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            options={DOMAIN_OPTIONS.map((d) => ({ value: d, label: d }))}
          />

          <div>
            <FormTextarea
              label="Abstract (150–250 words)"
              required
              rows={5}
              id="abstract"
              name="abstract"
              placeholder="State objective, brief methodology, major findings, and significance without citations..."
              value={formik.values.abstract}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.abstract}
              touched={formik.touched.abstract}
              counterBadge={
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    wordCount >= 150 && wordCount <= 250
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : wordCount > 250
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {wordCount} words (Target: 150–250)
                </span>
              }
            />
          </div>

          <div>
            <FormInput
              label="Keywords (4–8 keywords separated by commas)"
              required
              id="keywords"
              name="keywords"
              placeholder="Metamaterials, 5G Networks, Optimization, Machine Learning"
              value={formik.values.keywords}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.keywords}
              touched={formik.touched.keywords}
              helperText="Separate keywords with commas (Target: 4–8)"
              rightElement={
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    keywordCount >= 4 && keywordCount <= 8
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {keywordCount}
                </span>
              }
            />
          </div>

          <FormInput
            label="Co-Authors (Optional)"
            id="coauthors"
            name="coauthors"
            placeholder="Dr. Alice Smith (Stanford Univ), Dr. Bob Jones (MIT)"
            value={formik.values.coauthors}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.coauthors}
            touched={formik.touched.coauthors}
            helperText="Include name and institutional affiliation for each co-author"
          />
        </div>
      </div>

      {/* SECTION 3: File Upload */}
      <div
        id="file-upload-section"
        className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
            3. File Upload (.doc / .docx / .pdf) <span className="text-red-500 font-bold ml-0.5">*</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload the full manuscript text adhering to standard double-blind submission guidelines.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0d3b6e] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">Choose manuscript file to upload</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Accepted formats: .doc, .docx, .pdf (Max size 25MB)
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="px-5 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </span>
          </div>

          {selectedFile && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 ml-1 cursor-pointer"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {fileError && <p className="text-rose-600 text-xs font-medium mt-2">{fileError}</p>}
        </div>
      </div>

      {/* SECTION 4: Declaration */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
          <input
            type="checkbox"
            id="declaration"
            name="declaration"
            checked={formik.values.declaration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-4 h-4 text-[#0d3b6e] rounded-sm mt-0.5 shrink-0 cursor-pointer"
          />
          <span>
            I confirm that this manuscript is original, not published elsewhere, formatted according to IJSPAST IEEE guidelines, verified under the 10% similarity benchmark, and approved by all co-authors.{' '}
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </span>
        </label>
        {formik.touched.declaration && formik.errors.declaration && (
          <p className="text-rose-600 text-xs font-medium mt-1.5 pl-7">
            {formik.errors.declaration}
          </p>
        )}
      </div>

      {/* Primary Submission Button */}
      <div className="flex justify-center pt-2 pb-6">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm px-10 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-slate-950" />
          <span>{isLoading ? 'Submitting Manuscript...' : 'Submit Manuscript for Review'}</span>
        </button>
      </div>
    </form>
  );
};
