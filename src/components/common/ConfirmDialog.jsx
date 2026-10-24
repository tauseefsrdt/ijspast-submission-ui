import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-600',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: AlertCircle,
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: AlertTriangle,
    },
    info: {
      iconBg: 'bg-indigo-100 text-indigo-600',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      icon: Info,
    },
  }[type] || {
    iconBg: 'bg-rose-100 text-rose-600',
    btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    icon: AlertCircle,
  };

  const Icon = typeConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${typeConfig.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-xl shadow-xs transition-colors ${typeConfig.btnBg}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
