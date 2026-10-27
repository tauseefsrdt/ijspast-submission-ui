import React from 'react';
import { FormFieldError } from './FormFieldError';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  helperText?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required,
  error,
  touched,
  helperText,
  options,
  children,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;
  const hasError = Boolean(touched && error);

  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label htmlFor={inputId} className="font-bold text-slate-700 block">
          {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      <select
        id={inputId}
        name={name}
        className={`w-full py-2.5 px-3.5 bg-slate-50 border rounded-xl text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 cursor-pointer ${
          hasError
            ? 'border-rose-300 ring-1 ring-rose-400/30 bg-rose-50/20 focus:ring-rose-400/40'
            : 'border-slate-200 focus:border-slate-300 focus:ring-[#0d3b6e]/20'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {helperText && !hasError && (
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      )}

      <FormFieldError error={error} touched={touched} />
    </div>
  );
};
