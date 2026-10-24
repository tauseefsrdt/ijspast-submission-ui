import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchManuscripts } from '../../store/slices/manuscriptSlice';
import { StatCard } from '../../components/common/StatCard';
import { ManuscriptTable } from '../../components/tables/ManuscriptTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  UserCheck,
  User,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Mail,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);

  useEffect(() => {
    dispatch(fetchManuscripts());
  }, [dispatch]);

  const displayedManuscripts = manuscripts;
  const activePaper = displayedManuscripts[0];

  const total = displayedManuscripts.length;
  const awaitingAssignment = displayedManuscripts.filter(
    (m) => m.status === 'Submitted' || m.status === 'Editor Assessment'
  ).length;
  const underReview = displayedManuscripts.filter(
    (m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned'
  ).length;
  const reviewCompleted = displayedManuscripts.filter((m) => m.status === 'Review Completed').length;
  const revisionRequested = displayedManuscripts.filter(
    (m) => m.status === 'Revision Requested' || m.status === 'Revision Submitted'
  ).length;
  const accepted = displayedManuscripts.filter((m) => m.status === 'Accepted').length;
  const published = displayedManuscripts.filter((m) => m.status === 'Published').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Editorial Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editor-in-Chief Desk • SRMU Journals Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
            Editorial Management Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Screen incoming submissions, assign expert peer reviewers, examine evaluations, and manage publication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(fetchManuscripts())}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>{displayedManuscripts.length} Active Records</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard title="Total" value={total} icon={FileText} color="indigo" />
        <StatCard
          title="Awaiting Assignment"
          value={awaitingAssignment}
          icon={Clock}
          color="blue"
          badge={awaitingAssignment > 0 ? 'Action' : undefined}
        />
        <StatCard title="Under Review" value={underReview} icon={Send} color="purple" />
        <StatCard
          title="Reviews In"
          value={reviewCompleted}
          icon={CheckCircle2}
          color="indigo"
          badge={reviewCompleted > 0 ? 'Decision' : undefined}
        />
        <StatCard title="Revision" value={revisionRequested} icon={AlertTriangle} color="amber" />
        <StatCard title="Accepted" value={accepted} icon={CheckCircle2} color="emerald" />
        <StatCard title="Published" value={published} icon={BookOpen} color="blue" />
      </div>

      {/* Editorial Spotlight Card */}
      {activePaper && (
        <div className="bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Featured Submission Track: {activePaper.id}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Double-blind peer review channel managed exclusively through the Editorial Office
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={activePaper.status} size="sm" />
              <button
                type="button"
                onClick={() => navigate(`/editor/manuscript/${activePaper.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <span>Editorial Decision Desk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* Author Card (Left) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <User className="w-3 h-3" />
                  <span>Corresponding Author</span>
                </span>
                <span className="font-mono text-xs font-bold text-indigo-700">{activePaper.id}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {activePaper.author?.name || 'Author'}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">
                  {activePaper.author?.institution || 'Institution'}
                </p>
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-800 line-clamp-1">
                    "{activePaper.title}"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Domain: {activePaper.domain}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {activePaper.author?.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Submitted: {activePaper.submissionDate}
                </span>
              </div>
            </div>

            {/* Double-Blind Editorial Bridge (Center) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-2 lg:py-0">
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                <ArrowRight className="w-4 h-4 hidden lg:block" />
                <ArrowRight className="w-4 h-4 lg:hidden rotate-90" />
              </div>
              <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider mt-1.5">
                Double Blind
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Identities Masked</span>
            </div>

            {/* Reviewer Card (Right) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  <GraduationCap className="w-3 h-3" />
                  <span>Assigned Reviewer</span>
                </span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                  {activePaper.status === 'Review Completed'
                    ? 'Scorecard Submitted'
                    : activePaper.status === 'Revision Submitted'
                    ? 'Round 2 Re-check'
                    : activePaper.assignedReviewerName
                    ? 'Evaluation In Progress'
                    : 'Awaiting Assignment'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {activePaper.assignedReviewerName || 'Not Assigned Yet'}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">
                  {activePaper.assignedReviewerName ? 'Assigned Peer Reviewer' : 'Click to assign from directory'}
                </p>
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="font-semibold text-slate-800">
                    Target Domain
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {activePaper.domain}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {activePaper.assignedReviewerId ? `ID: ${activePaper.assignedReviewerId}` : 'Unassigned'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Deadline: {activePaper.reviewDeadline || '14 Days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manuscript Management Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manuscripts Management Queue</h2>
            <p className="text-xs text-slate-500 font-medium">
              Live editorial submissions fetched from backend database
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {isLoading ? 'Fetching records...' : `${displayedManuscripts.length} records`}
          </span>
        </div>

        <ManuscriptTable
          manuscripts={displayedManuscripts}
          currentRole="editor"
          showReviewerColumn={true}
        />
      </div>
    </div>
  );
};
