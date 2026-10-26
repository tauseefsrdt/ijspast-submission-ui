import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviewersTable } from '../../features/manuscripts/manuscriptThunk';
import { ReviewerTableItem } from '../../types/manuscript.types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Search,
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Building,
  Mail,
  RefreshCw,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  Link2,
} from 'lucide-react';

export const ReviewerDirectoryTable: React.FC = () => {
  const navigate = useNavigate();
  const [reviewers, setReviewers] = useState<ReviewerTableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [expandedReviewerId, setExpandedReviewerId] = useState<string | null>(null);

  const fetchReviewersData = async () => {
    setIsLoading(true);
    try {
      const data = await getReviewersTable();
      setReviewers(data || []);
      if (data && data.length > 0 && !expandedReviewerId) {
        setExpandedReviewerId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch reviewer table data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewersData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedReviewerId((prev) => (prev === id ? null : id));
  };

  const domains = ['All', ...Array.from(new Set(reviewers.map((r) => r.domain).filter(Boolean)))];

  const filteredReviewers = reviewers.filter((r) => {
    const matchesDomain = domainFilter === 'All' || r.domain === domainFilter;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesDomain;

    const matchesReviewer =
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.institution && r.institution.toLowerCase().includes(q)) ||
      (r.domain && r.domain.toLowerCase().includes(q));

    const matchesPapersOrAuthors = r.assignedPapers?.some(
      (p) =>
        p.paperId.toLowerCase().includes(q) ||
        p.paperTitle.toLowerCase().includes(q) ||
        (p.author?.name && p.author.name.toLowerCase().includes(q)) ||
        (p.author?.email && p.author.email.toLowerCase().includes(q))
    );

    return matchesDomain && (matchesReviewer || matchesPapersOrAuthors);
  });

  const totalAssignments = reviewers.reduce((acc, r) => acc + (r.assignedPapers?.length || 0), 0);
  const totalActive = reviewers.reduce((acc, r) => acc + r.activeAssignmentsCount, 0);
  const totalCompleted = reviewers.reduce((acc, r) => acc + r.completedReviewsCount, 0);

  // Distinct authors handled across all reviewers
  const distinctAuthors = new Set(
    reviewers.flatMap((r) => r.assignedPapers?.map((p) => p.author?.email).filter(Boolean) || [])
  ).size;

  return (
    <div className="space-y-6">
      {/* Relationship Architecture Callout */}
      <div className="bg-gradient-to-r from-[#0d3b6e] via-[#1a4f8b] to-indigo-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-md">
              <Link2 className="w-4 h-4 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Database Relationship Architecture
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            1 Reviewer ➔ Multiple Authors &nbsp;|&nbsp; 1 Paper ➔ Exactly 2 Assigned Reviewers
          </h2>
          <p className="text-xs text-blue-100 font-medium">
            Strict relational foreign keys: Each paper requires exactly two designated reviewers, and reviewers independently evaluate authors across multiple paper submissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-center">
            <div className="text-lg font-bold text-white">{distinctAuthors}</div>
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
              Authors Handled
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-center">
            <div className="text-lg font-bold text-white">{reviewers.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">
              Reviewers
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{reviewers.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Reviewers
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalAssignments}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Paper Assignments
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalActive}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Reviews
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalCompleted}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer, author, domain, paper..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 focus:border-[#0d3b6e] transition-all"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full sm:w-56 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Domains' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredReviewers.length} reviewers
          </span>
          <button
            type="button"
            onClick={fetchReviewersData}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Reviewer Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#0d3b6e] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading Reviewer Schema Records...</p>
        </div>
      ) : filteredReviewers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No reviewer records found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviewers.map((reviewer) => {
            const isExpanded = expandedReviewerId === reviewer.id;
            const authorCount = new Set(
              reviewer.assignedPapers?.map((p) => p.author?.email).filter(Boolean) || []
            ).size;

            return (
              <div
                key={reviewer.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Reviewer Header Row */}
                <div
                  onClick={() => toggleExpand(reviewer.id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-800 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                      {reviewer.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{reviewer.name}</h3>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {reviewer.id}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {reviewer.domain}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{reviewer.email}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{reviewer.institution}</span>
                        </span>
                        {reviewer.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{reviewer.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 flex-wrap">
                    {/* Multi-author badge */}
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{authorCount} Authors Handled</span>
                    </span>

                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{reviewer.assignedPapers?.length || 0} Papers</span>
                    </span>

                    <div className="flex items-center gap-1 text-slate-400 ml-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {isExpanded ? 'Hide Assigned Papers' : 'View Assigned Papers'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Papers & Authors Handled */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-700" />
                        <span>Assigned Papers, Handled Authors & Co-Reviewers</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Demonstrating 1 Reviewer ➔ Multiple Authors Relationship
                      </span>
                    </div>

                    {(!reviewer.assignedPapers || reviewer.assignedPapers.length === 0) ? (
                      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                        No manuscripts currently assigned to this reviewer.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviewer.assignedPapers.map((assignment) => (
                          <div
                            key={assignment.paperId}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                          >
                            {/* Paper Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold text-[#0d3b6e]">
                                    {assignment.paperId}
                                  </span>
                                  <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Role: {assignment.assignedRole}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {assignment.domain}
                                  </span>
                                  {assignment.reviewDeadline && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      Deadline: {assignment.reviewDeadline}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                                  {assignment.paperTitle}
                                </h5>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={assignment.status as any} size="sm" />
                                <button
                                  type="button"
                                  onClick={() => navigate(`/editor/manuscript/${assignment.paperId}`)}
                                  className="p-1.5 text-slate-500 hover:text-[#0d3b6e] hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Open Manuscript Decision Desk"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Author & Co-Reviewer Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Assigned Author Card */}
                              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                    Assigned Author
                                  </span>
                                  {assignment.author?.orcid && (
                                    <span className="text-[10px] text-emerald-700 font-mono">
                                      {assignment.author.orcid}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-slate-900 mt-1">
                                  {assignment.author?.name || 'Author'}
                                </div>
                                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{assignment.author?.email}</span>
                                </div>
                                {assignment.author?.institution && (
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 line-clamp-1">
                                    <Building className="w-3 h-3 text-slate-400" />
                                    <span>{assignment.author.institution}</span>
                                  </div>
                                )}
                              </div>

                              {/* Co-Reviewer (2nd Assigned Reviewer) Card */}
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[10px] uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                    Co-Reviewer (Dual Reviewer)
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                        assignment.stage1Completed
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-slate-100 text-slate-500 border-slate-200'
                                      }`}
                                    >
                                      Stage 1: {assignment.stage1Completed ? '✓ Done' : 'Pending'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                        assignment.stage2Completed
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-slate-100 text-slate-500 border-slate-200'
                                      }`}
                                    >
                                      Stage 2: {assignment.stage2Completed ? '✓ Done' : 'Pending'}
                                    </span>
                                  </div>
                                </div>

                                {assignment.coReviewer ? (
                                  <div>
                                    <div className="font-bold text-slate-900 mt-1">
                                      {assignment.coReviewer.name}
                                    </div>
                                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                      <Mail className="w-3 h-3 text-slate-400" />
                                      <span>{assignment.coReviewer.email}</span>
                                    </div>
                                    {assignment.coReviewer.institution && (
                                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 line-clamp-1">
                                        <Building className="w-3 h-3 text-slate-400" />
                                        <span>{assignment.coReviewer.institution}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 italic text-[11px] py-1">
                                    Pending 2nd Co-Reviewer assignment
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
