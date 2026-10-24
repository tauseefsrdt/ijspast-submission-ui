import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Manuscript, ManuscriptStatus } from '../../types/manuscript.types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  ChevronRight,
  ArrowUpDown,
  Download,
  Calendar,
  User,
  Clock,
  Eye,
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

  // Filter
  const filtered = useMemo(() => {
    return manuscripts.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = m.id.toLowerCase().includes(q);
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchAuthor = m.author.name.toLowerCase().includes(q);
        const matchDomain = m.domain.toLowerCase().includes(q);
        return matchId || matchTitle || matchAuthor || matchDomain;
      }
      return true;
    });
  }, [manuscripts, statusFilter, searchQuery]);

  // Pagination
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
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search manuscripts by ID, title, author, or domain..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
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
        <EmptyState
          title="No manuscripts match your query"
          description="Try clearing your search query or choosing another status filter."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Manuscript ID</th>
                <th className="py-3 px-4">Title &amp; Subject Domain</th>
                {currentRole === 'editor' && (
                  <th className="py-3 px-4">Corresponding Author</th>
                )}
                {showReviewerColumn && <th className="py-3 px-4">Assigned Reviewer</th>}
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => handleRowClick(m)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    <span className="group-hover:underline underline-offset-2">
                      {m.id}
                    </span>
                  </td>

                  {/* Title & Domain */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {m.domain}
                    </p>
                  </td>

                  {/* Author (visible only to Editor - strictly masked for Reviewer) */}
                  {currentRole === 'editor' && (
                    <td className="py-3.5 px-4 whitespace-nowrap max-w-xs">
                      <p className="font-semibold text-slate-800">{m.author?.name || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.author?.institution || ''}</p>
                    </td>
                  )}

                  {/* Reviewer */}
                  {showReviewerColumn && (
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {m.assignedReviewerName ? (
                        <span className="font-medium text-slate-700">
                          {m.assignedReviewerName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Submission Date */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {m.submissionDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={m.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(m);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filtered.length > itemsPerPage && (
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
