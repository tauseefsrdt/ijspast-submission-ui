import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    dispatch(clearAuthError());

    const resultAction = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(resultAction)) {
      const role = resultAction.payload.role;
      if (role === 'author') navigate('/author/dashboard');
      else if (role === 'editor') navigate('/editor/dashboard');
      else if (role === 'reviewer') navigate('/reviewer/dashboard');
      else navigate('/author/dashboard');
    }
  };

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
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Registered Institutional Email <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Password <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d3b6e]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="w-full py-3 bg-[#0d3b6e] hover:bg-[#092b52] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Authenticating with Server...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Public Author Submission Link (No login needed) */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-center">
            <span className="text-[11px] font-bold text-amber-900 block">
              Submitting a New Manuscript?
            </span>
            <p className="text-[11px] text-amber-800 leading-tight">
              No prior login required! Authors submit directly on our public portal, and credentials are dispatched automatically.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer mt-1"
            >
              <span>Go to Public Submission Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Public Archive Link */}
        <div className="text-center pt-1">
          <Link
            to="/published"
            className="text-xs text-slate-500 hover:text-[#0d3b6e] font-medium inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Open Access Archive</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
