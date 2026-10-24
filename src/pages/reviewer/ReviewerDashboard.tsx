import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReviewerManuscripts } from '../../store/slices/manuscriptSlice';
import { StatCard } from '../../components/common/StatCard';
import { ManuscriptTable } from '../../components/tables/ManuscriptTable';
import {
  CheckSquare,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const ReviewerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);

  useEffect(() => {
    dispatch(fetchReviewerManuscripts());
  }, [dispatch]);

  const assignedPapers = manuscripts;

  const totalAssigned = assignedPapers.length;
  const pendingReviews = assignedPapers.filter(
    (m) =>
      m.status === 'Under Review' ||
      m.status === 'Reviewer Assigned' ||
      m.status === 'Revision Submitted'
  ).length;
  const completedReviews = assignedPapers.filter(
    (m) =>
      m.status === 'Review Completed' ||
      m.status === 'Revision Requested' ||
      m.status === 'Accepted' ||
      m.status === 'Published'
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reviewer Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
            Reviewer Workstation • {user?.name || 'Reviewer'}
          </h1>
          <p className="text-xs text-slate-500">
            Evaluate technical validity, theoretical soundness, and research originality.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchReviewerManuscripts())}
          className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Refresh assignments"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Submissions"
          value={totalAssigned}
          icon={CheckSquare}
          color="purple"
        />
        <StatCard
          title="Pending Evaluation"
          value={pendingReviews}
          icon={Clock}
          color="amber"
          badge={pendingReviews > 0 ? 'Pending Action' : undefined}
        />
        <StatCard
          title="Completed Reports"
          value={completedReviews}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Assigned Manuscripts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Assigned Manuscripts for Peer Review</h2>
          <span className="text-xs text-slate-500 font-medium">
            {isLoading
              ? 'Loading assignments...'
              : `${assignedPapers.length} assigned records`}
          </span>
        </div>

        <ManuscriptTable manuscripts={assignedPapers} currentRole="reviewer" />
      </div>
    </div>
  );
};
