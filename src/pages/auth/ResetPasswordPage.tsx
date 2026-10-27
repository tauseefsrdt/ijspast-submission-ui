import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { resetPasswordThunk } from '../../features/auth/authThunk';
import { useToast } from '../../context/ToastContext';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!token) {
        const msg = 'Password reset token is missing from URL. Please use the exact link sent to your email.';
        setError(msg);
        toast.error(msg);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        await dispatch(
          resetPasswordThunk({
            token,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          })
        ).unwrap();

        setIsSuccess(true);
        toast.success('Your password has been successfully reset!');
      } catch (err: any) {
        const msg = err?.message || err || 'Password reset failed. The token may be invalid or expired.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-lg mx-auto shadow-md">
          IJ
        </div>
        <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500">
          Establish a new secure password for your IJSPAST account
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {!token && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-800 text-xs font-medium">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>No reset token detected in URL query parameter.</span>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d3b6e] hover:underline"
                >
                  <span>Use OTP Password Reset instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
              <FormInput
                label="New Password"
                required
                type={showPassword ? 'text' : 'password'}
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

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

              <button
                type="submit"
                disabled={isLoading || !token || !formik.isValid || !formik.values.newPassword}
                className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <Link to="/login" className="text-xs text-slate-500 hover:text-[#0d3b6e] font-semibold">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
