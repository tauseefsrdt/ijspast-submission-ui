import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAuthorManuscripts } from '../../store/slices/manuscriptSlice';
import { StatCard } from '../../components/common/StatCard';
import { ManuscriptTable } from '../../components/tables/ManuscriptTable';
import {
  FileText,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Plus,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const AuthorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);

  useEffect(() => {
    dispatch(fetchAuthorManuscripts());
  }, [dispatch]);

  const authorPapers = manuscripts;

  const total = authorPapers.length;
  const submitted = authorPapers.filter(
    (m) => m.status === 'Submitted' || m.status === 'Editor Assessment'
  ).length;
  const underReview = authorPapers.filter(
    (m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned'
  ).length;
  const revisionRequested = authorPapers.filter((m) => m.status === 'Revision Requested').length;
  const accepted = authorPapers.filter((m) => m.status === 'Accepted').length;
  const published = authorPapers.filter((m) => m.status === 'Published').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Author Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
            Welcome, {user?.name || 'Author'}
          </h1>
          <p className="text-xs text-slate-500">
            Track submissions, respond to peer reviewer revisions, and monitor publication progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(fetchAuthorManuscripts())}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh manuscripts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/submit')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Manuscript (Public Portal)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total" value={total} icon={FileText} color="indigo" />
        <StatCard title="Submitted" value={submitted} icon={Clock} color="blue" />
        <StatCard title="Under Review" value={underReview} icon={Send} color="purple" />
        <StatCard
          title="Revision Req."
          value={revisionRequested}
          icon={AlertTriangle}
          color="amber"
          badge={revisionRequested > 0 ? 'Action' : undefined}
        />
        <StatCard title="Accepted" value={accepted} icon={CheckCircle2} color="emerald" />
        <StatCard title="Published" value={published} icon={BookOpen} color="blue" />
      </div>

      {/* Manuscripts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Submitted Manuscripts</h2>
          <span className="text-xs text-slate-500 font-medium">
            {isLoading ? 'Loading live manuscripts...' : `${authorPapers.length} records`}
          </span>
        </div>

        <ManuscriptTable manuscripts={authorPapers} currentRole="author" />
      </div>
    </div>
  );
};
