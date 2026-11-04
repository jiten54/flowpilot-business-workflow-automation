/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  getCurrentUser, 
  setCurrentUser, 
  getRequests, 
  getEnquiries, 
  getWorkflows, 
  getNotifications, 
  getAuditLogs, 
  markNotificationRead, 
  resetToInitialData,
  subscribeToStorageChanges
} from './services/storage';
import { User, BusinessRequest, CrmEnquiry, WorkflowDefinition, NotificationItem, AuditLogEntry } from './types';

// Layout
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { MainDashboard } from './components/dashboard/MainDashboard';
import { EmployeeRequests } from './components/requests/EmployeeRequests';
import { RequestDetailsModal } from './components/requests/RequestDetailsModal';
import { NewRequestModal } from './components/requests/NewRequestModal';
import { ApprovalInbox } from './components/approvals/ApprovalInbox';
import { CrmEnquiries } from './components/crm/CrmEnquiries';
import { VisualWorkflowBuilder } from './components/workflow/VisualWorkflowBuilder';
import { AutomationSettings } from './components/automation/AutomationSettings';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AuditLogs } from './components/audit/AuditLogs';
import { UserRoleManagement } from './components/users/UserRoleManagement';
import { AppSettings } from './components/settings/AppSettings';
import { ApiExplorer } from './components/api/ApiExplorer';
import { DelugeLearningHub } from './components/deluge/DelugeLearningHub';
import { TestRunnerView } from './components/testing/TestRunnerView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentUser, setLocalCurrentUser] = useState<User>(getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(getUsers());
  const [requests, setRequests] = useState<BusinessRequest[]>(getRequests());
  const [enquiries, setEnquiries] = useState<CrmEnquiry[]>(getEnquiries());
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(getWorkflows());
  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(getAuditLogs());

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<BusinessRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Sync state with storage service
  const refreshData = () => {
    setLocalCurrentUser(getCurrentUser());
    setAllUsers(getUsers());
    setRequests(getRequests());
    setEnquiries(getEnquiries());
    setWorkflows(getWorkflows());
    setNotifications(getNotifications());
    setAuditLogs(getAuditLogs());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Update selectedRequest reference if open
  useEffect(() => {
    if (selectedRequest) {
      const updated = requests.find(r => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    }
  }, [requests]);

  const handleSwitchUser = (userId: string) => {
    setCurrentUser(userId);
    refreshData();
  };

  const handleResetData = () => {
    resetToInitialData();
    refreshData();
    setSelectedRequest(null);
  };

  // Badge calculations
  const pendingApprovalsForUser = requests.filter(r => {
    if (r.status !== 'SUBMITTED' && r.status !== 'UNDER_REVIEW') return false;
    const currentStep = r.approvalChain[r.currentStepIndex];
    if (!currentStep) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'MANAGER' && currentStep.roleRequired === 'MANAGER') return true;
    return false;
  }).length;

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const openEnquiriesCount = enquiries.filter(e => e.status !== 'RESOLVED' && e.status !== 'CLOSED').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsForUser}
        unreadNotificationsCount={unreadNotificationsCount}
        openEnquiriesCount={openEnquiriesCount}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Contract */}
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          onMarkNotificationRead={(id) => {
            markNotificationRead(id);
            refreshData();
          }}
          onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
          onResetData={handleResetData}
          onNavigateTab={setCurrentTab}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {currentTab === 'dashboard' && (
            <MainDashboard
              currentUser={currentUser}
              requests={requests}
              enquiries={enquiries}
              workflows={workflows}
              onNavigateTab={setCurrentTab}
              onSelectRequest={setSelectedRequest}
              onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
            />
          )}

          {currentTab === 'requests' && (
            <EmployeeRequests
              requests={requests}
              currentUser={currentUser}
              onSelectRequest={setSelectedRequest}
              onOpenNewModal={() => setIsNewRequestModalOpen(true)}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalInbox
              currentUser={currentUser}
              requests={requests}
              onSelectRequest={setSelectedRequest}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'crm' && (
            <CrmEnquiries
              enquiries={enquiries}
              allUsers={allUsers}
              currentUser={currentUser}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'workflow-builder' && (
            <VisualWorkflowBuilder
              workflows={workflows}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'automation-settings' && (
            <AutomationSettings />
          )}

          {currentTab === 'notifications' && (
            <NotificationCenter
              notifications={notifications}
              onRefresh={refreshData}
              onNavigateToRequest={(reqId) => {
                const req = requests.find(r => r.id === reqId);
                if (req) setSelectedRequest(req);
              }}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsDashboard
              requests={requests}
              enquiries={enquiries}
              workflows={workflows}
            />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogs auditLogs={auditLogs} />
          )}

          {currentTab === 'user-roles' && (
            <UserRoleManagement
              users={allUsers}
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {currentTab === 'app-settings' && (
            <AppSettings onResetData={handleResetData} />
          )}

          {currentTab === 'api-explorer' && (
            <ApiExplorer />
          )}

          {currentTab === 'deluge-learning' && (
            <DelugeLearningHub />
          )}

          {currentTab === 'test-runner' && (
            <TestRunnerView />
          )}
        </main>
      </div>

      {/* Global Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onUpdate={refreshData}
        />
      )}

      {/* Global New Request Modal */}
      {isNewRequestModalOpen && (
        <NewRequestModal
          currentUser={currentUser}
          onClose={() => setIsNewRequestModalOpen(false)}
          onCreated={refreshData}
        />
      )}
    </div>
  );
}
