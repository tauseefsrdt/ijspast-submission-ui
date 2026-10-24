import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  CheckSquare,
  CreditCard,
  BookOpen,
  Settings,
  Mail,
  ChevronRight,
  Sparkles,
  Layers,
  UserCheck,
  Building,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Sidebar({ isOpen, onClose }) {
  const { data, setSession } = useApp();
  const location = useLocation();

  const papers = data?.papers || [];
  const mailCount = data?.mail?.length || 0;
  const currentRole = data?.session?.role || 'admin';
  const currentWho = data?.session?.who || '';

  // Calculate live badge counts
  const totalPapers = papers.length;
  const pendingScreening = papers.filter((p) => p.status === 'Under Screening').length;
  const pendingReviews = papers.filter(
    (p) => p.status === 'Sent to Reviewers' || p.status === 'Re-review'
  ).length;
  const pendingPayment = papers.filter((p) => p.status === 'Payment Pending').length;

  const navItems = [
    {
      group: 'Core Management',
      items: [
        {
          to: '/',
          icon: LayoutDashboard,
          label: 'Dashboard',
          exact: true,
        },
        {
          to: '/manuscripts',
          icon: FileText,
          label: 'Manuscripts',
          badge: totalPapers > 0 ? totalPapers : null,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          to: '/submit',
          icon: PlusCircle,
          label: 'New Submission',
          highlight: true,
        },
      ],
    },
    {
      group: 'Peer Review & Evaluation',
      items: [
        {
          to: '/reviewers',
          icon: Users,
          label: 'Reviewers Directory',
          badge: data?.reviewers?.length || null,
        },
        {
          to: '/reviews',
          icon: CheckSquare,
          label: 'Review Desk',
          badge: pendingReviews > 0 ? pendingReviews : null,
          badgeColor: 'bg-indigo-50 text-indigo-700 font-bold',
        },
      ],
    },
    {
      group: 'Finance & Publishing',
      items: [
        {
          to: '/billing',
          icon: CreditCard,
          label: 'APC Billing & Invoices',
          badge: pendingPayment > 0 ? pendingPayment : null,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
        {
          to: '/published',
          icon: BookOpen,
          label: 'Published Library',
        },
      ],
    },
    {
      group: 'Administration',
      items: [
        {
          to: '/settings',
          icon: Settings,
          label: 'System Settings',
        },
        {
          to: '/outbox',
          icon: Mail,
          label: 'Communications Outbox',
          badge: mailCount > 0 ? mailCount : null,
          badgeColor: 'bg-blue-100 text-blue-800',
        },
      ],
    },
  ];

  const handleRoleChange = (role, who) => {
    setSession({ role, who, pid: null });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200/90 z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
              SF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                  ScholarFlow
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                  SRMU
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                IJMAR &amp; IJSPAST Portal
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.group}
              </p>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to) &&
                      (item.to !== '/' || location.pathname === '/');

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50/90 text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Persona Switcher Box at Bottom */}
        <div className="p-4 border-t border-slate-200/90 bg-slate-50/70">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Perspective
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
                {currentRole}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentRole === 'author'
                  ? 'AU'
                  : currentRole === 'reviewer'
                  ? 'RV'
                  : currentRole === 'editor'
                  ? 'ED'
                  : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentRole === 'author'
                    ? (data.users[currentWho]?.name || 'Author View')
                    : currentRole === 'reviewer'
                    ? (data.reviewers.find((r) => r.id === currentWho)?.name || 'Reviewer View')
                    : currentRole === 'editor'
                    ? `Editor (${currentWho || 'IJMAR'})`
                    : 'System Administrator'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentRole === 'admin'
                    ? 'All Permissions'
                    : currentRole === 'editor'
                    ? `${currentWho || 'IJMAR'} Desk`
                    : currentWho || 'Simulated User'}
                </p>
              </div>
            </div>

            <select
              value={`${currentRole}|${currentWho}`}
              onChange={(e) => {
                const [r, w] = e.target.value.split('|');
                handleRoleChange(r, w || undefined);
              }}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-indigo-500"
            >
              <option value="admin|">Admin: System Administrator</option>
              <option value="editor|IJMAR">Editor: IJMAR Chief Editor</option>
              <option value="editor|IJSPAST">Editor: IJSPAST Deputy Editor</option>
              <option value="author|rajesh.kumar@univ.example">Author: Dr. Rajesh Kumar</option>
              <option value="author|anita.sharma@univ.example">Author: Dr. Anita Sharma</option>
              <option value="reviewer|R1">Reviewer: Dr. Meera Iyer (Physics)</option>
              <option value="reviewer|R2">Reviewer: Prof. Sanjay Gupta (CSE)</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
}
