import React from 'react';
import { useApp } from '../../context/AppContext';
import { BASE_DATE, getDateString } from '../../constants/initialData';

export function PublicWebsiteView() {
  const { data, setSession, showToast, openModal, closeModal } = useApp();
  const { papers, session, day } = data;

  const publishedPapers = papers.filter((p) => p.status === 'Published');
  const selectedPaper = papers.find((p) => p.id === session.pid && p.status === 'Published');

  if (selectedPaper) {
    const p = selectedPaper;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button
            onClick={() => setSession({ pid: null })}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            ← Back to Published Papers Repository
          </button>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            {p.journal} | Open Access Publication
          </span>
        </div>

        <div className="bg-white border border-[#d5deeb] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#0b5cad] font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {p.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d3b6e] tracking-tight leading-snug">
              {p.title}
            </h1>
            <div className="text-sm font-semibold text-slate-800">
              {p.author.name}
            </div>
            <div className="text-xs text-slate-500">
              {p.author.inst}, {p.author.city}
            </div>
            {p.doi && (
              <div className="text-xs text-[#0b5cad] font-mono pt-1">
                DOI: <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="underline">{p.doi}</a>
              </div>
            )}
            <div className="text-xs text-slate-400">
              Published on: {getDateString(BASE_DATE, p.paidDay != null ? p.paidDay + 1 : day)}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Abstract
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              {p.abstract}
            </p>
          </div>

          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Keywords:</span> {p.keywords}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() =>
                openModal(
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-base text-[#0d3b6e]">{p.title}</h3>
                      <button onClick={closeModal} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Full Text Online Reader (Simulated) • {p.pages || 10} Pages • Peer Reviewed
                    </p>
                    <div className="max-h-96 overflow-y-auto text-xs text-slate-700 space-y-3 p-3 bg-slate-50 rounded-lg border">
                      <h4 className="font-bold text-sm text-slate-900">Abstract</h4>
                      <p>{p.abstract}</p>
                      <h4 className="font-bold text-sm text-slate-900">1. Introduction</h4>
                      <p>Technological advancement and systematic empirical evaluation underpin the core questions of contemporary scientific literature. This study systematically analyzes the fundamental parameters across institutional cases...</p>
                      <h4 className="font-bold text-sm text-slate-900">2. Methodology & Rigor</h4>
                      <p>A rigorous dual-phase evaluation framework was deployed incorporating empirical quantitative observations and structured qualitative analysis...</p>
                      <h4 className="font-bold text-sm text-slate-900">3. Experimental Results & Discussion</h4>
                      <p>The observed findings demonstrate substantial statistical significance across all primary variables under analysis, aligning with pre-established hypotheses...</p>
                      <h4 className="font-bold text-sm text-slate-900">4. Conclusion & Policy Implications</h4>
                      <p>The outcomes derived from this research offer actionable benchmarks for administrators, faculty, and industry practitioners...</p>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={closeModal} className="px-4 py-2 bg-[#0d3b6e] text-white text-xs font-semibold rounded-lg">
                        Close Reader
                      </button>
                    </div>
                  </div>,
                  true
                )
              }
              className="px-5 py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              View Full Article Online
            </button>

            <button
              onClick={() => showToast('Full PDF manuscript downloaded (simulated).')}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <span>📥</span> Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0d3b6e] tracking-tight">
          Public Journal Index & Published Articles
        </h1>
        <p className="text-xs text-[#55657d] mt-1">
          Open-access repository for <b>IJMAR</b> and <b>IJSPAST</b> publications. Articles appear here following peer review, editorial approval, and publication fee verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {publishedPapers.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
            No papers have been published yet.
          </div>
        ) : (
          publishedPapers.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#d5deeb] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0d3b6e] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {p.journal}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{p.id}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">
                  {p.title}
                </h3>
                <div className="text-xs text-slate-600 font-medium">
                  {p.author.name} • {p.author.inst}
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {p.abstract}
                </p>
                {p.doi && (
                  <div className="text-[11px] text-[#0b5cad] font-mono">
                    DOI: {p.doi}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {p.domain}
                </span>
                <button
                  onClick={() => setSession({ pid: p.id })}
                  className="px-3 py-1.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  Read Paper →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
