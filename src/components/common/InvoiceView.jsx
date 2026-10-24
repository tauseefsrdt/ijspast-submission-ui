import React from 'react';
import { JOURNAL_INFO, BASE_DATE, getDateString, formatINR } from '../../constants/initialData';
import { QrCode } from './QrCode';
import { Printer, CheckCircle2, FileText, Download } from 'lucide-react';

export function InvoiceView({ paper, calc, preview = false, currentDay = 0, onPrint }) {
  if (!calc) return null;
  const jInfo = JOURNAL_INFO[paper.journal] || JOURNAL_INFO.IJMAR;
  const amt = paper.override != null ? paper.override : calc.total;
  const inv = paper.invoice;
  const extraAmt = calc.ex * calc.rate;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-sm space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm tracking-wide uppercase">
            Official APC Invoicing Document
          </span>
          {preview ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Draft Preview
            </span>
          ) : inv?.status === 'Paid' ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAID &amp; SETTLED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Payment Pending
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / PDF
        </button>
      </div>

      {/* Journal Header */}
      <div className="text-center space-y-1">
        <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 mb-1">
          <span className="text-xs font-bold tracking-wider text-indigo-900 uppercase">
            Shri Ramswaroop Memorial University (SRMU)
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {paper.journal}
        </h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
          {jInfo.full}
        </p>
        <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
          {paper.journal} Editorial and Production Office • {jInfo.editorEmail}
        </p>
      </div>

      {/* Meta Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Invoice Number:</span>
          <span className="font-mono font-bold text-slate-800 text-sm">
            {inv ? inv.no : 'Issued on Final OK'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Invoice Date:</span>
          <span className="font-semibold text-slate-800">
            {getDateString(BASE_DATE, inv ? inv.day : currentDay)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Payment Status:</span>
          <span
            className={`font-bold uppercase tracking-wider ${
              inv?.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {inv?.status === 'Paid' ? 'Paid Online' : 'Pending Authorization'}
          </span>
        </div>
      </div>

      {/* Billing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
            Billed To (Corresponding Author):
          </span>
          <h4 className="font-bold text-slate-900 text-sm">{paper.author.name}</h4>
          <p className="text-slate-600">{paper.author.inst}</p>
          {paper.author.dept && <p className="text-slate-500">{paper.author.dept}</p>}
          <p className="text-slate-500">{paper.author.city}</p>
          <p className="text-slate-500 font-mono text-[11px] mt-1">{paper.author.email}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
            Manuscript Reference:
          </span>
          <p className="font-mono font-bold text-indigo-700 text-sm">{paper.id}</p>
          <p className="text-slate-800 font-medium line-clamp-2">{paper.title}</p>
          <p className="text-slate-500 text-[11px]">Subject Domain: {paper.domain}</p>
          <p className="text-slate-500 text-[11px]">Final Verified Length: {calc.pages} Pages</p>
        </div>
      </div>

      {/* Line Item Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 font-semibold text-right">Basis / Rate</th>
              <th className="py-2.5 px-3 font-semibold text-right w-32">Amount (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5 px-3 text-center text-slate-400">1</td>
              <td className="py-2.5 px-3 font-medium text-slate-800">
                Fixed Article Processing Charge (Up to {calc.limit} published pages)
              </td>
              <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                {formatINR(calc.baseAmt)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                {calc.baseAmt.toFixed(2)}
              </td>
            </tr>
            {calc.ex > 0 && (
              <tr>
                <td className="py-2.5 px-3 text-center text-slate-400">2</td>
                <td className="py-2.5 px-3 font-medium text-slate-800">
                  Overlength Page Surcharge ({calc.ex} extra page{calc.ex > 1 ? 's' : ''} beyond {calc.limit} pages)
                </td>
                <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                  ₹{calc.rate} / page
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                  {extraAmt.toFixed(2)}
                </td>
              </tr>
            )}
            {paper.override != null && (
              <tr className="bg-amber-50/50">
                <td className="py-2.5 px-3 text-center text-amber-500">*</td>
                <td className="py-2.5 px-3 font-medium text-amber-900">
                  Editorial Fee Adjustment / Approved Override
                </td>
                <td className="py-2.5 px-3 text-right text-amber-700 font-mono italic">
                  Special editorial sanction
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900">
                  {Number(paper.override).toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-300">
              <td colSpan={3} className="py-3 px-4 font-bold text-slate-800 text-sm text-right">
                Total Article Processing Charge (APC):
              </td>
              <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-900 text-base">
                {formatINR(amt)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment & QR Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            UPI / Instant Payment Gateway
          </h4>
          <p className="text-slate-600 max-w-sm">
            Scan using PhonePe, Google Pay, Paytm, BHIM, or any authorized UPI mobile banking application.
            One universal QR serves both IJMAR and IJSPAST publications.
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            VPA: srmu.journals@bank • A/C: SRMU Editorial Research Fund
          </p>
          {inv?.status === 'Paid' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Receipt confirmed on {getDateString(BASE_DATE, paper.paidDay || currentDay)}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <QrCode size={120} />
        </div>
      </div>

      {/* Footer Notes */}
      <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 space-y-1">
        <p>
          This is an official computer-generated receipt/invoice issued by Shri Ramswaroop Memorial University Journal Publication Division.
        </p>
        <p>
          For billing inquiries, contact the respective editorial office: {jInfo.editorEmail}
        </p>
      </div>
    </div>
  );
}
