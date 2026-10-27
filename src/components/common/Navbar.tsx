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
    author: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    editor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    reviewer: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all">
      {/* Left: Mobile Drawer Trigger, Desktop Collapse Toggle, and Brand Info */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse shortcut button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>
        )}

        {/* Brand identity & Institutional Pill */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d3b6e] to-[#1e3a8a] text-amber-300 font-black flex items-center justify-center text-sm shadow-xs shrink-0 tracking-tight">
            IJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                IJSPAST
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono font-semibold hidden sm:inline border border-slate-200/80">
                E-ISSN: 2582-8800
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                • SRMU Journal Publishing System
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-md hidden md:block">
              International Journal of Scientific Progress in Applied Science and Engineering
            </p>
          </div>
        </div>
      </div>

      {/* Right: User Status & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Double-Blind Status Chip */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Double-Blind Active</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0d3b6e] to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
              {user?.name?.[0] || user?.role?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block font-bold text-slate-800 text-[11px] leading-tight truncate max-w-[130px]">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize block leading-tight">
                {roleLabels[user?.role || 'author'] || user?.role || 'Editor'}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
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
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                    roleBadgeColors[user?.role || 'author'] || 'bg-slate-50 text-slate-700'
                  }`}
                >
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
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};
