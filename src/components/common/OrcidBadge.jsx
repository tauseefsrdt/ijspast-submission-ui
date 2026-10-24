import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

export function OrcidBadge({ orc, orcid, showLink = true, size = 'sm' }) {
  const status = orc?.status || 'Not verified';
  const orcidValue = orcid || orc?.id;

  let badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  let Icon = AlertTriangle;
  let statusText = 'ORCID Not Verified';

  if (status === 'Verified') {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = ShieldCheck;
    statusText = 'ORCID Verified';
  } else if (status === 'Invalid') {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = XCircle;
    statusText = 'ORCID Invalid';
  }

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium tracking-tight ${badgeColor}`}
        title={orc?.name ? `Record name: ${orc.name}` : undefined}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{statusText}</span>
      </span>

      {orcidValue && showLink && (
        <a
          href={`https://orcid.org/${orcidValue}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-mono transition-colors"
          title="Open ORCID Public Profile"
        >
          <span>{orcidValue}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}
    </div>
  );
}
