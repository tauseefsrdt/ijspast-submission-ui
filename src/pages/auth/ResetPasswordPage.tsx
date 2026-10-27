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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-black flex items-center justify-center text-xl mx-auto shadow-xl shadow-blue-900/50 ring-2 ring-white/20">
          IJ
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Establish a new secure password for your IJSPAST account
        </p>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden bg-[#0c1427]/95 backdrop-blur-xl rounded-3xl border border-slate-800/90 p-7 sm:p-8 shadow-2xl shadow-black/60 space-y-5 text-slate-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Password Reset Complete</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {!token && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2 text-amber-200 text-xs font-medium">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>No reset token detected in URL query parameter.</span>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
                >
                  <span>Use OTP Password Reset instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
              <FormInput
                variant="dark"
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
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <FormInput
                variant="dark"
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
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isLoading || !token || !formik.isValid || !formik.values.newPassword}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <Link to="/login" className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
