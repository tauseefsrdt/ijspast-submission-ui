import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import {
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  BookOpen,
  Sparkles,
  Shield,
  Layers,
  Building,
  KeyRound,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const roleBadgeColors: Record<string, string> = {
    author: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    editor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    reviewer: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Menu & Journal Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs tracking-tight">
            IJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                IJSPAST
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-semibold hidden sm:inline">
                E-ISSN: 2582-8800
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-md hidden md:block">
              International Journal of Scientific Progress in Applied Science &amp; Technology
            </p>
          </div>
        </div>
      </div>

      {/* Right: Authenticated User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#0d3b6e] text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {user?.name?.[0] || user?.role?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-bold text-slate-800 text-[11px] leading-tight truncate max-w-[140px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize">
                {user?.role || 'Guest'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="pb-2 border-b border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Signed in as
                </span>
                <p className="font-bold text-slate-900 truncate text-sm">{user?.name}</p>
                <p className="text-slate-500 text-[11px] font-mono truncate">{user?.email}</p>
                {user?.institution && (
                  <p className="text-slate-400 text-[10px] truncate flex items-center gap-1 pt-0.5">
                    <Building className="w-3 h-3 shrink-0" />
                    <span>{user.institution}</span>
                  </p>
                )}
              </div>

              <div className="py-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${roleBadgeColors[user?.role || 'author'] || 'bg-slate-50 text-slate-700'}`}>
                  Role: {user?.role}
                </span>
              </div>

              {/* Only Author and Reviewer can change password. Editor credentials cannot be changed. */}
              {(user?.role === 'author' || user?.role === 'reviewer') && (
                <div className="py-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Change Password</span>
                  </button>
                </div>
              )}

              <div className="border-t border-slate-100 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of journal session"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Change Password Modal (Authors and Reviewers only) */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};
