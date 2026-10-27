import React from 'react';
import { FormFieldError } from './FormFieldError';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  helperText?: string;
  counterBadge?: React.ReactNode;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  required,
  error,
  touched,
  helperText,
  counterBadge,
  className = '',
  id,
  name,
  rows = 4,
  ...props
}) => {
  const inputId = id || name;
  const hasError = Boolean(touched && error);

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} className="font-bold text-slate-700 block">
            {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          </label>
        )}
        {counterBadge}
      </div>

      <textarea
        id={inputId}
        name={name}
        rows={rows}
        className={`w-full p-3 bg-slate-50 border rounded-xl text-slate-900 leading-relaxed transition-all placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 font-sans ${
          hasError
            ? 'border-rose-300 ring-1 ring-rose-400/30 bg-rose-50/20 focus:ring-rose-400/40'
            : 'border-slate-200 focus:border-slate-300 focus:ring-[#0d3b6e]/20'
        } ${className}`}
        {...props}
      />

      {helperText && !hasError && (
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      )}

      <FormFieldError error={error} touched={touched} />
    </div>
  );
};
