import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  Clock,
  Users,
  Shield,
  Save,
  CheckCircle2,
  Bell,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Tabs } from '../components/common/Tabs';
import { formatINR } from '../constants/initialData';

export function SettingsPage() {
  const { data, saveFeeRule, saveLimits, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'limits' | 'users'

  // Fee rule local state
  const journals = data?.journals || {};
  const [feeData, setFeeData] = useState({
    IJMAR: { ...journals.IJMAR?.fee, editorEmail: journals.IJMAR?.editorEmail || '' },
    IJSPAST: { ...journals.IJSPAST?.fee, editorEmail: journals.IJSPAST?.editorEmail || '' },
  });

  // Time limits local state
  const limits = data?.limits || {};
  const [localLimits, setLocalLimits] = useState({ ...limits });

  const tabs = [
    { id: 'fees', label: 'Journal Fee Rules', icon: CreditCard },
    { id: 'limits', label: 'SLA & Time Limits', icon: Clock },
    { id: 'users', label: 'User Directory', icon: Users },
  ];

  const handleSaveFee = (journal) => {
    saveFeeRule(journal, feeData[journal]);
    showToast(`Fee rules for ${journal} updated successfully`);
  };

  const handleSaveLimits = (e) => {
    e.preventDefault();
    saveLimits(localLimits);
    showToast('System SLA time limits and reminder settings saved');
  };

  const timeLimitFields = [
    { key: 'screen', label: 'Editorial Initial Screening', defaultVal: 7, unit: 'days' },
    { key: 'rev1', label: 'Reviewer Round 1 (Normal)', defaultVal: 7, unit: 'days' },
    { key: 'rev1max', label: 'Reviewer Round 1 (Maximum Extended)', defaultVal: 14, unit: 'days' },
    { key: 'sendComments', label: 'Editor Sends Comments to Author', defaultVal: 2, unit: 'days' },
    { key: 'authorReply', label: 'Author Point-by-Point Revision Reply', defaultVal: 7, unit: 'days' },
    { key: 'forward', label: 'Editor Forwards Revision to Reviewers', defaultVal: 2, unit: 'days' },
    { key: 'rev2', label: 'Reviewer Round 2 Re-check (Min)', defaultVal: 2, unit: 'days' },
    { key: 'rev2max', label: 'Reviewer Round 2 Re-check (Max)', defaultVal: 4, unit: 'days' },
    { key: 'decision', label: 'Editor Final Decision', defaultVal: 2, unit: 'days' },
    { key: 'camera', label: 'Author Camera-Ready Upload', defaultVal: 7, unit: 'days' },
    { key: 'format', label: 'Editor Final Typesetting & Fee Calculation', defaultVal: 7, unit: 'days' },
    { key: 'proof', label: 'Author Proofreading Approval / Changes', defaultVal: 2, unit: 'days' },
    { key: 'pay', label: 'Author APC Payment Settlement', defaultVal: 2, unit: 'days' },
    { key: 'maxPushback', label: 'Maximum Editorial Push-Backs (BRD Rule)', defaultVal: 2, unit: 'times' },
    { key: 'maxProof', label: 'Maximum Proofreading Exchanges (BRD Rule)', defaultVal: 5, unit: 'times' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Administration &amp; Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage publication charge rules, automated reminder limits, and institutional accounts.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Fee Rules */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['IJMAR', 'IJSPAST'].map((j) => {
            const jInfo = journals[j];
            const currentFee = feeData[j] || { base: 10, amt: 5000, extra: 500, editorEmail: '' };

            return (
              <div
                key={j}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5"
              >
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-lg text-slate-900">{j}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      Active Fee Schedule
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{jInfo?.name}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Designated Editorial Mailbox:
                    </label>
                    <input
                      type="email"
                      value={currentFee.editorEmail || ''}
                      onChange={(e) =>
                        setFeeData({
                          ...feeData,
                          [j]: { ...currentFee, editorEmail: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Base Pages Limit:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentFee.base}
                        onChange={(e) =>
                          setFeeData({
                            ...feeData,
                            [j]: { ...currentFee, base: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Base APC (₹):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentFee.amt}
                        onChange={(e) =>
                          setFeeData({
                            ...feeData,
                            [j]: { ...currentFee, amt: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Extra Page (₹):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentFee.extra}
                        onChange={(e) =>
                          setFeeData({
                            ...feeData,
                            [j]: { ...currentFee, extra: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                    Formula: ₹{currentFee.amt} up to {currentFee.base} pages + ₹{currentFee.extra}/page overlength surcharge. Universal UPI QR code applies.
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveFee(j)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save {j} Fee Schedule</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Time Limits & Reminders */}
      {activeTab === 'limits' && (
        <form
          onSubmit={handleSaveLimits}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              SLA Time Thresholds &amp; Automated Reminders Schedule
            </h3>
            <p className="text-xs text-slate-500">
              In accordance with BRD Section 10, deadlines trigger email &amp; SMS warnings without hard blocking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {timeLimitFields.map((field) => (
              <div key={field.key} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
                <label className="font-bold text-slate-800 block">{field.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={localLimits[field.key] ?? field.defaultVal}
                    onChange={(e) =>
                      setLocalLimits({ ...localLimits, [field.key]: Number(e.target.value) })
                    }
                    className="w-24 p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-medium">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={localLimits.sms || false}
                onChange={(e) => setLocalLimits({ ...localLimits, sms: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded-sm"
              />
              <span>Enable Automated SMS Phone Alerts for Overdue Actions (Free Tier)</span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6.5">
              Dispatches SMS reminders to author/reviewer registered phone numbers 1 day prior to deadline and when overdue.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Time Limits</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: User Directory */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authors */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
              Registered Authors
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(data?.users || {}).map(([email, user]) => (
                <div key={email} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Author
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewers & Editorial Team */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
              Editorial Board &amp; Expert Reviewers
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {['IJMAR', 'IJSPAST'].map((j) => (
                <div key={j} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Editor-in-Chief ({j})</p>
                    <p className="text-slate-500 font-mono text-[11px]">{journals[j]?.editorEmail}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Editor
                  </span>
                </div>
              ))}

              {(data?.reviewers || []).map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {r.email} • {r.domain}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    Reviewer ({r.id})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
