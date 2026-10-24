import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DOMAINS,
  ofmt,
  ovalid,
  ORCID_REGISTRY,
  isNameMatch,
  countWords,
} from '../../constants/initialData';
import { OrcidModal } from '../modals/InteractiveModals';
import { OrcidBadge } from '../common/Badge';

export function SubmitManuscriptView() {
  const { submitManuscript, setSession, openModal, closeModal } = useApp();

  const [form, setForm] = useState({
    name: '',
    email: '',
    institution: '',
    department: '',
    city: '',
    coauthors: '',
    orcid: '',
    journal: 'IJMAR',
    title: '',
    domain: DOMAINS[0],
    abstract: '',
    keywords: '',
    declaration: false,
  });

  const [file, setFile] = useState(null);
  const [orcidStatus, setOrcidStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submittedPaperId, setSubmittedPaperId] = useState(null);

  const abstractWordCount = countWords(form.abstract);
  const keywordCount = form.keywords
    ? form.keywords.split(',').filter((x) => x.trim().length > 0).length
    : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'orcid' && orcidStatus && orcidStatus.id !== value.trim().toUpperCase()) {
      setOrcidStatus({
        id: value.trim().toUpperCase(),
        status: 'Not verified',
        msg: 'ORCID iD changed. Please verify again.',
      });
    }
  };

  const handleFillSample = () => {
    const sampleText =
      'This study examines how access to formal credit affects household savings in rural districts. It uses survey data from four hundred households collected over two years and compares borrowers with a matched group of non-borrowers. The analysis applies a difference-in-differences design and checks the results with alternative specifications. The findings show that regular access to credit raises savings for small farmers, while larger loans without training show no clear effect. The paper discusses the limits of self-reported data and suggests that banks pair loans with financial education. The results are useful for policy makers who design rural credit schemes and for researchers who study household finance in developing regions where formal services are still limited. The paper also reports a set of robustness tests, including placebo checks and a comparison across districts, and these tests support the main conclusion. Finally, the authors outline a simple monitoring plan that local banks can follow to track savings behaviour after a loan is given.';

    setForm({
      name: 'Dr. Anita Sharma',
      email: 'anita.sharma@univ.example',
      institution: 'Banaras Hindu University',
      department: 'Dept. of Economics',
      city: 'Varanasi, India',
      coauthors: 'Supriya, Bhagwant Singh',
      orcid: ofmt('000000029876543'),
      journal: 'IJMAR',
      title: 'Rural Credit Access and Household Savings',
      domain: 'Economics',
      abstract: sampleText,
      keywords: 'rural credit, household savings, microfinance, India',
      declaration: true,
    });

    setOrcidStatus({
      id: ofmt('000000029876543'),
      status: 'Verified',
      name: 'Dr. Anita Sharma',
      msg: 'Signed in at ORCID. Record name: Anita Sharma.',
    });

    setFile({ name: 'Rural_Credit_Savings_Study.docx', size: 1024 * 350 });
    setErrors([]);
  };

  const handleQuickOrcidFill = (id, name) => {
    setForm((prev) => ({
      ...prev,
      orcid: id,
      name: prev.name || name,
    }));
    setOrcidStatus(null);
  };

  const handleVerifyOrcid = () => {
    const cleanId = form.orcid.trim().toUpperCase();
    if (!cleanId) {
      setErrors(['Please enter an ORCID iD to verify.']);
      return;
    }

    if (!ovalid(cleanId)) {
      setOrcidStatus({
        id: cleanId,
        status: 'Invalid',
        msg: 'Invalid iD checksum: check the 16-digit format and check digit.',
      });
      return;
    }

    openModal(
      <OrcidModal
        orcidId={cleanId}
        onAuthorize={(id) => {
          closeModal();
          const recordName = ORCID_REGISTRY[id];
          if (!recordName) {
            setOrcidStatus({
              id,
              status: 'Invalid',
              msg: 'iD not found on the ORCID public registry.',
            });
          } else if (!form.name.trim()) {
            setOrcidStatus({
              id,
              status: 'Not verified',
              name: recordName,
              msg: `iD belongs to ${recordName}. Enter your full name above, then verify again.`,
            });
          } else if (isNameMatch(form.name, recordName)) {
            setOrcidStatus({
              id,
              status: 'Verified',
              name: recordName,
              msg: `Signed in at ORCID. Record name matches: ${recordName}.`,
            });
          } else {
            setOrcidStatus({
              id,
              status: 'Not verified',
              name: recordName,
              msg: `ORCID record name is ${recordName}, which does not match "${form.name}". The paper can be submitted but the editor will see a flag.`,
            });
          }
        }}
        onCancel={closeModal}
      />
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = [];

    if (!form.name.trim()) validationErrors.push('Full name is required.');
    if (!form.email.trim()) validationErrors.push('Email is required.');
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      validationErrors.push('Enter a valid email address.');
    }
    if (!form.institution.trim()) validationErrors.push('Institution / University is required.');
    if (!form.city.trim()) validationErrors.push('City and country is required.');
    if (!form.title.trim()) validationErrors.push('Manuscript title is required.');

    if (abstractWordCount < 150 || abstractWordCount > 250) {
      validationErrors.push(
        `Abstract must be between 150 and 250 words (currently ${abstractWordCount} words).`
      );
    }

    if (keywordCount < 4 || keywordCount > 8) {
      validationErrors.push(`Enter 4 to 8 keywords separated by commas (currently ${keywordCount}).`);
    }

    if (!file) {
      validationErrors.push('Please choose a manuscript file to upload (.doc, .docx, .pdf).');
    } else {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.doc', '.docx', '.pdf'].includes(ext)) {
        validationErrors.push('File must be a .doc, .docx, or .pdf format.');
      }
      if (file.size > 25 * 1024 * 1024) {
        validationErrors.push('File size exceeds the 25 MB limit.');
      }
    }

    if (!form.orcid.trim()) {
      validationErrors.push('ORCID iD is mandatory.');
    } else if (!orcidStatus || orcidStatus.id !== form.orcid.trim().toUpperCase()) {
      validationErrors.push('Verify the ORCID iD using the "Verify with ORCID" button.');
    } else if (orcidStatus.status === 'Invalid') {
      validationErrors.push('The ORCID iD is invalid. Correct it and verify again.');
    }

    if (!form.declaration) {
      validationErrors.push('You must confirm the submission declaration benchmark.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    const id = submitManuscript({
      formValues: form,
      file,
      orcidStatus,
    });
    setSubmittedPaperId(id);
  };

  if (submittedPaperId) {
    return (
      <div className="max-w-2xl mx-auto my-8">
        <div className="bg-white border border-[#d5deeb] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-[#13663c] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Manuscript Successfully Submitted
            </span>
            <h1 className="text-3xl font-extrabold text-[#0d3b6e] tracking-tight font-mono mt-2">
              {submittedPaperId}
            </h1>
          </div>

          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your manuscript has been registered in the SRMU journal editorial system. An official acknowledgement receipt and password activation instructions have been dispatched. The Editor for <b>{form.journal}</b> has been notified.
          </p>

          <div className="pt-4 flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setSession({ role: 'author', who: form.email.trim().toLowerCase(), pid: null });
              }}
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
            >
              Go to Author Dashboard
            </button>
            <button
              onClick={() => setSession({ role: 'login', who: null, pid: null, tab: null })}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-sm transition-colors"
            >
              Done / Switch Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSession({ role: 'login', who: null, pid: null, tab: null })}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-[#0d3b6e] tracking-tight">
            Submit Your Manuscript
          </h1>
        </div>
        <button
          type="button"
          onClick={handleFillSample}
          className="px-3 py-1.5 bg-[#f2b01e]/20 hover:bg-[#f2b01e]/30 text-[#7d5200] border border-[#f2b01e]/50 rounded-lg text-xs font-semibold transition-colors"
        >
          Fill Sample Data
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-[#fde3e0] border border-[#a8231b]/30 text-[#a8231b] p-4 rounded-xl text-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠</span> Please correct the following errors:
          </div>
          <ul className="list-disc pl-5 text-xs space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Corresponding Author */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0d3b6e] border-b border-slate-100 pb-2">
            1. Corresponding Author Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Prof. (Dr.) Jane Doe"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (institutional preferred) *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="author@university.edu"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution / University *
              </label>
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="Shri Ramswaroop Memorial University"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Dept. of Computer Science"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City and Country *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Lucknow, India"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Co-Authors (names, optional)
              </label>
              <input
                type="text"
                name="coauthors"
                value={form.coauthors}
                onChange={handleChange}
                placeholder="Supriya, Bhagwant Singh"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>
          </div>

          {/* ORCID Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ORCID iD * (mandatory for submission)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="orcid"
                value={form.orcid}
                onChange={handleChange}
                placeholder="0000-0002-1825-0097"
                className="flex-1 font-mono text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleVerifyOrcid}
                className="px-4 py-2 bg-[#f2b01e] hover:bg-[#e0a014] text-[#1d1600] font-semibold rounded-lg text-xs whitespace-nowrap shadow-2xs transition-colors"
              >
                Verify with ORCID
              </button>
            </div>

            <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
              {orcidStatus ? (
                <div className="flex items-center gap-2">
                  <OrcidBadge status={orcidStatus.status} />
                  <span className="text-slate-700">{orcidStatus.msg}</span>
                </div>
              ) : (
                <span className="text-[#55657d]">Not verified yet.</span>
              )}
            </div>

            <div className="mt-1 text-xs text-[#55657d]">
              Demo iDs:{' '}
              <button
                type="button"
                onClick={() => handleQuickOrcidFill(ofmt('000000031234567'), 'Dr. Rajesh Kumar')}
                className="text-[#0b5cad] underline"
              >
                Rajesh Kumar
              </button>
              ,{' '}
              <button
                type="button"
                onClick={() => handleQuickOrcidFill(ofmt('000000029876543'), 'Dr. Anita Sharma')}
                className="text-[#0b5cad] underline"
              >
                Anita Sharma
              </button>
              ,{' '}
              <button
                type="button"
                onClick={() => handleQuickOrcidFill(ofmt('000000021825009'), 'Josiah Carberry')}
                className="text-[#0b5cad] underline"
              >
                J. Carberry
              </button>
              .
            </div>
          </div>
        </div>

        {/* Section 2: Manuscript Details */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0d3b6e] border-b border-slate-100 pb-2">
            2. Manuscript Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Journal *
              </label>
              <select
                name="journal"
                value={form.journal}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none bg-white"
              >
                <option value="IJMAR">
                  IJMAR: International Journal of Multidisciplinary Advanced Research
                </option>
                <option value="IJSPAST">
                  IJSPAST: International Journal of Scientific Progress in Applied Science and Engineering
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manuscript Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Concise, informative, and free of unnecessary abbreviations"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Subject Domain *
              </label>
              <select
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none bg-white"
              >
                {DOMAINS.map((dom, i) => (
                  <option key={i} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Abstract (150 to 250 words) *
                </label>
                <span
                  className={`text-xs font-mono font-semibold ${
                    abstractWordCount >= 150 && abstractWordCount <= 250
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {abstractWordCount} words (Target: 150-250)
                </span>
              </div>
              <textarea
                name="abstract"
                rows={5}
                value={form.abstract}
                onChange={handleChange}
                placeholder="Provide a comprehensive summary covering objectives, methodology, main findings, and academic significance..."
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Keywords (4 to 8, separated by commas) *
                </label>
                <span
                  className={`text-xs font-mono font-semibold ${
                    keywordCount >= 4 && keywordCount <= 8
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {keywordCount} keywords (Target: 4-8)
                </span>
              </div>
              <input
                type="text"
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
                placeholder="Metamaterials, 5G Networks, Optimization, Machine Learning"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: File Upload */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#0d3b6e] border-b border-slate-100 pb-2">
            3. File Upload (.doc, .docx, .pdf, up to 25 MB)
          </h2>
          <div>
            <input
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0d3b6e] file:text-white hover:file:bg-[#0a2d54] cursor-pointer"
            />
            {file && (
              <p className="text-xs text-emerald-700 mt-2 font-medium">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Declaration */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="declaration"
              checked={form.declaration}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0d3b6e] focus:ring-[#f2b01e]"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I confirm that this manuscript represents original research, is not currently published or under review elsewhere, is formatted strictly according to SRMU journal guidelines, falls below the 10% similarity benchmark, and has been approved by all co-authors.
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            Submit Manuscript for Review
          </button>
          <button
            type="button"
            onClick={handleFillSample}
            className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Fill Sample Data
          </button>
        </div>
      </form>
    </div>
  );
}
