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
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  leftIcon,
  rightElement,
  error,
  touched,
  helperText,
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

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          className={`w-full py-2.5 bg-slate-50 border rounded-xl text-slate-900 transition-all placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            hasError
              ? 'border-rose-300 ring-1 ring-rose-400/30 bg-rose-50/20 focus:ring-rose-400/40'
              : 'border-slate-200 focus:border-slate-300 focus:ring-[#0d3b6e]/20'
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
