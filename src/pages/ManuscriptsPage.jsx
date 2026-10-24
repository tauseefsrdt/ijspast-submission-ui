import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Send,
  CreditCard,
  BookOpen,
  AlertCircle,
  Clock,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Tabs } from '../components/common/Tabs';
import { StatusBadge } from '../components/common/StatusBadge';
import { TimeTag } from '../components/common/TimeTag';
import { OrcidBadge } from '../components/common/OrcidBadge';
import { EmptyState } from '../components/common/EmptyState';
import { DOMAINS, STATUS_OWNERS, BASE_DATE, getDateString } from '../constants/initialData';

export function ManuscriptsPage() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'all';
  const journalParam = searchParams.get('journal') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(journalParam);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [activeTab, setActiveTab] = useState(tabParam);
  const [sortField, setSortField] = useState('date'); // 'date' | 'id' | 'title'
  const [sortAsc, setSortAsc] = useState(false);

  const papers = data?.papers || [];
  const currentDay = data?.day || 0;
  const currentRole = data?.session?.role || 'admin';
  const currentWho = data?.session?.who || '';

  // Tab definitions with counts
  const tabs = [
    { id: 'all', label: 'All Manuscripts', count: papers.length },
    {
      id: 'screening',
      label: 'Under Screening',
      count: papers.filter((p) => p.status === 'Under Screening').length,
    },
    {
      id: 'review',
      label: 'In Peer Review',
      count: papers.filter(
        (p) =>
          p.status === 'Sent to Reviewers' ||
          p.status === 'Re-review' ||
          p.status === 'Review Received' ||
          p.status === 'Reviews Complete'
      ).length,
    },
    {
      id: 'revisions',
      label: 'Author Revisions',
      count: papers.filter(
        (p) => p.status === 'Comments Sent' || p.status === 'Revision Received' || p.status === 'Pushed Back'
      ).length,
    },
    {
      id: 'proofing',
      label: 'Camera-Ready & Proofing',
      count: papers.filter(
        (p) =>
          p.status === 'Accepted' ||
          p.status === 'Camera-Ready Received' ||
          p.status === 'Proofreading' ||
          p.status === 'Changes Requested'
      ).length,
    },
    {
      id: 'payment',
      label: 'APC Billing',
      count: papers.filter((p) => p.status === 'Payment Pending' || p.status === 'Paid').length,
    },
    {
      id: 'published',
      label: 'Published',
      count: papers.filter((p) => p.status === 'Published').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: papers.filter((p) => p.status === 'Rejected').length,
    },
  ];

  // Filtering
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Role scope filter (if editor is logged in and restricted)
      if (currentRole === 'editor' && currentWho && paper.journal !== currentWho) {
        return false;
      }
      if (currentRole === 'author' && currentWho && paper.author.email !== currentWho) {
        return false;
      }
      if (currentRole === 'reviewer' && currentWho && !paper.reviewers.includes(currentWho)) {
        return false;
      }

      // Journal filter
      if (selectedJournal !== 'ALL' && paper.journal !== selectedJournal) {
        return false;
      }

      // Domain filter
      if (selectedDomain !== 'ALL' && paper.domain !== selectedDomain) {
        return false;
      }

      // Tab filter
      if (activeTab === 'screening' && paper.status !== 'Under Screening') return false;
      if (
        activeTab === 'review' &&
        !['Sent to Reviewers', 'Re-review', 'Review Received', 'Reviews Complete'].includes(paper.status)
      )
        return false;
      if (
        activeTab === 'revisions' &&
        !['Comments Sent', 'Revision Received', 'Pushed Back'].includes(paper.status)
      )
        return false;
      if (
        activeTab === 'proofing' &&
        !['Accepted', 'Camera-Ready Received', 'Proofreading', 'Changes Requested'].includes(paper.status)
      )
        return false;
      if (activeTab === 'payment' && !['Payment Pending', 'Paid'].includes(paper.status)) return false;
      if (activeTab === 'published' && paper.status !== 'Published') return false;
      if (activeTab === 'rejected' && paper.status !== 'Rejected') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = paper.id.toLowerCase().includes(query);
        const matchTitle = paper.title.toLowerCase().includes(query);
        const matchAuthor = paper.author.name.toLowerCase().includes(query);
        const matchEmail = paper.author.email.toLowerCase().includes(query);
        const matchKeywords = (paper.keywords || '').toLowerCase().includes(query);
        return matchId || matchTitle || matchAuthor || matchEmail || matchKeywords;
      }

      return true;
    });
  }, [papers, selectedJournal, selectedDomain, activeTab, searchQuery, currentRole, currentWho]);

  // Sorting
  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        // Date / Day
        comparison = (a.day0 || 0) - (b.day0 || 0);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredPapers, sortField, sortAsc]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId, journal: selectedJournal });
  };

  const handleJournalChange = (j) => {
    setSelectedJournal(j);
    setSearchParams({ tab: activeTab, journal: j });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manuscripts Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, triage, track peer reviews, and manage submissions across all journals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/submit')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Manuscript</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Paper ID, title, author, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Journal Dropdown */}
          <select
            value={selectedJournal}
            onChange={(e) => handleJournalChange(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer focus:outline-indigo-500"
          >
            <option value="ALL">All Journals (IJMAR &amp; IJSPAST)</option>
            <option value="IJMAR">IJMAR Only</option>
            <option value="IJSPAST">IJSPAST Only</option>
          </select>

          {/* Domain Dropdown */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer focus:outline-indigo-500 max-w-[200px] truncate"
          >
            <option value="ALL">All Domains</option>
            {DOMAINS.map((dom) => (
              <option key={dom} value={dom}>
                {dom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {sortedPapers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No manuscripts found"
            description="No manuscripts match your selected tab, search keyword, or active filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedJournal('ALL');
              setSelectedDomain('ALL');
              setActiveTab('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => {
                      if (sortField === 'id') setSortAsc(!sortAsc);
                      else {
                        setSortField('id');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Paper ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => {
                      if (sortField === 'title') setSortAsc(!sortAsc);
                      else {
                        setSortField('title');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Title &amp; Subject</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Corresponding Author</th>
                  <th className="py-3 px-4">Journal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA / Time Limit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPapers.map((paper) => {
                  return (
                    <tr
                      key={paper.id}
                      onClick={() => navigate(`/manuscripts/${paper.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* ID Column */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        <span className="group-hover:underline underline-offset-2">
                          {paper.id}
                        </span>
                      </td>

                      {/* Title & Domain */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                          {paper.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {paper.domain}
                        </p>
                      </td>

                      {/* Author & ORCID */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{paper.author.name}</p>
                        <div className="mt-1">
                          <OrcidBadge orc={paper.orc} orcid={paper.author.orcid} showLink={false} />
                        </div>
                      </td>

                      {/* Journal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider uppercase ${
                            paper.journal === 'IJMAR'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {paper.journal}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={paper.status} size="sm" />
                      </td>

                      {/* Time limit */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TimeTag
                          due={paper.due}
                          dueMax={paper.dueMax}
                          currentDay={currentDay}
                          size="sm"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manuscripts/${paper.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Manage</span>
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

        {/* Table Footer info */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {sortedPapers.length} of {papers.length} total manuscripts</span>
          <span className="text-[11px] text-slate-400">Click any row to open the complete workflow control center</span>
        </div>
      </div>
    </div>
  );
}
