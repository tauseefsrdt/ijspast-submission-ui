import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchPublishedManuscripts, downloadManuscriptFile } from '../../features/manuscripts/manuscriptThunk';
import {
  BookOpen,
  Search,
  Download,
  Calendar,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const PublishedPapersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { publishedManuscripts, manuscripts, isLoading } = useAppSelector((state) => state.manuscripts);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPublishedManuscripts());
  }, [dispatch]);

  const sourceList = publishedManuscripts.length > 0
    ? publishedManuscripts
    : manuscripts.filter((m) => m.status === 'Published');

  const filtered = sourceList.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.author?.name && m.author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.publicationDetails?.doi || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (fileUrl: string | undefined, fileName: string, id: string) => {
    if (!fileUrl) {
      toast.error('File not found for this publication');
      return;
    }
    setDownloadingId(id);
    try {
      toast.info(`Downloading publication: ${fileName}`);
      await downloadManuscriptFile(fileUrl, fileName);
    } catch (err: any) {
      console.error('Download failed:', err);
      toast.error(err?.message || 'Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Access Scholarly Archive</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
            Published Articles &amp; Proceedings
          </h1>
          <p className="text-xs text-slate-500">
            Peer-reviewed research articles published in IJSPAST (E-ISSN: 2582-8800).
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchPublishedManuscripts())}
          className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Archive</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published papers by title, author, domain, or DOI..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No published articles found"
          description="Articles will appear here once approved and published by the Editor-in-Chief in the live database."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase bg-teal-50 text-teal-800 border border-teal-200">
                    Open Access
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {m.publicationDetails?.volume || 'Vol. 14'}, {m.publicationDetails?.issue || 'Issue 1'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0d3b6e] leading-snug line-clamp-2">
                  {m.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{m.author?.name || 'Author'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{m.author?.institution || ''}</p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {m.abstract}
                </p>

                {m.publicationDetails?.doi && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-700 font-mono">
                    <span className="text-slate-400 text-[10px] uppercase font-sans">DOI:</span>
                    <span>{m.publicationDetails.doi}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={downloadingId === m.id}
                  onClick={() => handleDownload(m.file?.url || m.file?.name, m.file?.name || `${m.id}.pdf`, m.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingId === m.id ? 'animate-bounce' : ''}`} />
                  <span>{downloadingId === m.id ? 'Downloading...' : 'Download Full PDF'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
