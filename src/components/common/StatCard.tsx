import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate';
  onClick?: () => void;
  badge?: string;
  isActive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'indigo',
  onClick,
  badge,
  isActive = false,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80 text-indigo-700 border-indigo-100',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50/30',
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-700 border-amber-100',
      activeRing: 'ring-2 ring-amber-500 border-amber-300 bg-amber-50/30',
    },
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/30',
    },
    rose: {
      bg: 'bg-rose-50/80 text-rose-700 border-rose-100',
      activeRing: 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/30',
    },
    blue: {
      bg: 'bg-blue-50/80 text-blue-700 border-blue-100',
      activeRing: 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/30',
    },
    purple: {
      bg: 'bg-purple-50/80 text-purple-700 border-purple-100',
      activeRing: 'ring-2 ring-purple-500 border-purple-300 bg-purple-50/30',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      activeRing: 'ring-2 ring-slate-500 border-slate-300 bg-slate-50/50',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 select-none'
          : ''
      } ${isActive ? scheme.activeRing : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 font-medium truncate leading-tight">
              {subtext}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${scheme.bg} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
