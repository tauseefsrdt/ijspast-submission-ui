import React from 'react';
import { ManuscriptStatus } from '../../types/manuscript.types';
import {
  FileText,
  Clock,
  Eye,
  UserCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  XCircle,
  BookOpen,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ManuscriptStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_MAP: Record<
  ManuscriptStatus,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Draft: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: FileText,
  },
  Submitted: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock,
  },
  'Editor Assessment': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Eye,
  },
  'Reviewer Assigned': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: UserCheck,
  },
  'Under Review': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Send,
  },
  'Review Completed': {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: CheckCircle2,
  },
  'Revision Requested': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: AlertTriangle,
  },
  'Revision Submitted': {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    icon: RotateCcw,
  },
  Accepted: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Check,
  },
  Rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
  },
  Published: {
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
    icon: BookOpen,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.Draft;
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2 font-semibold'
      : 'px-2.5 py-1 text-xs gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
