import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Users, 
  GitBranch, 
  Sliders, 
  Bell, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  Code2, 
  GraduationCap, 
  FlaskConical,
  Zap,
  Building2
} from 'lucide-react';
import { User } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'requests'
  | 'approvals'
  | 'crm'
  | 'workflow-builder'
  | 'automation-settings'
  | 'notifications'
  | 'analytics'
  | 'audit-logs'
  | 'user-roles'
  | 'app-settings'
  | 'api-explorer'
  | 'deluge-learning'
  | 'test-runner';

interface NavItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: number;
  badgeVariant?: 'warning' | 'accent';
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User;
  pendingApprovalsCount: number;
  unreadNotificationsCount: number;
  openEnquiriesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  pendingApprovalsCount,
  unreadNotificationsCount,
  openEnquiriesCount,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        {
          id: 'dashboard' as NavTab,
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'requests' as NavTab,
          label: 'Employee Requests',
          icon: FileText,
        },
        {
          id: 'approvals' as NavTab,
          label: 'Approval Inbox',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeVariant: 'warning' as const,
        },
        {
          id: 'crm' as NavTab,
          label: 'CRM Enquiries',
          icon: Building2,
          badge: openEnquiriesCount > 0 ? openEnquiriesCount : undefined,
        },
      ],
    },
    {
      title: 'Automation & Logic',
      items: [
        {
          id: 'workflow-builder' as NavTab,
          label: 'Visual Workflow Builder',
          icon: GitBranch,
        },
        {
          id: 'automation-settings' as NavTab,
          label: 'Automation & SLAs',
          icon: Sliders,
        },
        {
          id: 'notifications' as NavTab,
          label: 'Notification Center',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          badgeVariant: 'accent' as const,
        },
      ],
    },
    {
      title: 'Intelligence & Audit',
      items: [
        {
          id: 'analytics' as NavTab,
          label: 'Analytics & Reports',
          icon: BarChart3,
        },
        {
          id: 'audit-logs' as NavTab,
          label: 'Audit & Activity Logs',
          icon: ShieldAlert,
        },
        {
          id: 'user-roles' as NavTab,
          label: 'User & Role RBAC',
          icon: Users,
        },
      ],
    },
    {
      title: 'Zoho Creator & APIs',
      items: [
        {
          id: 'deluge-learning' as NavTab,
          label: 'Zoho & Deluge Hub',
          icon: GraduationCap,
          highlight: true,
        },
        {
          id: 'api-explorer' as NavTab,
          label: 'REST API & Swagger',
          icon: Code2,
        },
        {
          id: 'test-runner' as NavTab,
          label: 'Automated Test Runner',
          icon: FlaskConical,
        },
        {
          id: 'app-settings' as NavTab,
          label: 'System Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">FlowPilot</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">v2.4</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Anesight Tech Automation</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-slate-800/70'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                        item.badgeVariant === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Current User Quick Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentUser.role === 'ADMIN' ? 'bg-purple-400' :
                currentUser.role === 'MANAGER' ? 'bg-blue-400' :
                currentUser.role === 'SUPPORT' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
