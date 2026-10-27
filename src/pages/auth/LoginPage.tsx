import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from '../../utils/validationSchemas';
import { FormInput } from '../../components/forms/common/FormInput';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Shield,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const initialRole = searchParams.get('role');
  const [portalMode, setPortalMode] = useState<'author_reviewer' | 'editor'>(
    initialRole === 'editor' ? 'editor' : 'author_reviewer'
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'author') navigate('/author/dashboard', { replace: true });
      else if (user.role === 'editor') navigate('/editor/dashboard', { replace: true });
      else if (user.role === 'reviewer') navigate('/reviewer/dashboard', { replace: true });
      else navigate('/author/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const isEditorMode = portalMode === 'editor';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      dispatch(clearAuthError());

      const resultAction = await dispatch(
        loginUser({
          email: values.email.trim(),
          password: values.password,
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        const role = resultAction.payload.role;
        const roleName =
          role === 'author'
            ? 'Author'
            : role === 'editor'
            ? 'Editorial Office'
            : 'Peer Reviewer';

        toast.success(`Welcome back! Signed in as ${roleName}.`);

        if (role === 'author') navigate('/author/dashboard');
        else if (role === 'editor') navigate('/editor/dashboard');
        else if (role === 'reviewer') navigate('/reviewer/dashboard');
        else navigate('/author/dashboard');
      } else {
        const errorMsg =
          (resultAction.payload as string) ||
          'Sign in failed. Please verify your credentials.';
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
      {/* Title Card */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-lg mx-auto shadow-md">
          IJ
        </div>
        <h1 className="text-2xl font-extrabold text-[#0d3b6e] tracking-tight">
          Portal Sign In
        </h1>
        <p className="text-xs text-slate-500">
          International Journal of Scientific Progress in Applied Science &amp; Technology
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        {/* Role Portal Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setPortalMode('author_reviewer');
              dispatch(clearAuthError());
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalMode === 'author_reviewer'
                ? 'bg-white text-[#0d3b6e] shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Author / Reviewer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalMode('editor');
              dispatch(clearAuthError());
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalMode === 'editor'
                ? 'bg-white text-[#0d3b6e] shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Editorial Office</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
          <FormInput
            label="Registered Institutional Email"
            required
            type="email"
            id="email"
            name="email"
            placeholder="name@university.edu"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.email}
            touched={formik.touched.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <FormInput
              label="Password"
              required
              type="password"
              id="password"
              name="password"
              placeholder="Enter account password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {/* Password Management Rules:
                Author & Reviewer: Can use Forgot Password to reset via email OTP.
                Editor: Cannot change or reset password. Do not show Forgot Password option. */}
            {!isEditorMode ? (
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#0d3b6e] hover:text-[#092b52] hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            ) : (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-start gap-2 text-slate-500 text-[11px] leading-tight">
                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Editor credentials are centrally managed by system administration. Self-service password reset is disabled for editor accounts.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !formik.isValid || !formik.values.email || !formik.values.password}
            className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Authenticating with Server...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
