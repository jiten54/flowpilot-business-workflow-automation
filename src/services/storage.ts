import { 
  User, 
  BusinessRequest, 
  CrmEnquiry, 
  WorkflowDefinition, 
  NotificationItem, 
  AuditLogEntry,
  UserRole
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_REQUESTS, 
  INITIAL_ENQUIRIES, 
  INITIAL_WORKFLOWS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'flowpilot_users_v1',
  CURRENT_USER_ID: 'flowpilot_current_user_id_v1',
  REQUESTS: 'flowpilot_requests_v1',
  ENQUIRIES: 'flowpilot_enquiries_v1',
  WORKFLOWS: 'flowpilot_workflows_v1',
  NOTIFICATIONS: 'flowpilot_notifications_v1',
  AUDIT_LOGS: 'flowpilot_audit_logs_v1',
  EMAIL_CONFIG: 'flowpilot_email_config_v1',
};

// Event-driven change listeners
type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

export const subscribeToStorageChanges = (listener: ChangeListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

// --- Initializer ---
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id); // Default to Rajesh Kumar (Admin)
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKFLOWS)) {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(INITIAL_WORKFLOWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
};

// Run immediate init
initializeStorage();

// --- Users ---
export const getUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const getCurrentUser = (): User => {
  const users = getUsers();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  return users.find(u => u.id === currentId) || users[0];
};

export const setCurrentUser = (userId: string) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  const user = getUsers().find(u => u.id === userId);
  if (user) {
    addAuditLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_SWITCHED',
      entityType: 'AUTH',
      entityId: user.id,
      description: `Active session switched to ${user.name} (${user.role})`,
      outcome: 'SUCCESS',
      ipAddress: '127.0.0.1',
    });
  }
  notifyListeners();
};

// --- Requests ---
export const getRequests = (): BusinessRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
  } catch {
    return INITIAL_REQUESTS;
  }
};

export const saveRequests = (requests: BusinessRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  notifyListeners();
};

export const getRequestById = (id: string): BusinessRequest | undefined => {
  return getRequests().find(r => r.id === id);
};

export const createBusinessRequest = (requestData: Omit<BusinessRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt' | 'approvalChain' | 'currentStepIndex' | 'commentsCount'>): BusinessRequest => {
  const requests = getRequests();
  const currentActor = getCurrentUser();
  const nextNum = requests.length + 43;
  const reqNumber = `REQ-2026-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  // Multi-tier conditional logic rule:
  // If Expense and Amount > 10000, trigger two-step approval: Manager -> Admin
  let requiresAdmin = false;
  let adminReason = '';
  const approvalChain: BusinessRequest['approvalChain'] = [];

  if (requestData.type === 'EXPENSE') {
    if ((requestData.amount || 0) > 10000) {
      requiresAdmin = true;
      adminReason = `Amount exceeds standard approval threshold of ₹10,000 (Submitted: ₹${requestData.amount?.toLocaleString('en-IN')}). Two-tier Manager + Executive Admin review required.`;
      approvalChain.push({
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'PENDING',
      });
      approvalChain.push({
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        roleRequired: 'ADMIN',
        assignedToUserId: 'usr-admin-01',
        status: 'PENDING',
      });
    } else {
      requiresAdmin = false;
      approvalChain.push({
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'PENDING',
      });
    }
  } else if (requestData.type === 'LEAVE') {
    approvalChain.push({
      id: `step-${Date.now()}-1`,
      stepNumber: 1,
      roleRequired: 'MANAGER',
      assignedToUserId: 'usr-mgr-01',
      status: 'PENDING',
    });
  } else {
    // Equipment
    requiresAdmin = true;
    adminReason = 'Hardware requisition requires IT Asset inventory check & Admin allocation.';
    approvalChain.push({
      id: `step-${Date.now()}-1`,
      stepNumber: 1,
      roleRequired: 'MANAGER',
      assignedToUserId: 'usr-mgr-01',
      status: 'PENDING',
    });
    approvalChain.push({
      id: `step-${Date.now()}-2`,
      stepNumber: 2,
      roleRequired: 'ADMIN',
      assignedToUserId: 'usr-admin-01',
      status: 'PENDING',
    });
  }

  const newRequest: BusinessRequest = {
    ...requestData,
    id: `req-${Date.now()}`,
    requestNumber: reqNumber,
    createdAt: now,
    updatedAt: now,
    status: 'SUBMITTED',
    requiresAdminApproval: requiresAdmin,
    adminThresholdReason: adminReason,
    approvalChain,
    currentStepIndex: 0,
    commentsCount: 0,
  };

  requests.unshift(newRequest);
  saveRequests(requests);

  // Notifications
  addNotification({
    recipientId: 'usr-mgr-01',
    recipientEmail: 'priya.sharma@anesight.tech',
    title: `Approval Needed: ${reqNumber}`,
    message: `${newRequest.requesterName} submitted a ${newRequest.type} request: "${newRequest.title}".`,
    type: 'APPROVAL_NEEDED',
    relatedEntityId: newRequest.id,
    relatedEntityType: 'REQUEST',
    channel: 'BOTH',
    status: 'DELIVERED',
    isRead: false,
    emailTemplate: {
      from: 'workflow-engine@anesight.tech',
      subject: `[FlowPilot Action Required] New ${newRequest.type} Request: ${reqNumber}`,
      bodyHtml: `<p>Dear Priya,</p><p>A new request has been submitted requiring your approval:</p><ul><li><strong>Request:</strong> ${reqNumber}</li><li><strong>Requester:</strong> ${newRequest.requesterName}</li><li><strong>Category:</strong> ${newRequest.category}</li>${newRequest.amount ? `<li><strong>Amount:</strong> ₹${newRequest.amount.toLocaleString('en-IN')}</li>` : ''}</ul><p>Please review and approve in FlowPilot.</p>`,
    },
  });

  // Audit Log
  addAuditLog({
    actorId: currentActor.id,
    actorName: currentActor.name,
    actorRole: currentActor.role,
    action: 'REQUEST_CREATED',
    entityType: 'REQUEST',
    entityId: newRequest.requestNumber,
    description: `Submitted ${newRequest.type} request: ${newRequest.title} (${newRequest.category})`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: {
      type: newRequest.type,
      amount: newRequest.amount,
      requiresAdminApproval: requiresAdmin,
      stepsCount: approvalChain.length,
    },
  });

  return newRequest;
};

export const approveBusinessRequest = (
  requestId: string,
  comments: string = ''
): { success: boolean; message: string; request?: BusinessRequest } => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) return { success: false, message: 'Request not found' };

  const req = requests[index];
  const actor = getCurrentUser();
  const currentStep = req.approvalChain[req.currentStepIndex];

  if (!currentStep) {
    return { success: false, message: 'No pending approval step on this request' };
  }

  // Role validation check
  if (currentStep.roleRequired === 'MANAGER' && actor.role !== 'MANAGER' && actor.role !== 'ADMIN') {
    addAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UNAUTHORIZED_APPROVAL_ATTEMPT',
      entityType: 'APPROVAL',
      entityId: req.requestNumber,
      description: `Unauthorized approval attempt: Step requires ${currentStep.roleRequired} but actor is ${actor.role}`,
      outcome: 'FAILURE',
      ipAddress: '103.21.244.18',
    });
    return { success: false, message: `Access Denied: Step 1 requires Manager role. Current role: ${actor.role}` };
  }

  if (currentStep.roleRequired === 'ADMIN' && actor.role !== 'ADMIN') {
    addAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UNAUTHORIZED_APPROVAL_ATTEMPT',
      entityType: 'APPROVAL',
      entityId: req.requestNumber,
      description: `Unauthorized approval attempt: Step 2 requires Executive ADMIN sign-off. Actor is ${actor.role}`,
      outcome: 'FAILURE',
      ipAddress: '103.21.244.18',
    });
    return { success: false, message: `Access Denied: Step 2 requires Executive Admin sign-off for amounts > ₹10,000.` };
  }

  // Execute approval on current step
  currentStep.status = 'APPROVED';
  currentStep.actionDate = new Date().toISOString();
  currentStep.actionByUserId = actor.id;
  currentStep.actionByName = `${actor.name} (${actor.role})`;
  currentStep.comments = comments || 'Approved in accordance with company policy.';

  const isLastStep = req.currentStepIndex >= req.approvalChain.length - 1;

  if (isLastStep) {
    req.status = 'APPROVED';
    req.updatedAt = new Date().toISOString();

    // Notify Requester
    addNotification({
      recipientId: req.requesterId,
      recipientEmail: 'ananya.sen@anesight.tech',
      title: `Request Approved: ${req.requestNumber}`,
      message: `Your request "${req.title}" has received final approval from ${actor.name}.`,
      type: 'REQUEST_APPROVED',
      relatedEntityId: req.id,
      relatedEntityType: 'REQUEST',
      channel: 'BOTH',
      status: 'DELIVERED',
      isRead: false,
      emailTemplate: {
        from: 'workflow-engine@anesight.tech',
        subject: `[FlowPilot Final Approval] Your Request ${req.requestNumber} is Approved`,
        bodyHtml: `<p>Congratulations,</p><p>Your request <strong>${req.requestNumber}</strong> (${req.title}) has been fully approved.</p><p><strong>Approver Notes:</strong> ${currentStep.comments}</p>`,
      },
    });

    addAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'FINAL_APPROVAL_GRANTED',
      entityType: 'APPROVAL',
      entityId: req.requestNumber,
      description: `Final approval granted on ${req.requestNumber} by ${actor.name} (${actor.role}). Status updated to APPROVED.`,
      outcome: 'SUCCESS',
      ipAddress: '103.21.244.18',
      metadata: { comments, totalAmount: req.amount },
    });
  } else {
    // Escalate to next step (e.g. Admin)
    req.currentStepIndex += 1;
    req.status = 'UNDER_REVIEW';
    req.updatedAt = new Date().toISOString();
    const nextStep = req.approvalChain[req.currentStepIndex];

    addNotification({
      recipientId: 'usr-admin-01',
      recipientEmail: 'rajesh.kumar@anesight.tech',
      title: `Step 2 Approval Required: ${req.requestNumber}`,
      message: `Step 1 was approved by ${actor.name}. High-value executive sign-off required for ${req.requestNumber}.`,
      type: 'APPROVAL_NEEDED',
      relatedEntityId: req.id,
      relatedEntityType: 'REQUEST',
      channel: 'BOTH',
      status: 'DELIVERED',
      isRead: false,
    });

    addAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'APPROVAL_STEP_ESCALATED',
      entityType: 'APPROVAL',
      entityId: req.requestNumber,
      description: `Step ${currentStep.stepNumber} approved. Request escalated to Step ${nextStep.stepNumber} (${nextStep.roleRequired}).`,
      outcome: 'SUCCESS',
      ipAddress: '103.21.244.18',
      metadata: { completedStep: currentStep.stepNumber, nextStep: nextStep.stepNumber, comments },
    });
  }

  saveRequests(requests);
  return { success: true, message: isLastStep ? 'Final approval granted successfully!' : 'Step approved and escalated to next level!', request: req };
};

export const rejectBusinessRequest = (
  requestId: string,
  rejectionReason: string
): { success: boolean; message: string; request?: BusinessRequest } => {
  if (!rejectionReason || rejectionReason.trim().length < 5) {
    return { success: false, message: 'A specific rejection reason of at least 5 characters is required by compliance policy.' };
  }

  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) return { success: false, message: 'Request not found' };

  const req = requests[index];
  const actor = getCurrentUser();
  const currentStep = req.approvalChain[req.currentStepIndex];

  if (!currentStep) return { success: false, message: 'No active approval step' };

  currentStep.status = 'REJECTED';
  currentStep.actionDate = new Date().toISOString();
  currentStep.actionByUserId = actor.id;
  currentStep.actionByName = `${actor.name} (${actor.role})`;
  currentStep.rejectionReason = rejectionReason;

  req.status = 'REJECTED';
  req.updatedAt = new Date().toISOString();

  // Notify Requester
  addNotification({
    recipientId: req.requesterId,
    recipientEmail: 'ananya.sen@anesight.tech',
    title: `Request Rejected: ${req.requestNumber}`,
    message: `Your request "${req.title}" was rejected by ${actor.name}. Reason: ${rejectionReason}`,
    type: 'REQUEST_REJECTED',
    relatedEntityId: req.id,
    relatedEntityType: 'REQUEST',
    channel: 'BOTH',
    status: 'DELIVERED',
    isRead: false,
    emailTemplate: {
      from: 'workflow-engine@anesight.tech',
      subject: `[FlowPilot Notification] Request ${req.requestNumber} Rejected`,
      bodyHtml: `<p>Hello,</p><p>Your request <strong>${req.requestNumber}</strong> has been rejected by ${actor.name}.</p><p><strong>Reason:</strong> ${rejectionReason}</p>`,
    },
  });

  addAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'REQUEST_REJECTED',
    entityType: 'APPROVAL',
    entityId: req.requestNumber,
    description: `Request ${req.requestNumber} rejected by ${actor.name}. Reason: "${rejectionReason}"`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: { rejectionReason, stepNumber: currentStep.stepNumber },
  });

  saveRequests(requests);
  return { success: true, message: 'Request has been rejected and applicant notified.', request: req };
};

export const withdrawBusinessRequest = (requestId: string): { success: boolean; message: string } => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) return { success: false, message: 'Request not found' };

  const req = requests[index];
  const actor = getCurrentUser();

  if (req.status === 'APPROVED') {
    return { success: false, message: 'Approved requests cannot be withdrawn.' };
  }

  req.status = 'CANCELLED';
  req.updatedAt = new Date().toISOString();

  addAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'REQUEST_WITHDRAWN',
    entityType: 'REQUEST',
    entityId: req.requestNumber,
    description: `Request ${req.requestNumber} was withdrawn/cancelled by ${actor.name}`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
  });

  saveRequests(requests);
  return { success: true, message: 'Request has been successfully withdrawn.' };
};

// --- CRM Enquiries ---
export const getEnquiries = (): CrmEnquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return raw ? JSON.parse(raw) : INITIAL_ENQUIRIES;
  } catch {
    return INITIAL_ENQUIRIES;
  }
};

export const saveEnquiries = (enquiries: CrmEnquiry[]) => {
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  notifyListeners();
};

export const createEnquiry = (enquiryData: Omit<CrmEnquiry, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'notes'>): CrmEnquiry => {
  const enquiries = getEnquiries();
  const actor = getCurrentUser();
  const nextNum = enquiries.length + 105;
  const ticketNumber = `ENQ-2026-${String(nextNum).padStart(4, '0')}`;
  const now = new Date().toISOString();

  // Workflow auto-assignment rule: if deal value > 500,000, assign to Vikram Patel
  let assignedToId = enquiryData.assignedToId;
  let assignedToName = enquiryData.assignedToName;
  let priority = enquiryData.priority;

  if ((enquiryData.estimatedDealValue || 0) >= 500000) {
    assignedToId = 'usr-sup-01';
    assignedToName = 'Vikram Patel';
    priority = 'HIGH';
  }

  const newEnquiry: CrmEnquiry = {
    ...enquiryData,
    id: `enq-${Date.now()}`,
    ticketNumber,
    priority,
    assignedToId,
    assignedToName,
    createdAt: now,
    updatedAt: now,
    notes: [
      {
        id: `note-${Date.now()}`,
        authorId: actor.id,
        authorName: actor.name,
        content: `Enquiry logged via ${enquiryData.source}. Automated workflow evaluation initialized.`,
        createdAt: now,
      }
    ],
  };

  enquiries.unshift(newEnquiry);
  saveEnquiries(enquiries);

  addAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'ENQUIRY_CREATED',
    entityType: 'ENQUIRY',
    entityId: ticketNumber,
    description: `Registered CRM enquiry from ${newEnquiry.customerName} (${newEnquiry.companyName})`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: {
      dealValue: newEnquiry.estimatedDealValue,
      assignedTo: assignedToName,
    },
  });

  return newEnquiry;
};

export const addEnquiryNote = (enquiryId: string, content: string) => {
  const enquiries = getEnquiries();
  const item = enquiries.find(e => e.id === enquiryId);
  if (!item) return;

  const actor = getCurrentUser();
  item.notes.push({
    id: `note-${Date.now()}`,
    authorId: actor.id,
    authorName: actor.name,
    content,
    createdAt: new Date().toISOString(),
  });
  item.updatedAt = new Date().toISOString();

  addAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'ENQUIRY_NOTE_ADDED',
    entityType: 'ENQUIRY',
    entityId: item.ticketNumber,
    description: `Added note to enquiry ${item.ticketNumber}`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
  });

  saveEnquiries(enquiries);
};

export const updateEnquiryStatus = (enquiryId: string, status: CrmEnquiry['status']) => {
  const enquiries = getEnquiries();
  const item = enquiries.find(e => e.id === enquiryId);
  if (!item) return;

  const oldStatus = item.status;
  item.status = status;
  item.updatedAt = new Date().toISOString();

  addAuditLog({
    actorId: getCurrentUser().id,
    actorName: getCurrentUser().name,
    actorRole: getCurrentUser().role,
    action: 'ENQUIRY_STATUS_CHANGED',
    entityType: 'ENQUIRY',
    entityId: item.ticketNumber,
    description: `Changed status from ${oldStatus} to ${status}`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: { oldStatus, newStatus: status },
  });

  saveEnquiries(enquiries);
};

// --- Workflows ---
export const getWorkflows = (): WorkflowDefinition[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return raw ? JSON.parse(raw) : INITIAL_WORKFLOWS;
  } catch {
    return INITIAL_WORKFLOWS;
  }
};

export const saveWorkflows = (workflows: WorkflowDefinition[]) => {
  localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  notifyListeners();
};

export const toggleWorkflowActive = (workflowId: string): boolean => {
  const workflows = getWorkflows();
  const wf = workflows.find(w => w.id === workflowId);
  if (!wf) return false;

  wf.isActive = !wf.isActive;
  saveWorkflows(workflows);

  addAuditLog({
    actorId: getCurrentUser().id,
    actorName: getCurrentUser().name,
    actorRole: getCurrentUser().role,
    action: wf.isActive ? 'WORKFLOW_ACTIVATED' : 'WORKFLOW_DEACTIVATED',
    entityType: 'WORKFLOW',
    entityId: wf.code,
    description: `${wf.name} set to ${wf.isActive ? 'ACTIVE' : 'INACTIVE'}`,
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
  });

  return wf.isActive;
};

// --- Notifications ---
export const getNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => {
  const items = getNotifications();
  const newItem: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
  notifyListeners();
};

export const markNotificationRead = (id: string) => {
  const items = getNotifications();
  const target = items.find(n => n.id === id);
  if (target) {
    target.isRead = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
    notifyListeners();
  }
};

export const markAllNotificationsRead = () => {
  const items = getNotifications().map(n => ({ ...n, isRead: true }));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
  notifyListeners();
};

export const retryNotification = (id: string): boolean => {
  const items = getNotifications();
  const target = items.find(n => n.id === id);
  if (target) {
    target.status = 'DELIVERED';
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
    notifyListeners();
    addAuditLog({
      actorId: getCurrentUser().id,
      actorName: getCurrentUser().name,
      actorRole: getCurrentUser().role,
      action: 'NOTIFICATION_RETRIED',
      entityType: 'SYSTEM',
      entityId: id,
      description: `Re-dispatched notification to ${target.recipientEmail}. Delivery confirmed.`,
      outcome: 'SUCCESS',
      ipAddress: '103.21.244.18',
    });
    return true;
  }
  return false;
};

// --- Audit Logs ---
export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const logs = getAuditLogs();
  const newLog: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Cap at 200 items in local storage
  if (logs.length > 200) logs.pop();
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  notifyListeners();
};

// Reset to factory state
export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
  localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(INITIAL_WORKFLOWS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  notifyListeners();
};
