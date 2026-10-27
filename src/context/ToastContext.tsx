import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global imperative caller for cases where hook is outside React component
type ToastFn = (message: string, description?: string) => void;
interface ImperativeToast {
  success: ToastFn;
  error: ToastFn;
  info: ToastFn;
  warning: ToastFn;
}

let globalToastHandler: ToastContextValue | null = null;

export const toast: ImperativeToast = {
  success: (msg, desc) => globalToastHandler?.success(msg, desc),
  error: (msg, desc) => globalToastHandler?.error(msg, desc),
  info: (msg, desc) => globalToastHandler?.info(msg, desc),
  warning: (msg, desc) => globalToastHandler?.warning(msg, desc),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string, duration = 4000) => {
      // Deduplicate: If an active toast has identical message & type, ignore to prevent spam
      setToasts((prev) => {
        const isDuplicate = prev.some((t) => t.type === type && t.message === message);
        if (isDuplicate) return prev;

        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newItem: ToastItem = { id, type, message, description, duration };

        // Auto remove after duration
        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }

        // Keep maximum 4 concurrent toasts
        const next = [...prev, newItem];
        return next.length > 4 ? next.slice(-4) : next;
      });
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string, desc?: string) => showToast('success', msg, desc),
    [showToast]
  );
  const error = useCallback(
    (msg: string, desc?: string) => showToast('error', msg, desc, 5000),
    [showToast]
  );
  const info = useCallback(
    (msg: string, desc?: string) => showToast('info', msg, desc),
    [showToast]
  );
  const warning = useCallback(
    (msg: string, desc?: string) => showToast('warning', msg, desc),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({ showToast, success, error, info, warning, removeToast }),
    [showToast, success, error, info, warning, removeToast]
  );

  // Bind to global handler
  globalToastHandler = contextValue;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

// Toast Card Component
const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const styles = {
    success: {
      bg: 'bg-white border-emerald-300 text-slate-800 shadow-lg shadow-emerald-950/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      bar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-white border-rose-300 text-slate-800 shadow-lg shadow-rose-950/10',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      bar: 'bg-rose-500',
    },
    warning: {
      bg: 'bg-white border-amber-300 text-slate-800 shadow-lg shadow-amber-950/10',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      bar: 'bg-amber-500',
    },
    info: {
      bg: 'bg-white border-blue-300 text-slate-800 shadow-lg shadow-blue-950/10',
      icon: <Info className="w-5 h-5 text-[#0d3b6e] shrink-0 mt-0.5" />,
      bar: 'bg-[#0d3b6e]',
    },
  }[item.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${styles.bg} transition-all transform animate-in slide-in-from-bottom-3 fade-in duration-200 relative overflow-hidden`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`} />
      <div className="pl-1">{styles.icon}</div>
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-bold text-slate-900 leading-snug">{item.message}</p>
        {item.description && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
