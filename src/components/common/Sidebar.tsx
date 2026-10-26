import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  CheckSquare,
  BookOpen,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  Mail,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { manuscripts } = useAppSelector((state) => state.manuscripts);
  const location = useLocation();

  const role = user?.role || 'author';

  // Compute live badges based on authenticated role and manuscripts
  const userManuscripts =
    role === 'author'
      ? manuscripts.filter((m) => !user?.email || (m.author?.email && m.author.email.toLowerCase() === user.email.toLowerCase()))
      : manuscripts;

  const submittedCount = userManuscripts.filter((m) => m.status === 'Submitted').length;
  const underReviewCount = userManuscripts.filter(
    (m) => m.status === 'Under Review' || m.status === 'Reviewer Assigned'
  ).length;
  const authorRevisionCount = manuscripts.filter(
    (m) => m.status === 'Revision Requested' && (!user?.email || (m.author?.email && m.author.email.toLowerCase() === user.email.toLowerCase()))
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
          label: 'Submit Manuscript (Public Portal)',
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
      group: 'Editorial Management',
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
          badgeColor: 'bg-blue-100 text-blue-800',
        },
        {
          to: '/editor/dashboard?filter=Under+Review',
          icon: Send,
          label: 'Under Peer Review',
          badge: underReviewCount > 0 ? underReviewCount : null,
          badgeColor: 'bg-purple-100 text-purple-800',
        },
        {
          to: '/editor/reviewers',
          icon: Users,
          label: 'Reviewer Directory',
        },
        {
          to: '/editor/outbox',
          icon: Mail,
          label: 'Outbox & Credentials',
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
      group: 'Review Desk',
      items: [
        {
          to: '/reviewer/dashboard',
          icon: LayoutDashboard,
          label: 'Assigned Reviews',
          exact: true,
          badge: reviewerAssignedCount > 0 ? reviewerAssignedCount : null,
          badgeColor: 'bg-amber-100 text-amber-800',
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/90 z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0d3b6e] text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-xs">
              IJ
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                IJSPAST Portal
              </span>
              <p className="text-[10px] text-slate-400 font-medium capitalize">
                {role} Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.group}
              </p>
              <div className="space-y-0.5 mt-1">
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

                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-200/90 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
