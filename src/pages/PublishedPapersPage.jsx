import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { DOMAINS, BASE_DATE, getDateString } from '../constants/initialData';

export function PublishedPapersPage() {
  const { data, showToast } = useApp();

  const [selectedJournal, setSelectedJournal] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);

  const papers = data?.papers || [];
  const publishedPapers = papers.filter((p) => p.status === 'Published');

  const filtered = publishedPapers.filter((p) => {
    if (selectedJournal !== 'ALL' && p.journal !== selectedJournal) return false;
    if (selectedDomain !== 'ALL' && p.domain !== selectedDomain) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q) ||
        (p.keywords || '').toLowerCase().includes(q) ||
        (p.doi || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Access Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Published Scholarly Articles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Peer-reviewed research published in the official journals of Shri Ramswaroop Memorial University.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published articles by title, author, keyword, or DOI..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Journals</option>
            <option value="IJMAR">IJMAR Only</option>
            <option value="IJSPAST">IJSPAST Only</option>
          </select>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">All Subject Domains</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No published articles found"
          description="Papers will appear here once the Editor publishes them following peer review and payment verification."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((paper) => (
            <div
              key={paper.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                      paper.journal === 'IJMAR'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {paper.journal}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    Published: {getDateString(BASE_DATE, (paper.paidDay || 0) + 1)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {paper.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{paper.author.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{paper.author.inst}</p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                {paper.doi && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-700 font-mono">
                    <span className="text-slate-400 text-[10px] uppercase font-sans">DOI:</span>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>{paper.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPaper(paper)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Abstract &amp; Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast(`Simulated PDF download for paper ${paper.id}`)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      <Modal
        isOpen={Boolean(selectedPaper)}
        onClose={() => setSelectedPaper(null)}
        title={selectedPaper?.title}
        subtitle={`${selectedPaper?.journal} • Published Article • DOI: ${selectedPaper?.doi || 'pending'}`}
        wide={true}
      >
        {selectedPaper && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm">
                {selectedPaper.author.name}
              </span>
              <p className="text-slate-500">{selectedPaper.author.inst}</p>
              {selectedPaper.author.coauthors && (
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Co-authors: {selectedPaper.author.coauthors}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Abstract</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedPaper.abstract}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">Keywords</h4>
              <p className="text-slate-600 font-medium">{selectedPaper.keywords}</p>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950 space-y-1">
              <span className="font-bold block">Open Access Article</span>
              <p className="text-slate-600 text-[11px]">
                Distributed under Creative Commons Attribution License. Users are permitted to read, download, copy, distribute, print, search, or link to full texts.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Downloading article PDF ${selectedPaper.id}`);
                  setSelectedPaper(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
