import React from 'react';
import { STATUS_COLORS } from '../../constants/initialData';

export function Badge({ variant = 'mute', children, className = '' }) {
  const styles = {
    ok: 'bg-[#e1f4e9] text-[#13663c]',
    warn: 'bg-[#fff0cc] text-[#7d5200]',
    bad: 'bg-[#fde3e0] text-[#a8231b]',
    info: 'bg-[#e0ecfa] text-[#1a5a9f]',
    mute: 'bg-[#eaf0f8] text-[#55657d]',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
        styles[variant] || styles.mute
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const variant = STATUS_COLORS[status] || 'mute';
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}

export function OrcidBadge({ status, className = '' }) {
  const variant = status === 'Verified' ? 'ok' : status === 'Not verified' ? 'warn' : 'bad';
  return (
    <Badge variant={variant} className={className}>
      ORCID {status}
    </Badge>
  );
}
