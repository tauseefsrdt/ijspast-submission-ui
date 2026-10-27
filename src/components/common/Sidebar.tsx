import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  BookOpen,
  Send,
  Clock,
  Mail,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const location = useLocation();

  const role = user?.role || 'author';

  // Compute live badges based on role
  const userManuscripts =
    role === 'author'
      ? manuscripts.filter((m) => !user?.email || (m.author?.email && m.author.email.toLowerCase() === user.email.toLowerCase()))
      : manuscripts;

  const submittedCount = userManuscripts.filter((m) => m.status === 'Submitted' || m.status === 'Editor Assessment').length;
  const underReviewCount = userManuscripts.filter(
    (m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned'
  ).length;
  const reviewerAssignedCount = manuscripts.filter(
    (m) =>
      (m.status === 'Under Review' || m.status === 'Reviewer Assigned' || m.status === 'Revision Submitted') &&
      (m.assignedReviewerId === user?.id ||
        m.assignedReviewer2Id === user?.id ||
        (m.assignedReviewerName && user?.name && m.assignedReviewerName.toLowerCase() === user.name.toLowerCase()) ||
        (m.assignedReviewer2Name && user?.name && m.assignedReviewer2Name.toLowerCase() === user.name.toLowerCase()))
  ).length;

  const authorNav = [
    {
      group: 'Author Central',
      items: [
        {
          to: '/author/dashboard',
          icon: LayoutDashboard,
          label: 'Author Dashboard',
          exact: true,
        },
        {
          to: '/submit',
          icon: PlusCircle,
          label: 'Submit Manuscript',
          highlight: true,
        },
        {
          to: '/published',
          icon: BookOpen,
          label: 'Published Archive',
        },
      ],
    },
  ];

  const editorNav = [
    {
      group: 'Editorial Control',
      items: [
        {
          to: '/editor/dashboard',
          icon: LayoutDashboard,
          label: 'Editor Dashboard',
          exact: true,
        },
        {
          to: '/editor/dashboard?filter=Submitted',
          icon: Clock,
          label: 'Incoming Submissions',
          badge: submittedCount > 0 ? submittedCount : null,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
        },
        {
          to: '/editor/dashboard?filter=Under+Review',
          icon: Send,
          label: 'Peer Review Desk',
          badge: underReviewCount > 0 ? underReviewCount : null,
          badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
        },
        {
          to: '/editor/reviewers',
          icon: Users,
          label: 'Reviewer Directory',
        },
        {
          to: '/editor/outbox',
          icon: Mail,
          label: 'Outbox & Notifications',
        },
        {
          to: '/published',
          icon: BookOpen,
          label: 'Published Archive',
        },
      ],
    },
  ];

  const reviewerNav = [
    {
      group: 'Peer Review Desk',
      items: [
        {
          to: '/reviewer/dashboard',
          icon: LayoutDashboard,
          label: 'Assigned Reviews',
          exact: true,
          badge: reviewerAssignedCount > 0 ? reviewerAssignedCount : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        },
        {
          to: '/published',
          icon: BookOpen,
          label: 'Published Archive',
        },
      ],
    },
  ];

  const navSections = role === 'editor' ? editorNav : role === 'reviewer' ? reviewerNav : authorNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar: SRMU Journal Deep Navy & Gold Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-[#071526] text-slate-200 border-r border-slate-800/80 z-40 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0a2540]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#071526] border-2 border-[#f59e0b] text-[#f59e0b] font-serif font-black flex items-center justify-center text-sm shadow-md shrink-0 tracking-tight">
              IJ
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <span className="font-black text-white tracking-tight text-sm block truncate">
                  IJSPAST Portal
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-[10px] text-amber-300/90 font-semibold uppercase tracking-wider truncate">
                    {role === 'editor' ? 'Editorial Admin' : `${role} Workspace`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400/90 select-none">
                  {section.group}
                </p>
              ) : (
                <div className="h-px bg-slate-800 mx-2 my-2" />
              )}
              <div className="space-y-1 mt-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to.split('?')[0]);

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 font-bold border-l-4 border-amber-400 shadow-inner'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors shrink-0 ${
                            isActive
                              ? 'text-amber-400'
                              : 'text-slate-400 group-hover:text-amber-300'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {/* Badge in expanded view */}
                      {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.badgeColor || 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Badge dot in collapsed view */}
                      {isCollapsed && item.badge !== null && item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0a1124]" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Double-Blind Peer Review Assurance Card */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-amber-950/20 to-[#0a2540] border border-amber-500/20 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Double-Blind Peer Review</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Reviewer and author identities strictly masked during evaluation stages.
            </p>
          </div>
        )}

        {/* User Card at bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0a2540]">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 ring-1 ring-amber-300/40 uppercase shadow-xs">
              {user?.name?.[0] || 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-snug">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate leading-none mt-0.5">
                  {user?.email || 'editor@ijspast.org'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
