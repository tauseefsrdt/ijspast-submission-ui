import React, { useState } from 'react';
import {
  Upload,
  Send,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ManuscriptSubmissionPayload } from '../../types/manuscript.types';
import { countWords, parseKeywords, validateFile, formatFileSize } from '../../utils/validation';

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

const DOMAIN_OPTIONS = [
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
  const [formData, setFormData] = useState({
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
  });

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const wordCount = countWords(formData.abstract);
  const keywordCount = parseKeywords(formData.keywords).length;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, file: validation.error || 'Invalid file' }));
        return;
      }
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Author name is required';
    if (!formData.email.trim()) newErrors.email = 'Author email is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.orcid.trim()) {
      newErrors.orcid = 'ORCID ID is required to submit a manuscript (e.g. 0000-0002-1825-0097)';
    }
    if (!formData.title.trim()) newErrors.title = 'Manuscript title is required';
    if (!formData.abstract.trim()) newErrors.abstract = 'Abstract is required';
    if (!formData.keywords.trim()) newErrors.keywords = 'Keywords are required';
    if (!selectedFile) newErrors.file = 'Please upload a manuscript file (.doc, .docx, or .pdf)';
    if (!formData.declaration) newErrors.declaration = 'You must confirm the submission declaration';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.orcid && !formData.orcid.trim()) {
        const el = document.getElementById('orcid-input');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});

    onSubmit({
      author: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        institution: formData.institution.trim(),
        department: formData.department.trim(),
        cityCountry: formData.cityCountry.trim(),
        orcid: formData.orcid.trim(),
      },
      title: formData.title.trim(),
      domain: formData.domain || DOMAIN_OPTIONS[0],
      abstract: formData.abstract.trim(),
      keywords: formData.keywords.trim(),
      coauthors: formData.coauthors.trim(),
      file: selectedFile!,
      declaration: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">

      {/* SECTION 1: Corresponding Author Information */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
          1. Corresponding Author Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Full Name <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Prof. (Dr.) Jane Doe"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Email Address (Institutional preferred) <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="author@university.edu"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Institution / University <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              placeholder="Shri Ramswaroop Memorial University"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.institution ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.institution && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.institution}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Dept. of Computer Science & Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              City &amp; Country <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.cityCountry}
              onChange={(e) => handleInputChange('cityCountry', e.target.value)}
              placeholder="Lucknow, India"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.cityCountry ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.cityCountry && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.cityCountry}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              ORCID ID <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              id="orcid-input"
              type="text"
              value={formData.orcid}
              onChange={(e) => handleInputChange('orcid', e.target.value)}
              placeholder="0000-0002-1825-0097"
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.orcid ? 'border-red-400 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.orcid && (
              <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.orcid}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Manuscript Metadata */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
          2. Manuscript Metadata
        </h2>

        <div className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Manuscript Title <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Concise, informative, and free of unnecessary abbreviations..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.title ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Primary Subject Domain <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <select
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all cursor-pointer"
            >
              {DOMAIN_OPTIONS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold">
                Abstract (150–250 words) <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
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
            </div>
            <textarea
              rows={5}
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              placeholder="State objective, brief methodology, major findings, and significance without citations..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all leading-relaxed ${
                errors.abstract ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.abstract && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.abstract}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold">
                Keywords (4–8 keywords separated by commas) <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  keywordCount >= 4 && keywordCount <= 8
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {keywordCount} keywords (Target: 4–8)
              </span>
            </div>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Metamaterials, 5G Networks, Optimization, Machine Learning"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 transition-all ${
                errors.keywords ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.keywords && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.keywords}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: File Upload */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#0d3b6e] tracking-tight">
          3. File Upload (.doc / .docx / .pdf) <span className="text-red-500 font-bold ml-0.5">*</span>
        </h2>

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0d3b6e] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Choose manuscript file to upload
            </p>
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

          {errors.file && <p className="text-rose-600 text-xs font-medium mt-2">{errors.file}</p>}
        </div>
      </div>

      {/* SECTION 4: Declaration */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
          <input
            type="checkbox"
            checked={formData.declaration}
            onChange={(e) => handleInputChange('declaration', e.target.checked)}
            className="w-4 h-4 text-[#0d3b6e] rounded-sm mt-0.5 shrink-0 cursor-pointer"
          />
          <span>
            I confirm that this manuscript is original, not published elsewhere, formatted according to IJSPAST IEEE guidelines, verified under the 10% similarity benchmark, and approved by all co-authors. <span className="text-red-500 font-bold ml-0.5">*</span>
          </span>
        </label>
        {errors.declaration && (
          <p className="text-rose-600 text-xs font-medium mt-1.5 pl-7">{errors.declaration}</p>
        )}
      </div>

      {/* Yellow Primary Submission Button - EXACTLY matching the reference screenshot */}
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
