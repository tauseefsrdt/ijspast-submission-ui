import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { activateAccountThunk } from '../../features/auth/authThunk';
import { useToast } from '../../context/ToastContext';
import { activateAccountSchema } from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';

export const ActivateAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: activateAccountSchema,
    onSubmit: async (values) => {
      if (!token) {
        const msg = 'Activation token is missing from URL. Please use the exact link sent to your email.';
        setError(msg);
        toast.error(msg);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        await dispatch(
          activateAccountThunk({
            token,
            password: values.password,
          })
        ).unwrap();

        setIsSuccess(true);
        toast.success('Account activated successfully! You may now sign in.');
      } catch (err: any) {
        const msg = err?.message || err || 'Account activation failed. The token may be invalid or expired.';
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
          Activate Your Account
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Set up your permanent password to access the IJSPAST Editorial Portal
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
              <h2 className="text-base font-bold text-white">Account Activated Successfully!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your account is verified and your password has been set. You can now log in to access your workspace.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Proceed to Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {!token && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-2.5 text-amber-200 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  No activation token detected. Please verify you opened the full URL from your invitation email.
                </span>
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
                label="Create Password"
                required
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Minimum 8 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.password}
                touched={formik.touched.password}
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
                label="Confirm Password"
                required
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter password"
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
                disabled={isLoading || !token || !formik.isValid || !formik.values.password}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Activating Account...' : 'Activate Account & Set Password'}</span>
                <ShieldCheck className="w-4 h-4" />
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
