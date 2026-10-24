import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export function TimeTag({ due, dueMax, currentDay, size = 'sm' }) {
  if (due === null || due === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-400" />
        No deadline
      </span>
    );
  }

  const daysLeft = due - currentDay;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (daysLeft > 2) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <Clock className="w-3 h-3 text-emerald-500" />
        <span>{daysLeft} days left</span>
      </span>
    );
  }

  if (daysLeft === 2 || daysLeft === 1) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <AlertTriangle className="w-3 h-3 text-amber-500 animate-pulse" />
        <span>{daysLeft === 1 ? '1 day left' : '2 days left'}</span>
      </span>
    );
  }

  if (daysLeft === 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 ${sizeClasses}`}>
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Due today</span>
      </span>
    );
  }

  // Overdue
  const overdueDays = -daysLeft;
  if (dueMax && currentDay <= dueMax) {
    const extLeft = dueMax - currentDay;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses}`}>
        <AlertCircle className="w-3 h-3 text-orange-500" />
        <span>Extended: {extLeft}d to max</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
      <AlertCircle className="w-3 h-3 text-rose-500" />
      <span>Overdue by {overdueDays}d</span>
    </span>
  );
}
