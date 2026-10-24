import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BASE_DATE, getDateString, formatINR } from '../../constants/initialData';

export function AdminDashboardView() {
  const { data, setSession, saveFeeRule, saveLimits } = useApp();
  const { session, journals, limits, users, reviewers, papers } = data;
  const tab = session.tab || 'fees';

  // State for fees
  const [feeForm, setFeeForm] = useState({
    IJMAR: { ...journals.IJMAR.fee, editorEmail: journals.IJMAR.editorEmail },
    IJSPAST: { ...journals.IJSPAST.fee, editorEmail: journals.IJSPAST.editorEmail },
  });

  // State for limits
  const [limitsForm, setLimitsForm] = useState({ ...limits });

  // Compile audit trail across all papers
  const allAuditEvents = [];
  papers.forEach((p) => {
    p.trail.forEach((t) => {
      allAuditEvents.push({
        pid: p.id,
        journal: p.journal,
        ...t,
      });
    });
  });
  allAuditEvents.sort((a, b) => b.n - a.n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b6e] tracking-tight">
            System Administration
          </h1>
          <p className="text-xs text-[#55657d] mt-0.5">
            Configure journal fee rules, stage deadlines, manage system users, and inspect immutable audit logs.
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSession({ tab: 'fees', pid: null })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'fees'
                ? 'bg-white text-[#0d3b6e] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Journals & Fees
          </button>
          <button
            onClick={() => setSession({ tab: 'lim', pid: null })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'lim'
                ? 'bg-white text-[#0d3b6e] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Time Limits
          </button>
          <button
            onClick={() => setSession({ tab: 'usr', pid: null })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'usr'
                ? 'bg-white text-[#0d3b6e] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setSession({ tab: 'aud', pid: null })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              tab === 'aud'
                ? 'bg-white text-[#0d3b6e] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* Tab: Fees */}
      {tab === 'fees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['IJMAR', 'IJSPAST'].map((jKey) => {
            const currentFee = feeForm[jKey];
            return (
              <div
                key={jKey}
                className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-base font-bold text-[#0d3b6e]">{jKey} Journal Fee Policy</h2>
                  <span className="text-xs font-mono font-semibold text-slate-500">{jKey}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Editor Mailbox
                    </label>
                    <input
                      type="email"
                      value={currentFee.editorEmail}
                      onChange={(e) =>
                        setFeeForm((prev) => ({
                          ...prev,
                          [jKey]: { ...prev[jKey], editorEmail: e.target.value },
                        }))
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Base Pages
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={currentFee.base}
                        onChange={(e) =>
                          setFeeForm((prev) => ({
                            ...prev,
                            [jKey]: { ...prev[jKey], base: e.target.value },
                          }))
                        }
                        className="w-full text-xs sm:text-sm px-2.5 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Base Fee (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={currentFee.amt}
                        onChange={(e) =>
                          setFeeForm((prev) => ({
                            ...prev,
                            [jKey]: { ...prev[jKey], amt: e.target.value },
                          }))
                        }
                        className="w-full text-xs sm:text-sm px-2.5 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Per Extra Page (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={currentFee.extra}
                        onChange={(e) =>
                          setFeeForm((prev) => ({
                            ...prev,
                            [jKey]: { ...prev[jKey], extra: e.target.value },
                          }))
                        }
                        className="w-full text-xs sm:text-sm px-2.5 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => saveFeeRule(jKey, currentFee)}
                    className="w-full py-2 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    Save {jKey} Settings
                  </button>

                  <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                    Client sample rule: Up to {currentFee.base} pages is ₹
                    {Number(currentFee.amt).toLocaleString('en-IN')}, then ₹
                    {Number(currentFee.extra).toLocaleString('en-IN')} per additional page. One unified QR code serves both journals.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Time Limits */}
      {tab === 'lim' && (
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-[#0d3b6e]">
              Stage Duration Limits (Business Rules Section 10 & 11)
            </h2>
            <p className="text-xs text-[#55657d] mt-0.5">
              No button is blocked after a deadline expires; warnings and automated reminder emails/SMS are triggered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['screen', 'Editor screening (days)'],
              ['rev1', 'Reviewer 1st review, normal (days)'],
              ['rev1max', 'Reviewer 1st review, max (days)'],
              ['sendComments', 'Editor sends comments to author (days)'],
              ['authorReply', 'Author replies with revision (days)'],
              ['forward', 'Editor forwards reply to reviewers (days)'],
              ['rev2', 'Reviewer 2nd review, min (days)'],
              ['rev2max', 'Reviewer 2nd review, max (days)'],
              ['decision', 'Editor final decision (days)'],
              ['camera', 'Author camera-ready upload (days)'],
              ['format', 'Editor formats paper (days)'],
              ['proof', 'Author proofreading (days)'],
              ['pay', 'Author payment window (days)'],
              ['maxPushback', 'Editor push-backs before review limit'],
              ['maxProof', 'Maximum proofreading exchanges'],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  min={1}
                  value={limitsForm[k] || ''}
                  onChange={(e) =>
                    setLimitsForm((prev) => ({
                      ...prev,
                      [k]: Number(e.target.value) || 1,
                    }))
                  }
                  className="w-full text-xs sm:text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#f2b01e]"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={limitsForm.sms}
                onChange={(e) =>
                  setLimitsForm((prev) => ({ ...prev, sms: e.target.checked }))
                }
                className="w-4 h-4 text-[#0d3b6e] rounded"
              />
              <span>
                Dispatch mobile text messages (SMS) alongside warning & reminder emails
              </span>
            </label>
          </div>

          <button
            onClick={() => saveLimits(limitsForm)}
            className="px-6 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            Save Time Limits & Policies
          </button>
        </div>
      )}

      {/* Tab: Users */}
      {tab === 'usr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authors */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-[#0d3b6e] border-b pb-2">
              Registered Authors ({Object.keys(users).length})
            </h3>
            <div className="overflow-x-auto max-h-[450px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.keys(users).map((em) => (
                    <tr key={em} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {users[em].name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{em}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Editors & Reviewers */}
          <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-[#0d3b6e] border-b pb-2">
              Editorial Board & Reviewers
            </h3>
            <div className="overflow-x-auto max-h-[450px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b">
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Designation / Name</th>
                    <th className="py-2 px-3">Mailbox</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {['IJMAR', 'IJSPAST'].map((j) => (
                    <tr key={j} className="hover:bg-slate-50 bg-blue-50/30">
                      <td className="py-2 px-3 font-bold text-[#0d3b6e]">Editor</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{j}</td>
                      <td className="py-2 px-3 text-slate-600 font-mono">
                        {journals[j].editorEmail}
                      </td>
                    </tr>
                  ))}
                  {reviewers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-emerald-800 font-semibold">Reviewer</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="py-2 px-3 text-slate-600 font-mono">{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {tab === 'aud' && (
        <div className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-base text-[#0d3b6e]">
              Global System Activity & Compliance Audit Log
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Recorded Actions: {allAuditEvents.length}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Paper ID</th>
                  <th className="py-2.5 px-3 font-semibold">Actor</th>
                  <th className="py-2.5 px-3 font-semibold">Action Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allAuditEvents.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {getDateString(BASE_DATE, item.day)} {item.time}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-[#0b5cad] whitespace-nowrap">
                      {item.pid}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {item.actor}
                    </td>
                    <td className="py-2 px-3 text-slate-700">{item.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
