import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorsTable } from '../../features/manuscripts/manuscriptThunk';
import { AuthorTableItem } from '../../types/manuscript.types';
import { StatusBadge } from '../common/StatusBadge';
import {
  User,
  Search,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Building,
  Mail,
  MapPin,
  RefreshCw,
  Award,
} from 'lucide-react';

export const AuthorDirectoryTable: React.FC = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<AuthorTableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAuthorId, setExpandedAuthorId] = useState<string | null>(null);

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const data = await getAuthorsTable();
      setAuthors(data || []);
      if (data && data.length > 0 && !expandedAuthorId) {
        setExpandedAuthorId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch author table data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedAuthorId((prev) => (prev === id ? null : id));
  };

  const filteredAuthors = authors.filter((a) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const matchesAuthor =
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.institution && a.institution.toLowerCase().includes(q)) ||
      (a.cityCountry && a.cityCountry.toLowerCase().includes(q));
    const matchesPaper = a.papers?.some(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.reviewer1?.name.toLowerCase().includes(q) ||
        p.reviewer2?.name.toLowerCase().includes(q)
    );
    return matchesAuthor || matchesPaper;
  });

  const totalPapersCount = authors.reduce((acc, a) => acc + (a.papers?.length || 0), 0);
  const dualReviewerPapersCount = authors.reduce(
    (acc, a) =>
      acc + (a.papers?.filter((p) => p.reviewer1 && p.reviewer2)?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{authors.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Authors
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalPapersCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submitted Papers
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{dualReviewerPapersCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Papers with Dual Reviewers
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {authors.length > 0 ? (totalPapersCount / authors.length).toFixed(1) : '0'}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Papers / Author
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search author, email, paper ID, or reviewer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20 focus:border-[#0d3b6e] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredAuthors.length} authors
          </span>
          <button
            type="button"
            onClick={fetchAuthors}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Author Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#0d3b6e] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading Author Schema Records...</p>
        </div>
      ) : filteredAuthors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No author records found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAuthors.map((author) => {
            const isExpanded = expandedAuthorId === author.id;
            return (
              <div
                key={author.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Author Summary Header Row */}
                <div
                  onClick={() => toggleExpand(author.id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0d3b6e] to-indigo-800 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{author.name}</h3>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {author.id}
                        </span>
                        {author.orcid && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            ORCID: {author.orcid}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{author.email}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{author.institution}</span>
                        </span>
                        {author.cityCountry && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{author.cityCountry}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{author.papers?.length || 0} Papers Submitted</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="text-xs font-semibold text-slate-500">
                        {isExpanded ? 'Hide Paper Details' : 'View Papers & Reviewers'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Papers with Dual Reviewers */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0d3b6e]" />
                        <span>Submitted Manuscripts & Assigned Dual Reviewers</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Requirement: Each paper assigned to exactly 2 reviewers
                      </span>
                    </div>

                    {(!author.papers || author.papers.length === 0) ? (
                      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                        No manuscripts registered for this author yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {author.papers.map((paper) => {
                          const hasReviewer1 = !!paper.reviewer1;
                          const hasReviewer2 = !!paper.reviewer2;
                          const hasBothReviewers = hasReviewer1 && hasReviewer2;

                          return (
                            <div
                              key={paper.id}
                              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                            >
                              {/* Paper Title Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#0d3b6e]">
                                      {paper.id}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                      {paper.domain}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Submitted: {paper.submissionDate}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                                    {paper.title}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <StatusBadge status={paper.status as any} size="sm" />
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/editor/manuscript/${paper.id}`)}
                                    className="p-1.5 text-slate-500 hover:text-[#0d3b6e] hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Open Manuscript Decision Desk"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Two Reviewers Grid */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Assigned Reviewers (Exactly Two Required)</span>
                                  </span>

                                  {hasBothReviewers ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Two Reviewers Assigned</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Pending Reviewer Assignment</span>
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Reviewer 1 Box */}
                                  <div
                                    className={`p-3 rounded-xl border text-xs ${
                                      hasReviewer1
                                        ? 'bg-slate-50/80 border-slate-200'
                                        : 'bg-amber-50/40 border-dashed border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                        Reviewer 1
                                      </span>
                                      {hasReviewer1 && (
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                              paper.reviewer1?.stage1Submitted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                          >
                                            Stage 1: {paper.reviewer1?.stage1Submitted ? '✓' : 'Pending'}
                                          </span>
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                              paper.reviewer1?.stage2Submitted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                          >
                                            Stage 2: {paper.reviewer1?.stage2Submitted ? '✓' : 'Pending'}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {hasReviewer1 ? (
                                      <div>
                                        <div className="font-bold text-slate-800">
                                          {paper.reviewer1?.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                          {paper.reviewer1?.email}
                                        </div>
                                        {paper.reviewer1?.institution && (
                                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                            {paper.reviewer1?.institution}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-slate-400 italic text-[11px] py-1">
                                        No Reviewer 1 assigned yet
                                      </div>
                                    )}
                                  </div>

                                  {/* Reviewer 2 Box */}
                                  <div
                                    className={`p-3 rounded-xl border text-xs ${
                                      hasReviewer2
                                        ? 'bg-slate-50/80 border-slate-200'
                                        : 'bg-amber-50/40 border-dashed border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="font-bold text-[10px] uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                        Reviewer 2
                                      </span>
                                      {hasReviewer2 && (
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                              paper.reviewer2?.stage1Submitted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                          >
                                            Stage 1: {paper.reviewer2?.stage1Submitted ? '✓' : 'Pending'}
                                          </span>
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                              paper.reviewer2?.stage2Submitted
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                          >
                                            Stage 2: {paper.reviewer2?.stage2Submitted ? '✓' : 'Pending'}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {hasReviewer2 ? (
                                      <div>
                                        <div className="font-bold text-slate-800">
                                          {paper.reviewer2?.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium">
                                          {paper.reviewer2?.email}
                                        </div>
                                        {paper.reviewer2?.institution && (
                                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                            {paper.reviewer2?.institution}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-slate-400 italic text-[11px] py-1">
                                        No Reviewer 2 assigned yet
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
