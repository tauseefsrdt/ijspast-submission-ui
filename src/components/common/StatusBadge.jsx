import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  UserCheck,
  Send,
  Eye,
  CreditCard,
  BookOpen,
  ArrowRightCircle,
  FileCheck,
} from 'lucide-react';

const STATUS_CONFIG = {
  'Under Screening': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Eye,
    label: 'Under Screening',
  },
  'Pushed Back': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
    label: 'Pushed Back',
  },
  'Rejected': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    label: 'Rejected',
  },
  'Sent to Reviewers': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Send,
    label: 'Sent to Reviewers',
  },
  'Review Received': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: FileCheck,
    label: 'Review Received',
  },
  'Comments Sent': {
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: Clock,
    label: 'Comments Sent (Action with Author)',
  },
  'Revision Received': {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: ArrowRightCircle,
    label: 'Revision Received',
  },
  'Re-review': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Send,
    label: 'Re-review (Round 2)',
  },
  'Reviews Complete': {
    bg: 'bg-blue-50 text-blue-800 border-blue-300',
    icon: CheckCircle2,
    label: 'Reviews Complete',
  },
  'Accepted': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    label: 'Accepted',
  },
  'Camera-Ready Received': {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: FileText,
    label: 'Camera-Ready Received',
  },
  'Proofreading': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Proofreading (With Author)',
  },
  'Changes Requested': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertCircle,
    label: 'Changes Requested',
  },
  'Payment Pending': {
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: CreditCard,
    label: 'Payment Pending',
  },
  'Paid': {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    label: 'Payment Verified',
  },
  'Published': {
    bg: 'bg-teal-50 text-teal-800 border-teal-300',
    icon: BookOpen,
    label: 'Published',
  },
  'Submitted': {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: FileText,
    label: 'Submitted',
  },
  'Acknowledged': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FileText,
    label: 'Acknowledged',
  },
};

export function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText,
    label: status || 'Unknown',
  };

  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2 font-medium'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
