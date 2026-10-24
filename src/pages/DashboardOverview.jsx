import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  CreditCard,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  Eye,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TimeTag } from '../components/common/TimeTag';
import { OrcidBadge } from '../components/common/OrcidBadge';
import { formatINR, STATUS_OWNERS } from '../constants/initialData';

export function DashboardOverview() {
  const { data } = useApp();
  const navigate = useNavigate();

  const [selectedJournal, setSelectedJournal] = useState('ALL');
  const papers = data?.papers || [];
  const currentDay = data?.day || 0;

  // Filter papers by journal if selected
  const filteredPapers =
    selectedJournal === 'ALL'
      ? papers
      : papers.filter((p) => p.journal === selectedJournal);

  // Compute metrics
  const totalCount = filteredPapers.length;
  const underScreening = filteredPapers.filter((p) => p.status === 'Under Screening').length;
  const inReview = filteredPapers.filter(
    (p) => p.status === 'Sent to Reviewers' || p.status === 'Re-review' || p.status === 'Review Received'
  ).length;
  const inProof = filteredPapers.filter(
    (p) =>
      p.status === 'Accepted' ||
      p.status === 'Camera-Ready Received' ||
      p.status === 'Proofreading' ||
      p.status === 'Changes Requested'
  ).length;
  const inPayment = filteredPapers.filter((p) => p.status === 'Payment Pending').length;
  const publishedCount = filteredPapers.filter((p) => p.status === 'Published').length;

  // Compute APC revenue
  const totalPaidRevenue = filteredPapers
    .filter((p) => p.invoice && p.invoice.status === 'Paid')
    .reduce((sum, p) => sum + (p.invoice.total || 0), 0);

  const pendingRevenue = filteredPapers
    .filter((p) => p.invoice && p.invoice.status !== 'Paid')
    .reduce((sum, p) => sum + (p.invoice.total || 0), 0);

  // Identify papers needing immediate attention (due soon or overdue)
  const urgentPapers = filteredPapers
    .filter((p) => p.due !== null && p.due !== undefined)
    .sort((a, b) => a.due - b.due)
    .slice(0, 5);

  const pipelineStages = [
    {
      title: 'Initial Screening',
      count: underScreening,
      status: 'Under Screening',
      icon: Eye,
      color: 'blue',
      routeFilter: 'screening',
    },
    {
      title: 'Peer Review',
      count: inReview,
      status: 'Sent to Reviewers',
      icon: Send,
      color: 'indigo',
      routeFilter: 'review',
    },
    {
      title: 'Camera-Ready & Proofing',
      count: inProof,
      status: 'Proofreading',
      icon: FileText,
      color: 'amber',
      routeFilter: 'proofing',
    },
    {
      title: 'Payment Pending',
      count: inPayment,
      status: 'Payment Pending',
      icon: CreditCard,
      color: 'purple',
      routeFilter: 'payment',
    },
    {
      title: 'Published Online',
      count: publishedCount,
      status: 'Published',
      icon: BookOpen,
      color: 'emerald',
      routeFilter: 'published',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SRMU Editorial Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Publishing Executive Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time oversight of double-blind peer review, similarity screening, author proofreading, and APC revenue for{' '}
              <strong className="text-white">IJMAR</strong> &amp; <strong className="text-white">IJSPAST</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Journal Switcher */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15 flex items-center gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedJournal('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedJournal === 'ALL'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                All Journals
              </button>
              <button
                type="button"
                onClick={() => setSelectedJournal('IJMAR')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedJournal === 'IJMAR'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                IJMAR
              </button>
              <button
                type="button"
                onClick={() => setSelectedJournal('IJSPAST')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedJournal === 'IJSPAST'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                IJSPAST
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/submit')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <span>+ Submit Paper</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Manuscripts"
          value={totalCount}
          subtext={`${filteredPapers.filter((p) => p.journal === 'IJMAR').length} IJMAR • ${filteredPapers.filter((p) => p.journal === 'IJSPAST').length} IJSPAST`}
          icon={FileText}
          color="indigo"
          onClick={() => navigate('/manuscripts')}
        />
        <StatCard
          title="Under Screening"
          value={underScreening}
          subtext="Similarity check &amp; initial triage"
          badge={underScreening > 0 ? 'Action Needed' : undefined}
          icon={Eye}
          color="blue"
          onClick={() => navigate('/manuscripts?tab=screening')}
        />
        <StatCard
          title="Active in Review"
          value={inReview}
          subtext="Round 1 &amp; Round 2 double-blind"
          icon={Send}
          color="purple"
          onClick={() => navigate('/manuscripts?tab=review')}
        />
        <StatCard
          title="APC Revenue Settled"
          value={formatINR(totalPaidRevenue)}
          subtext={`Pending invoices: ${formatINR(pendingRevenue)}`}
          icon={CreditCard}
          color="emerald"
          onClick={() => navigate('/billing')}
        />
      </div>

      {/* Workflow Pipeline Progression Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manuscript Workflow Pipeline</h3>
            <p className="text-xs text-slate-500">
              Live lifecycle distribution across editorial, review, and publication stages
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/manuscripts')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Papers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.title}
                onClick={() => navigate(`/manuscripts?tab=${stage.routeFilter}`)}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 hover:border-indigo-200 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-indigo-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600">
                    {stage.count}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{stage.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Click to filter</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Action Needed / Deadlines & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Attention / Deadlines (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Priority Action &amp; Upcoming Deadlines
                </h3>
                <p className="text-xs text-slate-500">
                  Manuscripts requiring prompt attention based on BRD SLA thresholds
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {urgentPapers.length} Active SLA Tracking
            </span>
          </div>

          {urgentPapers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No papers currently have pressing deadlines.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Paper ID</th>
                    <th className="py-2.5 px-3">Title &amp; Author</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Responsibility</th>
                    <th className="py-2.5 px-3">Time Left</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {urgentPapers.map((paper) => {
                    const owner = STATUS_OWNERS[paper.status] || 'Editor';
                    return (
                      <tr
                        key={paper.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/manuscripts/${paper.id}`)}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {paper.id}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{paper.title}</p>
                          <p className="text-[11px] text-slate-500">{paper.author.name}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={paper.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {owner}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <TimeTag
                            due={paper.due}
                            dueMax={paper.dueMax}
                            currentDay={currentDay}
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/manuscripts/${paper.id}`);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Launch & System Outbox Summary (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Quick Editorial Actions</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/submit')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Submit New Manuscript</p>
                    <p className="text-[10px] text-slate-500">Live ORCID verification &amp; intake</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/reviewers')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Register Reviewer</p>
                    <p className="text-[10px] text-slate-500">Add expert to domain roster</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/billing')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Manage APC Invoices</p>
                    <p className="text-[10px] text-slate-500">Verify UPI receipts &amp; payments</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/outbox')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">System Outbox</p>
                    <p className="text-[10px] text-slate-500">{data?.mail?.length || 0} automated messages sent</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 text-[11px] block">
              Double-Blind Peer Review Compliance
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Reviewer names are strictly masked from authors and author identities are hidden from reviewers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
