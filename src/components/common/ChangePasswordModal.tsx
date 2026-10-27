import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useAppDispatch } from '../../store';
import { changePasswordThunk } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import { changePasswordSchema } from '../../utils/validationSchemas';
import { FormInput } from '../forms/common/FormInput';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  Check,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null);
      setIsLoading(true);

      try {
        await dispatch(
          changePasswordThunk({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          })
        ).unwrap();

        toast.success('Your password has been changed successfully.');
        resetForm();
        onClose();
      } catch (err: any) {
        const msg = err?.message || err || 'Failed to change password. Please check your current password.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  const newPass = formik.values.newPassword;
  const isLengthValid = newPass.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const passwordsMatch = newPass.length > 0 && newPass === formik.values.confirmPassword;

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    formik.resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d3b6e] text-amber-400 flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Change Password</h2>
              <p className="text-[11px] text-slate-500">Update your account login credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Current Password */}
          <FormInput
            label="Current Password"
            required
            type={showCurrent ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            placeholder="Enter current password"
            value={formik.values.currentPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.currentPassword}
            touched={formik.touched.currentPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* New Password */}
          <FormInput
            label="New Password"
            required
            type={showNew ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            placeholder="Minimum 8 characters"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.newPassword}
            touched={formik.touched.newPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm New Password"
            required
            type={showConfirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter new password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Validation Checklist */}
          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-[11px] border border-slate-200/80">
            <div className="flex items-center gap-1.5">
              {isLengthValid ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                At least 8 characters long
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {hasLetter && hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={hasLetter && hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                Contains letters and numbers
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {passwordsMatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                Passwords match
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formik.isValid || !formik.values.currentPassword || !formik.values.newPassword}
              className="px-4 py-2 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold rounded-xl text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
