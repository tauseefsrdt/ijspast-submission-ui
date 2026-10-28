import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Manuscript } from '../../types/manuscript.types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  ArrowRight,
  X,
  FileText,
  Users,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface ManuscriptTableProps {
  manuscripts: Manuscript[];
  currentRole: 'author' | 'editor' | 'reviewer';
  onSelectManuscript?: (manuscript: Manuscript) => void;
  showReviewerColumn?: boolean;
}

export const ManuscriptTable: React.FC<ManuscriptTableProps> = ({
  manuscripts,
  currentRole,
  onSelectManuscript,
  showReviewerColumn = false,
}) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic
  const filtered = useMemo(() => {
    return manuscripts.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = m.id.toLowerCase().includes(q);
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchAuthor = m.author?.name ? m.author.name.toLowerCase().includes(q) : false;
        const matchDomain = m.domain.toLowerCase().includes(q);
        const matchRev1 = m.assignedReviewerName ? m.assignedReviewerName.toLowerCase().includes(q) : false;
        const matchRev2 = m.assignedReviewer2Name ? m.assignedReviewer2Name.toLowerCase().includes(q) : false;
        return matchId || matchTitle || matchAuthor || matchDomain || matchRev1 || matchRev2;
      }
      return true;
    });
  }, [manuscripts, statusFilter, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleRowClick = (m: Manuscript) => {
    if (onSelectManuscript) {
      onSelectManuscript(m);
    } else {
      if (currentRole === 'author') navigate(`/author/manuscript/${m.id}`);
      else if (currentRole === 'editor') navigate(`/editor/manuscript/${m.id}`);
      else if (currentRole === 'reviewer') navigate(`/reviewer/manuscript/${m.id}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition-all">
      {/* Search, Filter & Status Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/40">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ID, title, author, or domain..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 focus:border-[#0d3b6e] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 shadow-2xs"
          >
            <option value="ALL">All Statuses ({manuscripts.length})</option>
            <option value="Submitted">Submitted</option>
            <option value="Editor Assessment">Editor Assessment</option>
            <option value="Under Review">Under Review</option>
            <option value="Review Completed">Review Completed</option>
            <option value="Revision Requested">Revision Requested</option>
            <option value="Revision Submitted">Revision Submitted</option>
            <option value="Accepted">Accepted</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No manuscripts match your query"
            description="Try clearing your search query or choosing another status filter to display submissions."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071526] border-b border-slate-800 text-slate-300 font-bold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3.5 px-4 sm:px-6">Manuscript ID</th>
                <th className="py-3.5 px-4">Title &amp; Subject Domain</th>
                {currentRole === 'editor' && (
                  <th className="py-3.5 px-4">Corresponding Author</th>
                )}
                {showReviewerColumn && <th className="py-3.5 px-4">Assigned Peer Reviewers</th>}
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((m) => {
                const hasRev1 = Boolean(m.assignedReviewerName);
                const hasRev2 = Boolean(m.assignedReviewer2Name);

                return (
                  <tr
                    key={m.id}
                    onClick={() => handleRowClick(m)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      <span className="group-hover:underline underline-offset-2">
                        {m.id}
                      </span>
                    </td>

                    {/* Title & Domain */}
                    <td className="py-4 px-4 max-w-xs md:max-w-md">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 line-clamp-1 transition-colors leading-snug">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {m.domain}
                      </p>
                    </td>

                    {/* Author (visible only to Editor - masked for Reviewer) */}
                    {currentRole === 'editor' && (
                      <td className="py-4 px-4 whitespace-nowrap max-w-xs">
                        <p className="font-bold text-slate-800 leading-tight">
                          {m.author?.name || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {m.author?.institution || 'Academic Institution'}
                        </p>
                      </td>
                    )}

                    {/* Reviewers Column (Dual-Reviewer Matrix) */}
                    {showReviewerColumn && (
                      <td className="py-4 px-4 whitespace-nowrap">
                        {hasRev1 || hasRev2 ? (
                          <div className="space-y-1 text-[11px]">
                            {m.feedbackProgress && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                m.feedbackReadyCount === 2
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : m.feedbackReadyCount === 1
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}>
                                {m.feedbackProgress}
                              </span>
                            )}
                            {hasRev1 && (
                              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.reviewer1Status === 'Overdue' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <span className="truncate max-w-[130px]">{m.assignedReviewerName}</span>
                                {m.reviewer1Status === 'Overdue' && (
                                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                                    Overdue
                                  </span>
                                )}
                              </div>
                            )}
                            {hasRev2 && (
                              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.reviewer2Status === 'Overdue' ? 'bg-red-500' : 'bg-purple-500'}`} />
                                <span className="truncate max-w-[130px]">{m.assignedReviewer2Name}</span>
                                {m.reviewer2Status === 'Overdue' && (
                                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                                    Overdue
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                    )}

                    {/* Submission Date */}
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-[11px] font-mono">
                      {m.submissionDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={m.status} size="sm" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(m);
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 rounded-xl transition-all cursor-pointer shadow-xs group-hover:shadow-md"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filtered.length > itemsPerPage && (
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-medium text-slate-500 text-[11px]">
            Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of{' '}
            <strong className="text-slate-800">{filtered.length}</strong> submissions
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs transition-colors flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1 font-bold text-slate-800 text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs transition-colors flex items-center gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
