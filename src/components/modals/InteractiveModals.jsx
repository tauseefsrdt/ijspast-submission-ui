import React from 'react';
import { QrCodeSvg } from '../common/InvoiceView';
import { formatINR } from '../../constants/initialData';

export function OrcidModal({ orcidId, onAuthorize, onCancel }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-[#e5ecf6] pb-3">
        <div className="w-8 h-8 rounded-full bg-[#a6ce39] text-white flex items-center justify-center font-bold text-sm">
          iD
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#14233a]">
            ORCID Authorization (Simulated)
          </h2>
          <p className="text-xs text-[#55657d]">
            Secure Identity Verification Protocol
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">
        <b>SRMU Journals Portal</b> has requested permission to verify your 16-digit ORCID iD and match your registered identity against public records.
      </p>

      <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 text-center">
        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
          Requested ORCID iD
        </div>
        <div className="text-lg font-mono font-bold text-[#0d3b6e] tracking-wider">
          {orcidId}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Only your registered public name and identifier are returned.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onAuthorize(orcidId)}
          className="px-5 py-2 bg-[#f2b01e] hover:bg-[#dfa017] text-[#1d1600] font-semibold rounded-lg text-sm shadow-xs transition-colors"
        >
          Authorize & Verify
        </button>
      </div>
    </div>
  );
}

export function PaymentModal({ paper, onPayResult, onCancel }) {
  const inv = paper.invoice;
  const amount = inv ? inv.total : paper.calc?.total || 5000;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#e5ecf6] pb-3">
        <div>
          <h2 className="text-lg font-bold text-[#0d3b6e]">
            Online APC Payment Gateway
          </h2>
          <p className="text-xs text-[#55657d]">
            Unified Payments Interface (UPI) Simulated Terminal
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 uppercase font-semibold block">
            Payable Amount
          </span>
          <span className="text-2xl font-bold font-mono text-[#0d3b6e]">
            {formatINR(amount)}
          </span>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Invoice: <b className="font-mono text-slate-800">{inv?.no}</b></div>
          <div>Paper ID: <b className="font-mono text-slate-800">{paper.id}</b></div>
        </div>
      </div>

      <div className="text-center py-2 space-y-2">
        <div className="flex justify-center">
          <QrCodeSvg />
        </div>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Scan the QR code using any UPI application (Google Pay, PhonePe, Paytm, or BHIM). The payment is verified instantly upon gateway callback.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <b>Simulation Sandbox:</b> You can simulate either a successful payment confirmation or a transaction failure to test error recovery flows.
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => onPayResult(false)}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold transition-colors"
        >
          Simulate: Payment Failed
        </button>
        <button
          type="button"
          onClick={() => onPayResult(true)}
          className="px-5 py-2 bg-[#13663c] hover:bg-[#0f5230] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          Simulate: Payment Received
        </button>
      </div>
    </div>
  );
}
