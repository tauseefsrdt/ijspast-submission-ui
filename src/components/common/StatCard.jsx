import React from 'react';

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'indigo',
  onClick,
  badge,
}) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      border: 'hover:border-indigo-300',
      glow: 'group-hover:text-indigo-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      border: 'hover:border-amber-300',
      glow: 'group-hover:text-amber-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      border: 'hover:border-emerald-300',
      glow: 'group-hover:text-emerald-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      border: 'hover:border-rose-300',
      glow: 'group-hover:text-rose-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      border: 'hover:border-blue-300',
      glow: 'group-hover:text-blue-600',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      border: 'hover:border-purple-300',
      glow: 'group-hover:text-purple-600',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 ' + c.border : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight text-slate-900 transition-colors ${c.glow}`}>
              {value}
            </span>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${c.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
