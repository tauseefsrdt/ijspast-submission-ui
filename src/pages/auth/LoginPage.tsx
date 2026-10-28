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
  Sparkles,
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
      {/* Flagship Hero Card - Exact SRMU Journal Deep Navy & Gold Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071526] via-[#0a2540] to-[#0f4a85] rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-700/60 text-white space-y-5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

        {/* Card Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Access Your Workspace
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in as Author, Peer Reviewer, or Editorial Office to access manuscript submissions and reviews.
          </p>
        </div>

        {/* Role Portal Mode Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-[#071526]/90 border border-slate-700/80 rounded-2xl text-xs font-bold text-slate-300">
          <button
            type="button"
            onClick={() => {
              setPortalMode('author_reviewer');
              dispatch(clearAuthError());
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalMode === 'author_reviewer'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
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
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              portalMode === 'editor'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Editorial Office</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs" noValidate>
          <FormInput
            variant="dark"
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
              variant="dark"
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

            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formik.isValid || !formik.values.email || !formik.values.password}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Authenticating with Server...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
