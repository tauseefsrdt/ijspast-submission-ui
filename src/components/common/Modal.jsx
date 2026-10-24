import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  wide = false,
  children,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[wide ? '4xl' : size] || 'max-w-xl';

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-start p-4 sm:p-6 overflow-y-auto backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`bg-white text-slate-800 rounded-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 relative animate-in zoom-in-95 duration-150 ${sizeClasses}`}
        role="dialog"
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
            <div>
              {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const isString = typeof message === 'string';
  const text = isString ? message : message.text || '';
  const msgType = !isString && message.type ? message.type : type;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-900 text-emerald-100 border-emerald-700',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-rose-900 text-rose-100 border-rose-700',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-slate-900 text-slate-100 border-slate-700',
      icon: Info,
    },
  }[msgType] || {
    bg: 'bg-slate-900 text-slate-100 border-slate-700',
    icon: Info,
  };

  const Icon = typeConfig.icon;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 animate-in slide-in-from-bottom duration-200">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium ${typeConfig.bg}`}
      >
        <Icon className="w-4 h-4 shrink-0 text-white" />
        <span>{text}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
