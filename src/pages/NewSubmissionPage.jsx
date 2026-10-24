import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { DOMAINS, BASE_DATE, getDdmmyy } from '../constants/initialData';

// ORCID Checksum helpers
function ocheck(b) {
  let t = 0;
  for (const c of b) t = (t + +c) * 2;
  const r = (12 - (t % 11)) % 11;
  return r === 10 ? 'X' : String(r);
}

function ofmt(b) {
  return (b + ocheck(b)).match(/.{4}/g).join('-');
}

function ovalid(id) {
  const d = id.replace(/-/g, '').toUpperCase();
  return /^\d{15}[\dX]$/.test(d) && ocheck(d.slice(0, 15)) === d[15];
}

const ORCID_REGISTRY = {
  [ofmt('000000021825009')]: 'Josiah Carberry',
  [ofmt('000000031234567')]: 'Rajesh Kumar',
  [ofmt('000000029876543')]: 'Anita Sharma',
  [ofmt('000000034455667')]: 'Vikram Singh',
};

const countWords = (text) => (text.trim().match(/\S+/g) || []).length;

export function NewSubmissionPage() {
  const { submitManuscript, showToast } = useApp();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inst: '',
    dept: '',
    city: '',
    coauthors: '',
    orcid: '',
    journal: 'IJMAR',
    title: '',
    domain: DOMAINS[0],
    abstract: '',
    keywords: '',
    file: null,
    declaration: false,
  });

  const [orcidStatus, setOrcidStatus] = useState(null); // { status: 'Verified' | 'Not verified' | 'Invalid', name: string, msg: string }
  const [isOrcidModalOpen, setIsOrcidModalOpen] = useState(false);
  const [errors, setErrors] = useState([]);

  const wordCount = countWords(formData.abstract);
  const keywordCount = formData.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean).length;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFillSample = () => {
    const sampleAbstract =
      'This study examines how access to formal credit affects household savings in rural districts. It uses survey data from four hundred households collected over two years and compares borrowers with a matched group of non-borrowers. The analysis applies a difference-in-differences design and checks the results with alternative specifications. The findings show that regular access to credit raises savings for small farmers, while larger loans without training show no clear effect. The paper discusses the limits of self-reported data and suggests that banks pair loans with financial education. The results are useful for policy makers who design rural credit schemes and for researchers who study household finance in developing regions where formal services are still limited. The paper also reports a set of robustness tests, including placebo checks and a comparison across districts, and these tests support the main conclusion. Finally, the authors outline a simple monitoring plan that local banks can follow to track savings behaviour after a loan is given.';

    const sampleOrcid = ofmt('000000029876543');
    setFormData({
      name: 'Dr. Anita Sharma',
      email: 'anita.sharma@univ.example',
      inst: 'Banaras Hindu University',
      dept: 'Dept. of Economics',
      city: 'Varanasi, India',
      coauthors: 'Prof. Supriya, Dr. Bhagwant Singh',
      orcid: sampleOrcid,
      journal: 'IJMAR',
      title: 'Rural Microfinance Adoption and Household Resilience in Developing Regions',
      domain: 'Economics',
      abstract: sampleAbstract,
      keywords: 'microfinance, rural credit, savings behaviour, economic resilience, India',
      file: { name: 'manuscript_draft_anita_sharma.docx' },
      declaration: true,
    });

    setOrcidStatus({
      id: sampleOrcid,
      status: 'Verified',
      name: 'Anita Sharma',
      msg: 'ORCID validated & linked to Anita Sharma',
    });

    showToast('Demo submission data populated');
  };

  const handleVerifyOrcid = () => {
    const id = formData.orcid.trim().toUpperCase();
    if (!id) {
      showToast('Please enter an ORCID iD first');
      return;
    }
    if (!ovalid(id)) {
      setOrcidStatus({
        id,
        status: 'Invalid',
        msg: 'Invalid ORCID format or check digit. Format: 0000-0000-0000-0000',
      });
      return;
    }
    setIsOrcidModalOpen(true);
  };

  const confirmOrcidAuth = () => {
    const id = formData.orcid.trim().toUpperCase();
    const regName = ORCID_REGISTRY[id];
    setIsOrcidModalOpen(false);

    if (!regName) {
      setOrcidStatus({
        id,
        status: 'Invalid',
        msg: 'Identifier not recognized in mock ORCID registry.',
      });
    } else if (!formData.name) {
      setOrcidStatus({
        id,
        status: 'Not verified',
        name: regName,
        msg: `ORCID record belongs to ${regName}. Please input your name in Section 1.`,
      });
    } else {
      setOrcidStatus({
        id,
        status: 'Verified',
        name: regName,
        msg: `Verified identity with ORCID record: ${regName}`,
      });
      showToast(`ORCID successfully verified as ${regName}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = [];

    if (!formData.name.trim()) validationErrors.push('Author full name is required');
    if (!formData.email.trim() || !formData.email.includes('@'))
      validationErrors.push('Valid institutional email is required');
    if (!formData.inst.trim()) validationErrors.push('University/Institution is required');
    if (!formData.city.trim()) validationErrors.push('City and country are required');
    if (!formData.title.trim()) validationErrors.push('Manuscript title is required');

    if (wordCount < 150 || wordCount > 250) {
      validationErrors.push(`Abstract must be between 150 and 250 words (currently ${wordCount} words)`);
    }

    if (keywordCount < 4 || keywordCount > 8) {
      validationErrors.push(`Provide between 4 and 8 keywords (currently ${keywordCount})`);
    }

    if (!formData.file) {
      validationErrors.push('Manuscript file (.doc, .docx, .pdf) is required');
    }

    if (!formData.orcid.trim()) {
      validationErrors.push('ORCID iD is mandatory for submission');
    } else if (!orcidStatus || orcidStatus.status === 'Invalid') {
      validationErrors.push('Verify your ORCID iD before submitting');
    }

    if (!formData.declaration) {
      validationErrors.push('You must confirm the submission declaration');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);

    // Submit payload
    const newPaperId = submitManuscript({
      formValues: {
        journal: formData.journal,
        title: formData.title,
        domain: formData.domain,
        abstract: formData.abstract,
        keywords: formData.keywords,
        authorName: formData.name,
        authorEmail: formData.email,
        authorInst: formData.inst,
        authorDept: formData.dept,
        authorCity: formData.city,
        authorCoauthors: formData.coauthors,
        authorOrcid: formData.orcid,
        orcidStatus: orcidStatus.status,
        orcidName: orcidStatus.name || '',
        fileName: formData.file?.name || 'manuscript_submission.docx',
      },
    });

    showToast(`Manuscript submitted successfully with ID: ${newPaperId}`);
    navigate(`/manuscripts/${newPaperId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Peer-Review Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Submit Research Manuscript
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish with <strong className="text-slate-800">IJMAR</strong> or <strong className="text-slate-800">IJSPAST</strong>. All manuscripts undergo mandatory double-blind peer review.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Fill Sample Data</span>
        </button>
      </div>

      {/* Errors Alert */}
      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-800">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Please correct the following before submitting:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 pt-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Corresponding Author Information */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">1. Corresponding Author Information</h3>
            <p className="text-xs text-slate-500">
              Primary researcher responsible for all correspondence, revision exchanges, and APC invoicing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name &amp; Academic Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Prof. (Dr.) Jane Doe"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Institutional Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="author@university.edu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">University / Research Institution *</label>
              <input
                type="text"
                value={formData.inst}
                onChange={(e) => handleInputChange('inst', e.target.value)}
                placeholder="e.g. Banaras Hindu University"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Department (optional)</label>
              <input
                type="text"
                value={formData.dept}
                onChange={(e) => handleInputChange('dept', e.target.value)}
                placeholder="e.g. Department of Computer Science"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City &amp; Country *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g. Lucknow, India"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Co-Authors (comma-separated)</label>
              <input
                type="text"
                value={formData.coauthors}
                onChange={(e) => handleInputChange('coauthors', e.target.value)}
                placeholder="e.g. Dr. A. Verma, Dr. S. Patel"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* ORCID Verification Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-bold text-slate-800 text-xs block">
                  ORCID iD * (Mandatory Authenticated Identifier)
                </label>
                <p className="text-[11px] text-slate-500">
                  Ensures researcher verification in accordance with SRMU editorial standards.
                </p>
              </div>

              {orcidStatus && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    orcidStatus.status === 'Verified'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : orcidStatus.status === 'Not verified'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {orcidStatus.status}: {orcidStatus.msg}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={formData.orcid}
                onChange={(e) => {
                  handleInputChange('orcid', e.target.value);
                  setOrcidStatus(null);
                }}
                placeholder="0000-0002-1825-0097"
                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-indigo-500"
              />
              <button
                type="button"
                onClick={handleVerifyOrcid}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify with ORCID</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Quick Demo Identifiers:</span>
              <button
                type="button"
                onClick={() => {
                  const id = ofmt('000000031234567');
                  handleInputChange('orcid', id);
                  if (!formData.name) handleInputChange('name', 'Dr. Rajesh Kumar');
                }}
                className="text-indigo-600 hover:underline font-mono"
              >
                Rajesh Kumar
              </button>
              •
              <button
                type="button"
                onClick={() => {
                  const id = ofmt('000000029876543');
                  handleInputChange('orcid', id);
                  if (!formData.name) handleInputChange('name', 'Dr. Anita Sharma');
                }}
                className="text-indigo-600 hover:underline font-mono"
              >
                Anita Sharma
              </button>
              •
              <button
                type="button"
                onClick={() => {
                  const id = ofmt('000000021825009');
                  handleInputChange('orcid', id);
                  if (!formData.name) handleInputChange('name', 'Josiah Carberry');
                }}
                className="text-indigo-600 hover:underline font-mono"
              >
                Josiah Carberry
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Manuscript Details */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">2. Manuscript Scope &amp; Content</h3>
            <p className="text-xs text-slate-500">
              Journal selection, paper title, domain classification, abstract, and indexed keywords.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Journal *</label>
              <select
                value={formData.journal}
                onChange={(e) => handleInputChange('journal', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-indigo-500"
              >
                <option value="IJMAR">IJMAR: Multidisciplinary Advanced Research</option>
                <option value="IJSPAST">IJSPAST: Applied Science and Engineering</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Subject Domain *</label>
              <select
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-indigo-500"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Manuscript Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Concise, informative title reflective of the study..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">Abstract (150 to 250 words) *</label>
                <span
                  className={`text-[11px] font-bold ${
                    wordCount >= 150 && wordCount <= 250
                      ? 'text-emerald-600'
                      : wordCount > 250
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {wordCount} words (Target: 150 - 250)
                </span>
              </div>
              <textarea
                value={formData.abstract}
                onChange={(e) => handleInputChange('abstract', e.target.value)}
                rows={5}
                placeholder="Summarize the research background, methodologies, key findings, and practical implications..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">
                  Keywords (4 to 8, separated by commas) *
                </label>
                <span
                  className={`text-[11px] font-bold ${
                    keywordCount >= 4 && keywordCount <= 8 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {keywordCount} keywords (Target: 4 - 8)
                </span>
              </div>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="e.g. artificial intelligence, sensor networks, cloud computing, optimization"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: File Upload */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              3. Manuscript Document Upload (.doc, .docx, .pdf up to 25 MB)
            </h3>
            <p className="text-xs text-slate-500">
              Upload the complete initial manuscript. Figures, tables, and references must be embedded.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              {formData.file ? formData.file.name : 'Choose manuscript file or drag & drop'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supported formats: Microsoft Word (.doc, .docx) or PDF (.pdf)
            </p>
            <input
              type="file"
              accept=".doc,.docx,.pdf"
              id="file_upload_input"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleInputChange('file', e.target.files[0]);
                }
              }}
              className="mt-3 text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 4: Author Declaration */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
            <input
              type="checkbox"
              checked={formData.declaration}
              onChange={(e) => handleInputChange('declaration', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm mt-0.5 shrink-0"
            />
            <span>
              I formally declare that this submission represents original scholarly work, has not been published elsewhere, adheres to SRMU journal formatting guidelines, is under the mandatory 10% similarity benchmark, and has been approved by all listed co-authors.
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/manuscripts')}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel &amp; Discard
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>Submit Manuscript for Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* ORCID Verification Modal */}
      <Modal
        isOpen={isOrcidModalOpen}
        onClose={() => setIsOrcidModalOpen(false)}
        title="Simulated ORCID Authorization"
        subtitle="SRMU Journals Publishing Portal is requesting verified read permission"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold text-slate-900">
            {formData.orcid}
          </div>
          <p className="text-slate-600">
            Clicking <strong>Authorize Verification</strong> will securely fetch the registered researcher name from the ORCID registry to authenticate authorship.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOrcidModalOpen(false)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmOrcidAuth}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              Authorize Verification
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
