import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ExternalLink,
  Shield,
  Briefcase,
  UserCheck,
  Headphones
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenNewRequestModal: () => void;
  onResetData: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  allUsers,
  onSwitchUser,
  notifications,
  onMarkNotificationRead,
  onOpenNewRequestModal,
  onResetData,
  onNavigateTab,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabLabels: Record<NavTab, { section: string; title: string }> = {
    dashboard: { section: 'Operations', title: 'Executive Dashboard' },
    requests: { section: 'Operations', title: 'Employee Request Management' },
    approvals: { section: 'Operations', title: 'Multi-Level Approval Inbox' },
    crm: { section: 'Operations', title: 'CRM Customer Enquiries' },
    'workflow-builder': { section: 'Automation & Logic', title: 'Visual Workflow Builder' },
    'automation-settings': { section: 'Automation & Logic', title: 'Automation Rules & SLA Settings' },
    notifications: { section: 'Automation & Logic', title: 'Notification Center & Email Dispatch' },
    analytics: { section: 'Intelligence & Audit', title: 'Analytics & Reporting Dashboard' },
    'audit-logs': { section: 'Intelligence & Audit', title: 'System Audit & Activity Logs' },
    'user-roles': { section: 'Intelligence & Audit', title: 'User Directory & RBAC Matrix' },
    'app-settings': { section: 'System', title: 'Application & Email Settings' },
    'api-explorer': { section: 'Zoho Creator & APIs', title: 'Interactive REST API Explorer' },
    'deluge-learning': { section: 'Zoho Creator & APIs', title: 'Zoho Creator & Deluge Learning Hub' },
    'test-runner': { section: 'Quality Assurance', title: 'Automated Test Suite Runner' },
  };

  const currentLabel = tabLabels[currentTab] || { section: 'FlowPilot', title: 'Workspace' };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'MANAGER': return Briefcase;
      case 'SUPPORT': return Headphones;
      default: return UserCheck;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shrink-0">
      {/* Breadcrumbs (Left) */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{currentLabel.section}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-semibold text-slate-800">{currentLabel.title}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data button */}
        <button
          onClick={() => {
            if (window.confirm('Reset FlowPilot database to realistic sample data state?')) {
              onResetData();
            }
          }}
          title="Reset database to default seed data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-xs">Reset Sample Data</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <span className="text-[11px] text-slate-400 font-normal">Active Role:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
              {currentUser.role}
            </span>
          </button>

          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Simulate User Role
              </div>
              <div className="p-1 space-y-1">
                {allUsers.map(user => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div className="truncate">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                            <RoleIcon className="w-3 h-3 text-slate-400" />
                            {user.role} · {user.department.split('&')[0]}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {showNotifMenu && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100"
              onMouseLeave={() => setShowNotifMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount} new)</span>
                <button
                  onClick={() => {
                    onNavigateTab('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 4).map(n => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px]">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 text-[11px]">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Request Primary Button */}
        <button
          onClick={onOpenNewRequestModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>
    </header>
  );
};
