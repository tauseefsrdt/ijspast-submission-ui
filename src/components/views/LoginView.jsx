import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function LoginView() {
  const { data, setSession, showToast } = useApp();
  const { users, reviewers } = data;

  // Form states for Author login
  const [authorEmail, setAuthorEmail] = useState('rajesh.kumar@univ.example');
  const [authorPw, setAuthorPw] = useState('demo');

  // Form states for Reviewer login
  const [reviewerEmail, setReviewerEmail] = useState('meera.iyer@review.example');
  const [reviewerPw, setReviewerPw] = useState('Rv@4821');

  const handleAuthorLogin = (e) => {
    e.preventDefault();
    const em = authorEmail.trim().toLowerCase();
    const user = users[em];
    if (!user || user.pw !== authorPw) {
      showToast('Invalid author email or password.');
      return;
    }
    setSession({ role: 'author', who: em, pid: null });
  };

  const handleReviewerLogin = (e) => {
    e.preventDefault();
    const em = reviewerEmail.trim().toLowerCase();
    const rev = reviewers.find((r) => r.email.toLowerCase() === em);
    if (!rev || rev.pw !== reviewerPw) {
      showToast('Invalid reviewer email or password.');
      return;
    }
    setSession({ role: 'reviewer', who: rev.id, pid: null });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0d3b6e] tracking-tight">
          Manuscript Submission and Publication Portal
        </h1>
        <p className="text-sm text-[#55657d] mt-1.5 leading-relaxed">
          Select a role to explore the complete double-blind editorial, review, proofreading, and payment workflow for <b>IJMAR</b> and <b>IJSPAST</b> journals. Everything is fully interactive with realistic simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Author Card */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-[#0d3b6e] flex items-center gap-2">
                Author Portal
              </h2>
              <span className="text-xs bg-blue-50 text-[#0d3b6e] font-semibold px-2 py-0.5 rounded">
                Submit & Track
              </span>
            </div>

            <form onSubmit={handleAuthorLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b01e] focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={authorPw}
                  onChange={(e) => setAuthorPw(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b01e] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-medium rounded-lg text-sm transition-colors shadow-2xs"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setSession({ role: 'submit', pid: null })}
                  className="px-4 py-2 bg-[#f2b01e] hover:bg-[#e0a014] text-[#1d1600] font-semibold rounded-lg text-sm transition-colors shadow-2xs"
                >
                  Submit a new manuscript
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#55657d] leading-relaxed">
            <span className="font-semibold text-slate-700">Demo authors:</span>{' '}
            <button
              type="button"
              onClick={() => {
                setAuthorEmail('rajesh.kumar@univ.example');
                setAuthorPw('demo');
              }}
              className="text-[#0b5cad] underline hover:text-blue-900"
            >
              rajesh.kumar@
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setAuthorEmail('anita.sharma@univ.example');
                setAuthorPw('demo');
              }}
              className="text-[#0b5cad] underline hover:text-blue-900"
            >
              anita.sharma@
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setAuthorEmail('vikram.singh@univ.example');
                setAuthorPw('demo');
              }}
              className="text-[#0b5cad] underline hover:text-blue-900"
            >
              vikram.singh@univ.example
            </button>{' '}
            (Password: <code className="bg-slate-100 px-1 py-0.5 rounded">demo</code>). New authors receive accounts automatically upon submission.
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-[#0d3b6e] flex items-center gap-2">
                Editor Portal
              </h2>
              <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">
                Screening & Decisions
              </span>
            </div>

            <p className="text-xs text-[#55657d] leading-relaxed">
              Each SRMU journal has its dedicated Editor with isolated permissions. The Editor oversees the complete 12-step cycle: screening, reviewer assignment, comment transmission, proof formatting, fee overrides, and publishing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSession({ role: 'editor', who: 'IJMAR', pid: null, tab: 'dash' })}
                className="flex-1 py-2.5 px-3 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-medium rounded-lg text-sm text-center transition-colors shadow-2xs"
              >
                Editor, IJMAR
              </button>
              <button
                type="button"
                onClick={() => setSession({ role: 'editor', who: 'IJSPAST', pid: null, tab: 'dash' })}
                className="flex-1 py-2.5 px-3 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-medium rounded-lg text-sm text-center transition-colors shadow-2xs"
              >
                Editor, IJSPAST
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#55657d]">
            One editor per journal. Editors see only submissions for their designated journal.
          </div>
        </div>

        {/* Reviewer Card */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-[#0d3b6e] flex items-center gap-2">
                Reviewer Portal
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Double-Blind
              </span>
            </div>

            <form onSubmit={handleReviewerLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (login by email only)
                </label>
                <input
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b01e] focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={reviewerPw}
                  onChange={(e) => setReviewerPw(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b01e] focus:bg-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-medium rounded-lg text-sm transition-colors shadow-2xs"
              >
                Log in as Reviewer
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#55657d] leading-relaxed">
            <span className="font-semibold text-slate-700">Pre-registered reviewers:</span>{' '}
            <button
              type="button"
              onClick={() => {
                setReviewerEmail('meera.iyer@review.example');
                setReviewerPw('Rv@4821');
              }}
              className="text-[#0b5cad] underline"
            >
              Dr. Meera Iyer (Physics)
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setReviewerEmail('sanjay.gupta@review.example');
                setReviewerPw('Rv@7310');
              }}
              className="text-[#0b5cad] underline"
            >
              Prof. Sanjay Gupta (CSE)
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setReviewerEmail('farhan.ali@review.example');
                setReviewerPw('Rv@2294');
              }}
              className="text-[#0b5cad] underline"
            >
              Dr. Farhan Ali (Economics)
            </button>
            .
          </div>
        </div>

        {/* Admin and Public Site Card */}
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-[#0d3b6e] flex items-center gap-2">
                Administration & Public
              </h2>
              <span className="text-xs bg-purple-50 text-purple-800 font-semibold px-2 py-0.5 rounded">
                System Management
              </span>
            </div>

            <p className="text-xs text-[#55657d] leading-relaxed">
              Configure publication fees, base pages, overtime page charges, stage time limits, and reviewer accounts. You can also visit the live public journal repository.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSession({ role: 'admin', tab: 'fees', pid: null })}
                className="flex-1 py-2.5 px-3 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-medium rounded-lg text-sm text-center transition-colors shadow-2xs"
              >
                Admin Settings
              </button>
              <button
                type="button"
                onClick={() => setSession({ role: 'public', pid: null })}
                className="flex-1 py-2.5 px-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-medium rounded-lg text-sm text-center transition-colors shadow-2xs"
              >
                Journal Website
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#55657d]">
            Admin sets journal parameters and oversees the master audit trail.
          </div>
        </div>
      </div>
    </div>
  );
}
