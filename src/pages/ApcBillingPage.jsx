import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { InvoiceView } from '../components/common/InvoiceView';
import { QrCode } from '../components/common/QrCode';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR, BASE_DATE, getDateString } from '../constants/initialData';

export function ApcBillingPage() {
  const { data, processPayment, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'paid' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoicePaper, setSelectedInvoicePaper] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingPaper, setPayingPaper] = useState(null);

  const papers = data?.papers || [];
  const currentDay = data?.day || 0;

  // Filter papers that have an invoice generated
  const invoicedPapers = papers.filter((p) => p.invoice !== null && p.invoice !== undefined);

  // Financial aggregates
  const totalPaidRevenue = invoicedPapers
    .filter((p) => p.invoice.status === 'Paid')
    .reduce((sum, p) => sum + (p.invoice.total || 0), 0);

  const pendingReceivables = invoicedPapers
    .filter((p) => p.invoice.status !== 'Paid')
    .reduce((sum, p) => sum + (p.invoice.total || 0), 0);

  const totalInvoices = invoicedPapers.length;
  const averageFee = totalInvoices > 0 ? (totalPaidRevenue + pendingReceivables) / totalInvoices : 0;

  // Filtered items
  const filteredInvoices = invoicedPapers.filter((p) => {
    if (activeTab === 'paid' && p.invoice.status !== 'Paid') return false;
    if (activeTab === 'pending' && p.invoice.status === 'Paid') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInv = (p.invoice.no || '').toLowerCase().includes(q);
      const matchPaper = p.id.toLowerCase().includes(q);
      const matchAuthor = p.author.name.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      return matchInv || matchPaper || matchAuthor || matchTitle;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Article Processing Charge (APC) Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated publication fee calculation, GST, UPI QR code invoicing, and payment reconciliation.
          </p>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total APC Settled
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">{formatINR(totalPaidRevenue)}</p>
          <p className="text-xs text-slate-500 font-medium">Verified by automated gateway</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Receivables
          </span>
          <p className="text-2xl font-extrabold text-amber-600">{formatINR(pendingReceivables)}</p>
          <p className="text-xs text-slate-500 font-medium">Awaiting author online payment</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Invoices Issued
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{totalInvoices}</p>
          <p className="text-xs text-slate-500 font-medium">Total approved paper proofs</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Charge
          </span>
          <p className="text-2xl font-extrabold text-indigo-700">{formatINR(Math.round(averageFee))}</p>
          <p className="text-xs text-slate-500 font-medium">Includes page overlength fees</p>
        </div>
      </div>

      {/* Filter and Tab Strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Invoices ({totalInvoices})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'paid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid ({invoicedPapers.filter((p) => p.invoice.status === 'Paid').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({invoicedPapers.filter((p) => p.invoice.status !== 'Paid').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, paper ID, or author..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No invoices found"
            description="Invoices are automatically issued when authors approve their typeset proofs."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Manuscript</th>
                  <th className="py-3 px-4">Billed Author</th>
                  <th className="py-3 px-4">Length</th>
                  <th className="py-3 px-4">Total APC (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((p) => {
                  const inv = p.invoice;
                  const isPaid = inv.status === 'Paid';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.no}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {getDateString(BASE_DATE, inv.day)}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-mono text-indigo-700 font-bold block">{p.id}</span>
                        <p className="text-[11px] text-slate-700 truncate">{p.title}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900">{p.author.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{p.author.inst}</p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {inv.pages} Pages
                      </td>

                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                        {formatINR(inv.total)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Payment</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoicePaper(p)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                        >
                          View Document
                        </button>

                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayingPaper(p);
                              setIsPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                          >
                            Pay Online
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Document Modal */}
      <Modal
        isOpen={Boolean(selectedInvoicePaper)}
        onClose={() => setSelectedInvoicePaper(null)}
        wide={true}
      >
        {selectedInvoicePaper && (
          <InvoiceView
            paper={selectedInvoicePaper}
            calc={selectedInvoicePaper.calc}
            preview={false}
            currentDay={currentDay}
          />
        )}
      </Modal>

      {/* Instant Pay QR Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Instant UPI Payment Gateway"
        subtitle={`Invoice No: ${payingPaper?.invoice?.no} • Amount: ${formatINR(payingPaper?.invoice?.total || 0)}`}
        size="md"
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500">
            Scan using any authorized UPI application. Settlement is automatically verified and marked in the database.
          </p>

          <div className="flex justify-center">
            <QrCode size={140} />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (payingPaper) {
                  processPayment(payingPaper.id, true);
                  setIsPayModalOpen(false);
                  showToast(`Payment of ${formatINR(payingPaper.invoice.total)} verified automatically!`);
                }
              }}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simulate: Payment Success
            </button>

            <button
              type="button"
              onClick={() => {
                if (payingPaper) {
                  processPayment(payingPaper.id, false);
                  setIsPayModalOpen(false);
                  showToast('Payment simulation: Gateway reported transaction decline.');
                }
              }}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Simulate: Payment Decline
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
