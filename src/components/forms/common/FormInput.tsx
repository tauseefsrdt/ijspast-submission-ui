import React from 'react';
import { FormFieldError } from './FormFieldError';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  touched?: boolean;
  helperText?: string;
  variant?: 'light' | 'dark';
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  leftIcon,
  rightElement,
  error,
  touched,
  helperText,
  variant = 'light',
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;
  const hasError = Boolean(touched && error);
  const isDark = variant === 'dark';

  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label
          htmlFor={inputId}
          className={`font-bold block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
        >
          {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          className={`w-full py-2.5 border rounded-xl transition-all ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            isDark
              ? hasError
                ? 'border-rose-500/60 ring-1 ring-rose-500/30 bg-rose-950/20 text-white placeholder-slate-500 focus:ring-rose-500/40'
                : 'bg-slate-900/80 border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
              : hasError
              ? 'border-rose-300 ring-1 ring-rose-400/30 bg-rose-50/20 text-slate-900 placeholder-slate-400 focus:ring-rose-400/40'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#0d3b6e]/20'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {helperText && !hasError && (
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      )}

      <FormFieldError error={error} touched={touched} />
    </div>
  );
};
