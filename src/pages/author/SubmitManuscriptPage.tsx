import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { submitNewManuscript, clearSubmissionSuccess } from '../../store/slices/manuscriptSlice';
import { loginUser } from '../../store/slices/authSlice';
import { SubmissionForm } from '../../components/forms/SubmissionForm';
import { ManuscriptSubmissionPayload } from '../../types/manuscript.types';
import {
  CheckCircle2,
  Mail,
  Key,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  LogIn,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';

export const SubmitManuscriptPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, submissionSuccess } = useAppSelector((state) => state.manuscripts);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (payload: ManuscriptSubmissionPayload) => {
    await dispatch(
      submitNewManuscript({
        formData: payload,
        currentUserEmail: user?.email,
      })
    );
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Author credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectLogin = async () => {
    if (submissionSuccess?.generatedCredentials) {
      const { email, password } = submissionSuccess.generatedCredentials;
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        dispatch(clearSubmissionSuccess());
        navigate('/author/dashboard');
      } else {
        navigate('/login');
      }
    } else {
      navigate('/author/dashboard');
    }
  };

  const handleResetForNew = () => {
    dispatch(clearSubmissionSuccess());
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 flex flex-col font-['IBM_Plex_Sans',sans-serif]">
      {/* 1. TOP INSTITUTIONAL BAR (Matching Screenshot reference header) */}
      <div className="bg-[#082240] text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white tracking-wide">
              Shri Ramswaroop Memorial University
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="text-amber-400 font-mono font-medium">E-ISSN: 2582-8800</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Double-Blind Peer Review
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">Open Access Journal</span>
          </div>
        </div>
      </div>

      {/* 2. JOURNAL MAIN HEADER & NAVIGATION */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d3b6e] text-amber-400 font-black flex items-center justify-center text-base shadow-xs tracking-tight">
              IJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  IJSPAST
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                  Submission Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                International Journal of Scientific Progress in Applied Science &amp; Technology
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600">
            <Link
              to="/published"
              className="px-3 py-1.5 rounded-lg hover:text-[#0d3b6e] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Archive</span>
            </Link>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {submissionSuccess ? (
          /* SUCCESS SCREEN WITH CREDENTIALS & EMAIL PREVIEW */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            {/* Success Hero Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0d3b6e] tracking-tight">
                  Manuscript Submitted Successfully!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Your research has been received by the IJSPAST Editorial Office. Initial editorial screening has commenced.
                </p>
              </div>

              {/* Manuscript Reference Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <span className="text-xs text-indigo-700 font-medium">Assigned Manuscript ID:</span>
                <span className="font-mono text-base font-extrabold text-indigo-950">
                  {submissionSuccess.manuscriptId}
                </span>
              </div>
            </div>

            {/* SIMULATED EMAIL DISPATCH CARD (Exact requirement: create email & password and send to author) */}
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-[#0d3b6e] font-bold text-sm">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>System Account Notification Dispatched</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Delivered to Author
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 font-mono text-xs text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 text-[11px] border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-sans font-semibold">To Author:</span>
                  <span className="sm:col-span-3 text-slate-900 font-bold">
                    {submissionSuccess.generatedCredentials?.email}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 text-[11px] border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-sans font-semibold">Subject:</span>
                  <span className="sm:col-span-3 text-slate-900 font-semibold">
                    [IJSPAST] Manuscript Received &amp; Your Author Login Credentials [{submissionSuccess.manuscriptId}]
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 text-[11px] border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-sans font-semibold">Portal URL:</span>
                  <span className="sm:col-span-3 text-blue-700 underline font-semibold">
                    http://localhost:5173/login
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 text-[11px] border-b border-slate-200 pb-2">
                  <span className="text-slate-400 font-sans font-semibold">Username / Email:</span>
                  <span className="sm:col-span-3 text-slate-900 font-bold">
                    {submissionSuccess.generatedCredentials?.email}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 text-[11px] items-center">
                  <span className="text-slate-400 font-sans font-semibold">Temporary Password:</span>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-lg text-amber-950 font-black text-sm">
                      {submissionSuccess.generatedCredentials?.password}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCredentials(
                          submissionSuccess.generatedCredentials?.password || ''
                        )
                      }
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-sans font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: In production, the Spring Boot backend will send this email over SMTP. For this frontend phase, credentials have been generated and saved to localStorage for testing.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another Manuscript</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Go to Login Screen</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleDirectLogin}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Direct Sign-In to Author Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SUBMISSION FORM */
          <div className="space-y-6">
            <SubmissionForm
              initialAuthor={{
                name: user?.name,
                email: user?.email,
                institution: user?.institution,
                department: user?.department,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-slate-200/90 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-1 mt-auto">
        <div className="font-semibold text-slate-700">
          International Journal of Scientific Progress in Applied Science and Technology (IJSPAST)
        </div>
        <div className="text-[11px] text-slate-400">
          Published under SRMU Journals • E-ISSN: 2582-8800 • Double-Blind Peer Review
        </div>
      </footer>
    </div>
  );
};
