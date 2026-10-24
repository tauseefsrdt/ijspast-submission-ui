import React from 'react';
import { BASE_DATE, getDateString } from '../../constants/initialData';

export function KeyValueList({ items }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 text-sm my-2">
      {items.map(([label, value], i) => (
        <React.Fragment key={i}>
          <dt className="text-[#55657d] font-medium">{label}</dt>
          <dd className="text-[#14233a] break-words">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export function TrailView({ trail, visibility = 'all' }) {
  const filtered = trail
    .filter((t) => visibility === 'all' || t.vis !== 'ed')
    .sort((a, b) => a.n - b.n);

  if (filtered.length === 0) {
    return <p className="text-sm text-[#55657d] italic">No activity recorded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3 text-sm">
      {filtered.map((item, idx) => (
        <li key={idx} className="grid grid-cols-1 sm:grid-cols-[125px_1fr] gap-2 items-baseline border-b border-[#f0f4f9] pb-2 last:border-b-0">
          <span className="text-[#55657d] text-xs font-mono">
            {getDateString(BASE_DATE, item.day)} {item.time}
          </span>
          <div>
            <b className="font-semibold text-[#0d3b6e]">{item.actor}</b>{' '}
            <span className="text-[#14233a]">{item.text}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FilesTable({ files }) {
  if (!files || files.length === 0) {
    return <p className="text-sm text-[#55657d] italic">No files uploaded.</p>;
  }

  return (
    <div className="overflow-x-auto border border-[#d5deeb] rounded-lg">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#d5deeb]">
            <th className="py-2 px-3 text-xs uppercase font-semibold text-[#55657d] tracking-wider">Type</th>
            <th className="py-2 px-3 text-xs uppercase font-semibold text-[#55657d] tracking-wider">File</th>
            <th className="py-2 px-3 text-xs uppercase font-semibold text-[#55657d] tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d5deeb]">
          {files.map((file, idx) => (
            <tr key={idx} className="hover:bg-[#f1f5f9] transition-colors">
              <td className="py-2 px-3 font-medium text-[#14233a]">{file.t}</td>
              <td className="py-2 px-3 font-mono text-xs text-[#0b5cad]">{file.name}</td>
              <td className="py-2 px-3 text-[#55657d]">{getDateString(BASE_DATE, file.day)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
