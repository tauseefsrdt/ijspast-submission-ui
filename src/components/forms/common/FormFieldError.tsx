import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  touched,
  className = '',
}) => {
  if (!error || !touched) return null;

  return (
    <div
      className={`flex items-start gap-1 text-[11px] text-rose-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
      <span className="leading-tight">{error}</span>
    </div>
  );
};
