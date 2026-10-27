import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import {
  Menu,
  LogOut,
  ChevronDown,
  Building,
  KeyRound,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { useToast } from '../../context/ToastContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isCollapsed,
  onToggleCollapse,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Signed out successfully.');
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    editor: 'Editorial Office (Admin)',
    author: 'Corresponding Author',
    reviewer: 'Peer Reviewer',
  };

  const roleBadgeColors: Record<string, string> = {
    author: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    editor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    reviewer: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  };

  return (
    <header className="h-16 bg-[#071526]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all text-white">
      {/* Left: Mobile Drawer Trigger, Desktop Collapse Toggle, and Brand Info */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse shortcut button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        {/* Brand identity & Institutional Pill */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-[#0a2540] border-2 border-[#f59e0b] text-[#f59e0b] font-serif font-black flex items-center justify-center text-sm shadow-md shrink-0 tracking-tight">
            IJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight text-sm">
                IJSPAST
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-mono font-bold hidden sm:inline border border-amber-400/30">
                E-ISSN: 2582-8800
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                • SRMU Journal System
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-md hidden md:block">
              International Journal of Scientific Progress in Applied Science and Engineering
            </p>
          </div>
        </div>
      </div>

      {/* Right: User Status & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Double-Blind Status Chip */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-semibold text-amber-300">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Double-Blind Active</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-semibold text-slate-200 cursor-pointer shadow-sm"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xs uppercase shadow-sm ring-1 ring-amber-300/40">
              {user?.name?.[0] || user?.role?.[0] || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-bold text-white text-[11px] leading-tight truncate max-w-[130px]">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize block leading-tight">
                {roleLabels[user?.role || 'author'] || user?.role || 'Editor'}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0c1427] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100 text-slate-200">
              <div className="pb-2 border-b border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Authenticated User
                </span>
                <p className="font-bold text-white truncate text-sm">{user?.name}</p>
                <p className="text-slate-400 text-[11px] font-mono truncate">{user?.email}</p>
                {user?.institution && (
                  <p className="text-slate-400 text-[10px] truncate flex items-center gap-1 pt-0.5">
                    <Building className="w-3 h-3 shrink-0 text-slate-500" />
                    <span>{user.institution}</span>
                  </p>
                )}
              </div>

              <div className="py-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${roleBadgeColors[user?.role || 'author'] || 'bg-white/10 text-slate-300'
                    }`}
                >
                  Role: {user?.role}
                </span>
              </div>

              {/* Only Author and Reviewer can change password. Editor credentials cannot be changed. */}
              {(user?.role === 'author' || user?.role === 'reviewer') && (
                <div className="py-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>Change Password</span>
                  </button>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};
