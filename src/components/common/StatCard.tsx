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
      stripe: 'from-blue-600 to-indigo-600',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      activeRing: 'ring-2 ring-blue-600 border-blue-400 bg-blue-50/20 shadow-md',
    },
    amber: {
      stripe: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      activeRing: 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/20 shadow-md',
    },
    emerald: {
      stripe: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20 shadow-md',
    },
    rose: {
      stripe: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      activeRing: 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/20 shadow-md',
    },
    blue: {
      stripe: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      activeRing: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/20 shadow-md',
    },
    purple: {
      stripe: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      activeRing: 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/20 shadow-md',
    },
    slate: {
      stripe: 'from-slate-600 to-slate-800',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      activeRing: 'ring-2 ring-slate-600 border-slate-400 bg-slate-100/60 shadow-md',
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
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all duration-200 overflow-hidden ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 select-none'
          : ''
      } ${isActive ? scheme.activeRing : ''}`}
    >
      {/* Top Accent Gradient Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.stripe}`} />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
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
            className={`p-2.5 rounded-xl border shrink-0 ${scheme.bg} transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
