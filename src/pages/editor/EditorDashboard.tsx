import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchManuscripts, assignManuscriptReviewer } from '../../store/slices/manuscriptSlice';
import { fetchReviewers, createNewReviewer } from '../../store/slices/reviewerSlice';
import { getReviewsByManuscriptApi } from '../../features/reviews/reviewThunk';
import { StatCard } from '../../components/common/StatCard';
import { ManuscriptTable } from '../../components/tables/ManuscriptTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssignReviewerModal } from '../../components/modals/AssignReviewerModal';
import { EditReviewerModal } from '../../components/modals/EditReviewerModal';
import { DeleteReviewerModal } from '../../components/modals/DeleteReviewerModal';
import { Modal } from '../../components/common/Modal';
import { AuthorDirectoryTable } from '../../components/tables/AuthorDirectoryTable';
import { ReviewerDirectoryTable } from '../../components/tables/ReviewerDirectoryTable';
import { ReviewerProfile } from '../../types/user.types';
import { Manuscript } from '../../types/manuscript.types';
import { ReviewReport } from '../../types/review.types';
import { SRMU_CRITERIA } from '../../components/forms/ReviewForm';
import { reviewerEnrollmentSchema } from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Mail,
  Calendar,
  RefreshCw,
  Plus,
  Users,
  Search,
  Layers,
  Shield,
  Phone,
  Building,
  Check,
  Copy,
  Briefcase,
  Edit2,
  Trash2,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);
  const { reviewers, isLoading: isReviewersLoading } = useAppSelector((state) => state.reviewers);

  // Active dashboard view tab
  const [activeTab, setActiveTab] = useState<'queue' | 'authors' | 'reviewersTable' | 'reviewers' | 'feedback'>('queue');

  // Selected KPI filter for the queue
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Reviewer search & filter
  const [reviewerSearch, setReviewerSearch] = useState('');

  // Create Reviewer Modal state
  const [isCreateReviewerOpen, setIsCreateReviewerOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit & Delete Reviewer Modal state
  const [editingReviewer, setEditingReviewer] = useState<ReviewerProfile | null>(null);
  const [deletingReviewer, setDeletingReviewer] = useState<ReviewerProfile | null>(null);

  // Assign Reviewer Modal state
  const [assignModalTarget, setAssignModalTarget] = useState<Manuscript | null>(null);

  // Feedback Dossier Modal state (Requirement 4)
  const [selectedManuscriptForDossier, setSelectedManuscriptForDossier] = useState<Manuscript | null>(null);
  const [dossierReviews, setDossierReviews] = useState<ReviewReport[]>([]);
  const [isDossierLoading, setIsDossierLoading] = useState(false);

  // Cache of reviews for all manuscripts to show summary badges
  const [reviewsCache, setReviewsCache] = useState<Record<string, ReviewReport[]>>({});

  useEffect(() => {
    dispatch(fetchManuscripts());
    dispatch(fetchReviewers());
  }, [dispatch]);

  // Prefetch reviews for active papers to show live Stage 1 & Stage 2 statuses in the Feedback tab
  useEffect(() => {
    if (manuscripts.length > 0) {
      manuscripts.forEach(async (m) => {
        if (
          m.status === 'Under Review' ||
          m.status === 'Review Completed' ||
          m.status === 'Revision Requested' ||
          m.status === 'Revision Submitted' ||
          m.status === 'Accepted'
        ) {
          try {
            const list = await getReviewsByManuscriptApi(m.id, 'editor');
            setReviewsCache((prev) => ({ ...prev, [m.id]: list }));
          } catch {
            // ignore
          }
        }
      });
    }
  }, [manuscripts]);

  // Formik for new reviewer enrollment with validation
  const createReviewerFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      institution: '',
      domain: 'Artificial Intelligence and Machine Learning (Computing & AI)',
    },
    validationSchema: reviewerEnrollmentSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const result = await dispatch(createNewReviewer(values)).unwrap();

        if (result?.credentials) {
          setCreatedCredentials({
            name: result.reviewer?.name || values.name,
            email: result.credentials.email,
            password: result.credentials.password,
          });
        }

        toast.success(`Reviewer "${values.name}" enrolled successfully!`);
        resetForm();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to register reviewer.');
      }
    },
  });

  const displayedManuscripts = useMemo(() => {
    if (!kpiFilter) return manuscripts;
    if (kpiFilter === 'AWAITING') {
      return manuscripts.filter((m) => m.status === 'Submitted' || m.status === 'Editor Assessment');
    }
    if (kpiFilter === 'UNDER_REVIEW') {
      return manuscripts.filter((m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned');
    }
    if (kpiFilter === 'REVIEWS_IN') {
      return manuscripts.filter((m) => m.status === 'Review Completed');
    }
    if (kpiFilter === 'REVISION') {
      return manuscripts.filter((m) => m.status === 'Revision Requested' || m.status === 'Revision Submitted');
    }
    if (kpiFilter === 'ACCEPTED') {
      return manuscripts.filter((m) => m.status === 'Accepted');
    }
    if (kpiFilter === 'PUBLISHED') {
      return manuscripts.filter((m) => m.status === 'Published');
    }
    return manuscripts;
  }, [manuscripts, kpiFilter]);

  const activePaper = manuscripts[0];

  const total = manuscripts.length;
  const awaitingAssignment = manuscripts.filter(
    (m) => m.status === 'Submitted' || m.status === 'Editor Assessment'
  ).length;
  const underReview = manuscripts.filter(
    (m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned'
  ).length;
  const reviewCompleted = manuscripts.filter((m) => m.status === 'Review Completed').length;
  const revisionRequested = manuscripts.filter(
    (m) => m.status === 'Revision Requested' || m.status === 'Revision Submitted'
  ).length;
  const accepted = manuscripts.filter((m) => m.status === 'Accepted').length;
  const published = manuscripts.filter((m) => m.status === 'Published').length;

  // Filter reviewers
  const filteredReviewers = useMemo(() => {
    if (!reviewerSearch.trim()) return reviewers;
    const q = reviewerSearch.toLowerCase().trim();
    return reviewers.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.institution.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q)
    );
  }, [reviewers, reviewerSearch]);

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `IJSPAST Reviewer Credentials:\nPortal: https://ijspast.org/login\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Reviewer credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAssignConfirm = async (
    reviewerId: string,
    reviewerName: string,
    reviewer2Id?: string,
    reviewer2Name?: string
  ) => {
    if (!assignModalTarget) return;
    try {
      await dispatch(
        assignManuscriptReviewer({
          manuscriptId: assignModalTarget.id,
          reviewerId,
          reviewerName,
          reviewer2Id,
          reviewer2Name,
        })
      ).unwrap();

      toast.success(
        `Assigned ${reviewerName}${reviewer2Name ? ` & ${reviewer2Name}` : ''} to ${assignModalTarget.id} successfully!`
      );
      setAssignModalTarget(null);
      await dispatch(fetchManuscripts());
      await dispatch(fetchReviewers());
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign reviewers.');
    }
  };

  const handleOpenDossier = async (paper: Manuscript) => {
    setSelectedManuscriptForDossier(paper);
    setIsDossierLoading(true);
    try {
      const list = await getReviewsByManuscriptApi(paper.id, 'editor');
      setDossierReviews(list || []);
    } catch (err: any) {
      toast.error('Failed to load review evaluations.');
    } finally {
      setIsDossierLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([dispatch(fetchManuscripts()), dispatch(fetchReviewers())]);
    toast.info('Dashboard metrics and records refreshed.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Editorial Control Center Hero Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Editorial Control Center</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Editorial Workflow &amp; Submissions Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Administer double-blind peer review lifecycle, manage dual reviewer assignments, and oversee open-access publishing operations.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Refresh database feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isReviewersLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreatedCredentials(null);
              setIsCreateReviewerOpen(true);
            }}
            className="px-4 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Reviewer</span>
          </button>
        </div>
      </div>

      {/* Interactive Enterprise KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          title="Total Papers"
          value={total}
          icon={FileText}
          color="indigo"
          isActive={kpiFilter === null}
          onClick={() => {
            setKpiFilter(null);
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Awaiting Assignment"
          value={awaitingAssignment}
          icon={Clock}
          color="blue"
          badge={awaitingAssignment > 0 ? 'Action' : undefined}
          isActive={kpiFilter === 'AWAITING'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'AWAITING' ? null : 'AWAITING');
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Under Review"
          value={underReview}
          icon={Send}
          color="purple"
          isActive={kpiFilter === 'UNDER_REVIEW'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'UNDER_REVIEW' ? null : 'UNDER_REVIEW');
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Reviews In"
          value={reviewCompleted}
          icon={CheckCircle2}
          color="indigo"
          badge={reviewCompleted > 0 ? 'Decision' : undefined}
          isActive={kpiFilter === 'REVIEWS_IN'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'REVIEWS_IN' ? null : 'REVIEWS_IN');
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Revision Cycle"
          value={revisionRequested}
          icon={AlertTriangle}
          color="amber"
          isActive={kpiFilter === 'REVISION'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'REVISION' ? null : 'REVISION');
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Accepted"
          value={accepted}
          icon={CheckCircle2}
          color="emerald"
          isActive={kpiFilter === 'ACCEPTED'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'ACCEPTED' ? null : 'ACCEPTED');
            setActiveTab('queue');
          }}
        />
        <StatCard
          title="Published OA"
          value={published}
          icon={BookOpen}
          color="blue"
          isActive={kpiFilter === 'PUBLISHED'}
          onClick={() => {
            setKpiFilter(kpiFilter === 'PUBLISHED' ? null : 'PUBLISHED');
            setActiveTab('queue');
          }}
        />
      </div>

      {/* Main Segmented Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-[#0d3b6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Submissions Queue</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {displayedManuscripts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('authors')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'authors'
              ? 'bg-[#0d3b6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Author Directory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviewersTable')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'reviewersTable'
              ? 'bg-[#0d3b6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Reviewer Relations Table</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviewers')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'reviewers'
              ? 'bg-[#0d3b6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Reviewers Directory</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'reviewers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {reviewers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-[#0d3b6e] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dual-Stage Review Record</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Submissions Queue */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Active Filter Indicator if clicked KPI Card */}
          {kpiFilter && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-semibold">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>
                  Filtering submissions queue by status: <strong>{kpiFilter.replace('_', ' ')}</strong> ({displayedManuscripts.length} matches)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setKpiFilter(null)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Editorial Spotlight Card */}
          {activePaper && !kpiFilter && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Primary Review Track: {activePaper.id}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Two-reviewer assignment and dual-stage evaluation status
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={activePaper.status} size="sm" />
                  <button
                    type="button"
                    onClick={() => navigate(`/editor/manuscript/${activePaper.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Decision Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                {/* Author Card (Left) */}
                <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
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
                    <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        "{activePaper.title}"
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Domain: {activePaper.domain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {activePaper.author?.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {activePaper.submissionDate}
                    </span>
                  </div>
                </div>

                {/* Editorial Double Reviewer Bridge (Center) */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-2 lg:py-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                    <ArrowRight className="w-4 h-4 hidden lg:block" />
                    <ArrowRight className="w-4 h-4 lg:hidden rotate-90" />
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider mt-1.5">
                    2 Reviewers
                  </span>
                </div>

                {/* Assigned Reviewers Card (Right) */}
                <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      <GraduationCap className="w-3 h-3" />
                      <span>Assigned Reviewers (2)</span>
                    </span>
                    {((activePaper.revisionCount ?? 0) >= 2 || (activePaper.revisedFiles?.length ?? 0) >= 2) ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Revisions Completed (2/2)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAssignModalTarget(activePaper)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        {activePaper.assignedReviewerName && activePaper.assignedReviewer2Name
                          ? 'Reassign Reviewers'
                          : 'Assign Reviewers'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 block">Reviewer 1</span>
                        <p className="font-bold text-slate-900">{activePaper.assignedReviewerName || 'Not assigned yet'}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">Primary</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-600 block">Reviewer 2</span>
                        <p className="font-bold text-slate-900">{activePaper.assignedReviewer2Name || 'Not assigned yet'}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">Secondary</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Deadline: {activePaper.reviewDeadline || '14 Days'}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(activePaper)}
                      className="text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      View Both Stages Feedback
                    </button>
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
                  Author submissions, dual reviewer assignments, and editorial workflow tracking
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Author Table */}
      {/* ========================================================================= */}
      {activeTab === 'authors' && <AuthorDirectoryTable />}

      {/* ========================================================================= */}
      {/* TAB 3: Reviewer Table */}
      {/* ========================================================================= */}
      {activeTab === 'reviewersTable' && <ReviewerDirectoryTable />}

      {/* ========================================================================= */}
      {/* TAB 4: Registered Reviewers Directory */}
      {/* ========================================================================= */}
      {activeTab === 'reviewers' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Users className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">Registered Reviewers Directory</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active peer reviewers registered in the journal portal. Review workload and specializations before dual assignment.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewerSearch}
                    onChange={(e) => setReviewerSearch(e.target.value)}
                    placeholder="Search reviewer, domain, institution..."
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedCredentials(null);
                    setIsCreateReviewerOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Reviewer</span>
                </button>
              </div>
            </div>

            {/* Reviewers Grid */}
            {filteredReviewers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No reviewers found matching your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviewers.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{rev.name}</h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rev.institution || 'Academic Institution'}</span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Active Expert
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 block">Subject Specialization:</span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{rev.domain}</p>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-indigo-700 text-[11px] truncate">{rev.email}</span>
                        </div>
                        {rev.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rev.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          {rev.activeAssignmentsCount || 0} active
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {rev.completedReviewsCount ?? rev.totalCompletedReviews ?? 0} completed
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingReviewer(rev)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title={`Edit details for ${rev.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingReviewer(rev)}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title={`Delete reviewer ${rev.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const candidate =
                              manuscripts.find((m) => m.status === 'Submitted' || m.status === 'Editor Assessment') ||
                              manuscripts[0];
                            if (candidate) setAssignModalTarget(candidate);
                          }}
                          className="px-2.5 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Two-Stage Review Feedback Record */}
      {/* ========================================================================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Two-Stage Review Feedback Management Desk
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Complete evaluation record of all feedback received from Reviewer 1 and Reviewer 2 across Stage 1 and Stage 2 cycles.
                </p>
              </div>

              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                Tracking {manuscripts.length} Papers
              </span>
            </div>

            {/* Feedback Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-y border-slate-200/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider select-none">
                    <th className="py-3 px-4">Paper ID &amp; Title</th>
                    <th className="py-3 px-4">Reviewer 1 (Stage 1 &amp; 2)</th>
                    <th className="py-3 px-4">Reviewer 2 (Stage 1 &amp; 2)</th>
                    <th className="py-3 px-4">Feedback Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manuscripts.map((m) => {
                    const mReviews = reviewsCache[m.id] || [];

                    const rev1Reviews = mReviews.filter(
                      (r) =>
                        (m.assignedReviewerId && r.reviewerId === m.assignedReviewerId) ||
                        (m.assignedReviewerName &&
                          r.reviewerName?.toLowerCase() === m.assignedReviewerName.toLowerCase())
                    );
                    const rev2Reviews = mReviews.filter(
                      (r) =>
                        (m.assignedReviewer2Id && r.reviewerId === m.assignedReviewer2Id) ||
                        (m.assignedReviewer2Name &&
                          r.reviewerName?.toLowerCase() === m.assignedReviewer2Name.toLowerCase())
                    );

                    const r1Stage1 = rev1Reviews.find((r) => r.stage === 1 || (!r.stage && rev1Reviews.length === 1));
                    const r1Stage2 = rev1Reviews.find((r) => r.stage === 2);
                    const r2Stage1 = rev2Reviews.find((r) => r.stage === 1 || (!r.stage && rev2Reviews.length === 1));
                    const r2Stage2 = rev2Reviews.find((r) => r.stage === 2);

                    const hasDual = Boolean(m.assignedReviewerName && m.assignedReviewer2Name);
                    const bothDone = Boolean(r1Stage1 && r2Stage1);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-mono font-bold text-indigo-700 block text-xs">{m.id}</span>
                          <p className="font-bold text-slate-900 line-clamp-1 mt-0.5">{m.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{m.domain}</p>
                        </td>

                        {/* Reviewer 1 Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {m.assignedReviewerName ? (
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{m.assignedReviewerName}</p>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold ${
                                    r1Stage1
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  S1: {r1Stage1 ? r1Stage1.recommendation : 'Pending'}
                                </span>
                                {r1Stage2 && (
                                  <span className="px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    S2: {r1Stage2.recommendation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>

                        {/* Reviewer 2 Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {m.assignedReviewer2Name ? (
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{m.assignedReviewer2Name}</p>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold ${
                                    r2Stage1
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  S1: {r2Stage1 ? r2Stage1.recommendation : 'Pending'}
                                </span>
                                {r2Stage2 && (
                                  <span className="px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    S2: {r2Stage2.recommendation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>

                        {/* Consolidated Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {hasDual ? (
                            bothDone ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Dual Feedback Complete</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Awaiting Feedback</span>
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Single / Unassigned
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDossier(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            <span>Inspect Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Create Reviewer Modal (Formik + Yup) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateReviewerOpen}
        onClose={() => {
          setCreatedCredentials(null);
          setIsCreateReviewerOpen(false);
          createReviewerFormik.resetForm();
        }}
        title="Enroll Peer Reviewer"
        subtitle="Create an expert profile in the system to enable double-blind manuscript assignments."
        size="md"
      >
        {createdCredentials ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Reviewer Enrolled Successfully!</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                The reviewer account has been verified. The expert can log into the Reviewer Portal using the credentials below:
              </p>

              <div className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-slate-800 space-y-1.5 shadow-2xs">
                <p>
                  <strong>Name:</strong> {createdCredentials.name}
                </p>
                <p>
                  <strong>Email:</strong> {createdCredentials.email}
                </p>
                <p>
                  <strong>Password:</strong>{' '}
                  <span className="font-bold text-indigo-700">{createdCredentials.password}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedCredentials(null);
                  setIsCreateReviewerOpen(false);
                  createReviewerFormik.resetForm();
                }}
                className="px-5 py-2.5 bg-[#0d3b6e] text-white font-bold rounded-xl cursor-pointer"
              >
                Close &amp; View in Directory
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={createReviewerFormik.handleSubmit} className="space-y-4 text-xs" noValidate>
            <div>
              <label htmlFor="revName" className="font-bold text-slate-700 block mb-1">
                Full Name *
              </label>
              <FormInput
                id="revName"
                name="name"
                type="text"
                placeholder="e.g. Dr. Harish Chandra"
                value={createReviewerFormik.values.name}
                onChange={createReviewerFormik.handleChange}
                onBlur={createReviewerFormik.handleBlur}
                error={createReviewerFormik.errors.name}
                touched={createReviewerFormik.touched.name}
              />
            </div>

            <div>
              <label htmlFor="revEmail" className="font-bold text-slate-700 block mb-1">
                Email Address *
              </label>
              <FormInput
                id="revEmail"
                name="email"
                type="email"
                placeholder="reviewer@university.edu"
                value={createReviewerFormik.values.email}
                onChange={createReviewerFormik.handleChange}
                onBlur={createReviewerFormik.handleBlur}
                error={createReviewerFormik.errors.email}
                touched={createReviewerFormik.touched.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="revInstitution" className="font-bold text-slate-700 block mb-1">
                  Institution *
                </label>
                <FormInput
                  id="revInstitution"
                  name="institution"
                  type="text"
                  placeholder="e.g. Indian Institute of Technology"
                  value={createReviewerFormik.values.institution}
                  onChange={createReviewerFormik.handleChange}
                  onBlur={createReviewerFormik.handleBlur}
                  error={createReviewerFormik.errors.institution}
                  touched={createReviewerFormik.touched.institution}
                />
              </div>

              <div>
                <label htmlFor="revPhone" className="font-bold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <FormInput
                  id="revPhone"
                  name="phone"
                  type="text"
                  placeholder="+91 9876543210"
                  value={createReviewerFormik.values.phone}
                  onChange={createReviewerFormik.handleChange}
                  onBlur={createReviewerFormik.handleBlur}
                  error={createReviewerFormik.errors.phone}
                  touched={createReviewerFormik.touched.phone}
                />
              </div>
            </div>

            <div>
              <label htmlFor="revDomain" className="font-bold text-slate-700 block mb-1">
                Subject Specialization Domain *
              </label>
              <FormInput
                id="revDomain"
                name="domain"
                type="text"
                placeholder="e.g. Computer Science, Machine Learning, Robotics"
                value={createReviewerFormik.values.domain}
                onChange={createReviewerFormik.handleChange}
                onBlur={createReviewerFormik.handleBlur}
                error={createReviewerFormik.errors.domain}
                touched={createReviewerFormik.touched.domain}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreateReviewerOpen(false);
                  createReviewerFormik.resetForm();
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createReviewerFormik.isSubmitting}
                className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
              >
                {createReviewerFormik.isSubmitting ? 'Registering...' : 'Register & Enroll Reviewer'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: Assign Two Reviewers Modal */}
      {/* ========================================================================= */}
      {assignModalTarget && (
        <AssignReviewerModal
          isOpen={!!assignModalTarget}
          onClose={() => setAssignModalTarget(null)}
          manuscriptTitle={assignModalTarget.title}
          manuscriptDomain={assignModalTarget.domain}
          onAssign={handleAssignConfirm}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Complete Feedback Dossier Modal */}
      {/* ========================================================================= */}
      {selectedManuscriptForDossier && (
        <Modal
          isOpen={!!selectedManuscriptForDossier}
          onClose={() => setSelectedManuscriptForDossier(null)}
          title={`Peer Review Feedback Dossier: ${selectedManuscriptForDossier.id}`}
          subtitle={`"${selectedManuscriptForDossier.title}" • Domain: ${selectedManuscriptForDossier.domain}`}
          size="lg"
        >
          {isDossierLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Fetching all feedback records from database...</span>
            </div>
          ) : (
            <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Corresponding Author</span>
                  <p className="font-bold text-slate-900">{selectedManuscriptForDossier.author?.name || 'Author'}</p>
                  <p className="text-slate-500 text-[11px]">{selectedManuscriptForDossier.author?.institution}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Editorial Status</span>
                  <StatusBadge status={selectedManuscriptForDossier.status} size="sm" />
                </div>
              </div>

              {/* Dual Review & Consolidated Status Banner */}
              {(() => {
                const hasRev1 = Boolean(
                  selectedManuscriptForDossier.assignedReviewerName || selectedManuscriptForDossier.assignedReviewerId
                );
                const hasRev2 = Boolean(
                  selectedManuscriptForDossier.assignedReviewer2Name || selectedManuscriptForDossier.assignedReviewer2Id
                );
                const dual = hasRev1 && hasRev2;

                const lastReq = [...(selectedManuscriptForDossier.history || [])]
                  .reverse()
                  .find((h) => h.status === 'Revision Requested');
                const hasSent = Boolean(
                  selectedManuscriptForDossier.revisionRequestComments ||
                    lastReq ||
                    selectedManuscriptForDossier.status === 'Revision Requested'
                );

                const r1Stage1 = dossierReviews.some(
                  (r) =>
                    (selectedManuscriptForDossier.assignedReviewerId &&
                      r.reviewerId === selectedManuscriptForDossier.assignedReviewerId) ||
                    (selectedManuscriptForDossier.assignedReviewerName &&
                      r.reviewerName?.toLowerCase() ===
                        selectedManuscriptForDossier.assignedReviewerName.toLowerCase())
                );
                const r2Stage1 = dossierReviews.some(
                  (r) =>
                    (selectedManuscriptForDossier.assignedReviewer2Id &&
                      r.reviewerId === selectedManuscriptForDossier.assignedReviewer2Id) ||
                    (selectedManuscriptForDossier.assignedReviewer2Name &&
                      r.reviewerName?.toLowerCase() ===
                        selectedManuscriptForDossier.assignedReviewer2Name.toLowerCase())
                );

                const r1NextDone = dossierReviews.some(
                  (r) =>
                    ((selectedManuscriptForDossier.assignedReviewerId &&
                      r.reviewerId === selectedManuscriptForDossier.assignedReviewerId) ||
                      (selectedManuscriptForDossier.assignedReviewerName &&
                        r.reviewerName?.toLowerCase() ===
                          selectedManuscriptForDossier.assignedReviewerName.toLowerCase())) &&
                    ((r.stage && r.stage >= 2) || (r as any).round >= 2)
                );
                const r2NextDone = dossierReviews.some(
                  (r) =>
                    ((selectedManuscriptForDossier.assignedReviewer2Id &&
                      r.reviewerId === selectedManuscriptForDossier.assignedReviewer2Id) ||
                      (selectedManuscriptForDossier.assignedReviewer2Name &&
                        r.reviewerName?.toLowerCase() ===
                          selectedManuscriptForDossier.assignedReviewer2Name.toLowerCase())) &&
                    ((r.stage && r.stage >= 2) || (r as any).round >= 2)
                );

                const readyToConsolidate = !hasSent ? r1Stage1 && r2Stage1 : r1NextDone && r2NextDone;

                if (dual && hasSent && !readyToConsolidate) {
                  return (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Consolidated Feedback Dispatched to Author</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Consolidated feedback has been dispatched to the author. Next cycle feedback will unlock when both reviewers submit their new evaluations (Stage 2 / Round 2). Current progress: {r1NextDone && r2NextDone ? '2 of 2' : r1NextDone || r2NextDone ? '1 of 2' : '0 of 2'} submitted.
                      </p>
                    </div>
                  );
                }

                if (dual && readyToConsolidate) {
                  return (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Both Reviewers' Feedback Submitted (2/2) — Ready to Merge &amp; Consolidate</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedManuscriptForDossier(null);
                          navigate(`/editor/manuscript/${selectedManuscriptForDossier.id}`);
                        }}
                        className="px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>Merge &amp; Send to Author</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                if (dual && (!r1Stage1 || !r2Stage1)) {
                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Awaiting Second Reviewer Feedback ({r1Stage1 || r2Stage1 ? '1 of 2 submitted' : '0 of 2 submitted'})
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Under journal workflow protocol, the Editor must not send consolidated feedback to the Author until both Reviewer 1 and Reviewer 2 have submitted their feedback. You must wait for Reviewer {r1Stage1 ? '2' : '1'} before dispatching consolidated feedback.
                      </p>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Reviewer 1 Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold border-b border-indigo-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Reviewer 1 Feedback (Primary Reviewer):</span>
                  <span className="text-slate-700 font-medium">
                    {selectedManuscriptForDossier.assignedReviewerName || 'Not Assigned'}
                  </span>
                </div>

                {(() => {
                  const rev1Reports = dossierReviews.filter(
                    (r) =>
                      (selectedManuscriptForDossier.assignedReviewerId &&
                        r.reviewerId === selectedManuscriptForDossier.assignedReviewerId) ||
                      (selectedManuscriptForDossier.assignedReviewerName &&
                        r.reviewerName?.toLowerCase() ===
                          selectedManuscriptForDossier.assignedReviewerName.toLowerCase())
                  );
                  const stage1 = rev1Reports.find((r) => r.stage === 1 || (!r.stage && rev1Reports.length === 1));
                  const stage2 = rev1Reports.find((r) => r.stage === 2);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Reviewer 1 - Stage 1 */}
                      <div className="p-4 bg-white border border-blue-200 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                          <span className="font-bold text-blue-900 text-xs">Stage 1: Initial Assessment</span>
                          {stage1 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              {stage1.recommendation}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Awaiting
                            </span>
                          )}
                        </div>

                        {stage1 ? (
                          <div className="space-y-2 text-[11px]">
                            <div className="grid grid-cols-4 gap-1.5 text-center">
                              <div className="p-1 bg-indigo-50 rounded border border-indigo-100">
                                <span className="text-[9px] text-indigo-500 font-bold block">Overall</span>
                                <strong className="text-indigo-900 font-bold">
                                  {stage1.overallScore
                                    ? stage1.overallScore.toFixed(1)
                                    : stage1.rubricScores && stage1.rubricScores.length > 0
                                    ? (
                                        stage1.rubricScores.reduce((a, b) => a + b, 0) /
                                        stage1.rubricScores.length
                                      ).toFixed(1)
                                    : '—'}
                                  /5
                                </strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Technical</span>
                                <strong className="text-indigo-700">{stage1.technicalQuality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Originality</span>
                                <strong className="text-indigo-700">{stage1.originality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Clarity</span>
                                <strong className="text-indigo-700">{stage1.clarity}/5</strong>
                              </div>
                            </div>

                            {stage1.rubricScores && stage1.rubricScores.length > 0 && (
                              <details className="group/rubric p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <summary className="font-bold text-slate-700 text-[10px] cursor-pointer flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-indigo-600" />
                                    <span>11-Point Rubric Scorecard ({stage1.rubricScores.length} Criteria)</span>
                                  </span>
                                  <span className="text-indigo-600 text-[9px] group-open/rubric:hidden">View &darr;</span>
                                  <span className="text-indigo-600 text-[9px] hidden group-open/rubric:inline">Hide &uarr;</span>
                                </summary>
                                <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-200/80">
                                  {stage1.rubricScores.map((score, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex items-center justify-between text-[10px] text-slate-600 py-0.5"
                                    >
                                      <span className="truncate pr-2 font-medium">
                                        {sIdx + 1}. {SRMU_CRITERIA[sIdx] || `Criterion ${sIdx + 1}`}
                                      </span>
                                      <span className="font-bold font-mono text-slate-900 shrink-0">
                                        {score}/5
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            <div>
                              <strong className="text-slate-700 block">Comments for Author:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage1.commentsForAuthor}
                              </p>
                            </div>
                            <div>
                              <strong className="text-slate-700 block">Notes for Editor:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage1.commentsForEditor}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4 italic">No Stage 1 evaluation submitted yet.</p>
                        )}
                      </div>

                      {/* Reviewer 1 - Stage 2 */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 text-xs">Stage 2: Re-evaluation</span>
                          {stage2 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              {stage2.recommendation}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Awaiting
                            </span>
                          )}
                        </div>

                        {stage2 ? (
                          <div className="space-y-2 text-[11px]">
                            <div className="grid grid-cols-3 gap-1.5 text-center">
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Technical</span>
                                <strong className="text-slate-900">{stage2.technicalQuality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Originality</span>
                                <strong className="text-slate-900">{stage2.originality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Clarity</span>
                                <strong className="text-slate-900">{stage2.clarity}/5</strong>
                              </div>
                            </div>
                            <div>
                              <strong className="text-slate-700 block">Stage 2 Comments:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage2.commentsForAuthor}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4 italic">No Stage 2 evaluation submitted yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Reviewer 2 Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-purple-900 font-bold border-b border-purple-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Reviewer 2 Feedback (Secondary Reviewer):</span>
                  <span className="text-slate-700 font-medium">
                    {selectedManuscriptForDossier.assignedReviewer2Name || 'Not Assigned'}
                  </span>
                </div>

                {(() => {
                  const rev2Reports = dossierReviews.filter(
                    (r) =>
                      (selectedManuscriptForDossier.assignedReviewer2Id &&
                        r.reviewerId === selectedManuscriptForDossier.assignedReviewer2Id) ||
                      (selectedManuscriptForDossier.assignedReviewer2Name &&
                        r.reviewerName?.toLowerCase() ===
                          selectedManuscriptForDossier.assignedReviewer2Name.toLowerCase())
                  );
                  const stage1 = rev2Reports.find((r) => r.stage === 1 || (!r.stage && rev2Reports.length === 1));
                  const stage2 = rev2Reports.find((r) => r.stage === 2);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Reviewer 2 - Stage 1 */}
                      <div className="p-4 bg-white border border-purple-200 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                          <span className="font-bold text-purple-900 text-xs">Stage 1: Initial Assessment</span>
                          {stage1 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              {stage1.recommendation}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Awaiting
                            </span>
                          )}
                        </div>

                        {stage1 ? (
                          <div className="space-y-2 text-[11px]">
                            <div className="grid grid-cols-4 gap-1.5 text-center">
                              <div className="p-1 bg-purple-50 rounded border border-purple-100">
                                <span className="text-[9px] text-purple-500 font-bold block">Overall</span>
                                <strong className="text-purple-900 font-bold">
                                  {stage1.overallScore
                                    ? stage1.overallScore.toFixed(1)
                                    : stage1.rubricScores && stage1.rubricScores.length > 0
                                    ? (
                                        stage1.rubricScores.reduce((a, b) => a + b, 0) /
                                        stage1.rubricScores.length
                                      ).toFixed(1)
                                    : '—'}
                                  /5
                                </strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Technical</span>
                                <strong className="text-purple-700">{stage1.technicalQuality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Originality</span>
                                <strong className="text-purple-700">{stage1.originality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Clarity</span>
                                <strong className="text-purple-700">{stage1.clarity}/5</strong>
                              </div>
                            </div>

                            {stage1.rubricScores && stage1.rubricScores.length > 0 && (
                              <details className="group/rubric p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <summary className="font-bold text-slate-700 text-[10px] cursor-pointer flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-purple-600" />
                                    <span>11-Point Rubric Scorecard ({stage1.rubricScores.length} Criteria)</span>
                                  </span>
                                  <span className="text-purple-600 text-[9px] group-open/rubric:hidden">View &darr;</span>
                                  <span className="text-purple-600 text-[9px] hidden group-open/rubric:inline">Hide &uarr;</span>
                                </summary>
                                <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-200/80">
                                  {stage1.rubricScores.map((score, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex items-center justify-between text-[10px] text-slate-600 py-0.5"
                                    >
                                      <span className="truncate pr-2 font-medium">
                                        {sIdx + 1}. {SRMU_CRITERIA[sIdx] || `Criterion ${sIdx + 1}`}
                                      </span>
                                      <span className="font-bold font-mono text-slate-900 shrink-0">
                                        {score}/5
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            <div>
                              <strong className="text-slate-700 block">Comments for Author:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage1.commentsForAuthor}
                              </p>
                            </div>
                            <div>
                              <strong className="text-slate-700 block">Notes for Editor:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage1.commentsForEditor}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4 italic">No Stage 1 evaluation submitted yet.</p>
                        )}
                      </div>

                      {/* Reviewer 2 - Stage 2 */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 text-xs">Stage 2: Re-evaluation</span>
                          {stage2 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              {stage2.recommendation}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Awaiting
                            </span>
                          )}
                        </div>

                        {stage2 ? (
                          <div className="space-y-2 text-[11px]">
                            <div className="grid grid-cols-3 gap-1.5 text-center">
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Technical</span>
                                <strong className="text-slate-900">{stage2.technicalQuality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Originality</span>
                                <strong className="text-slate-900">{stage2.originality}/5</strong>
                              </div>
                              <div className="p-1 bg-slate-50 rounded">
                                <span className="text-[9px] text-slate-400 block">Clarity</span>
                                <strong className="text-slate-900">{stage2.clarity}/5</strong>
                              </div>
                            </div>
                            <div>
                              <strong className="text-slate-700 block">Stage 2 Comments:</strong>
                              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mt-0.5">
                                {stage2.commentsForAuthor}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4 italic">No Stage 2 evaluation submitted yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedManuscriptForDossier(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Close Feedback Dossier
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Edit Reviewer Modal */}
      {editingReviewer && (
        <EditReviewerModal
          isOpen={!!editingReviewer}
          onClose={() => setEditingReviewer(null)}
          reviewer={editingReviewer}
          onSuccess={() => {
            dispatch(fetchReviewers());
            setEditingReviewer(null);
          }}
        />
      )}

      {/* Delete Reviewer Modal */}
      {deletingReviewer && (
        <DeleteReviewerModal
          isOpen={!!deletingReviewer}
          onClose={() => setDeletingReviewer(null)}
          reviewer={deletingReviewer}
          onSuccess={() => {
            dispatch(fetchReviewers());
            setDeletingReviewer(null);
          }}
        />
      )}
    </div>
  );
};
