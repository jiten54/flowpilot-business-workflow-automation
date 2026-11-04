/**
 * Core Domain Types for FlowPilot Business Workflow Automation Platform
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'SUPPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  managerId?: string;
  reportingEmployeeIds?: string[];
}

export type RequestType = 'LEAVE' | 'EXPENSE' | 'EQUIPMENT';

export type RequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  roleRequired: 'MANAGER' | 'ADMIN';
  assignedToUserId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  actionDate?: string;
  actionByUserId?: string;
  actionByName?: string;
  comments?: string;
  rejectionReason?: string;
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface BusinessRequest {
  id: string;
  requestNumber: string; // e.g. REQ-2026-0041
  type: RequestType;
  title: string;
  description: string;
  category: string; // e.g. "Travel & Lodging", "Sick Leave", "Laptop Upgrade"
  amount?: number; // for Expense
  currency?: string; // e.g. "INR (₹)"
  startDate?: string; // for Leave
  endDate?: string;
  daysCount?: number;
  equipmentItem?: string; // for Equipment
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: RequestStatus;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  requesterDepartment: string;
  createdAt: string;
  updatedAt: string;
  approvalChain: ApprovalStep[];
  currentStepIndex: number;
  requiresAdminApproval: boolean; // triggered if amount > 10,000 or category rules
  adminThresholdReason?: string;
  attachments?: Attachment[];
  commentsCount: number;
}

export type EnquiryStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface EnquiryNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CrmEnquiry {
  id: string;
  ticketNumber: string; // e.g. ENQ-2026-102
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  subject: string;
  description: string;
  source: 'WEBSITE' | 'EMAIL' | 'PARTNER_PORTAL' | 'PHONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: EnquiryStatus;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  followUpDate?: string;
  estimatedDealValue?: number;
  notes: EnquiryNote[];
}

export interface WorkflowNode {
  id: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'APPROVAL' | 'NOTIFICATION';
  title: string;
  description: string;
  config: Record<string, any>;
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'EXPENSE' | 'LEAVE' | 'EQUIPMENT' | 'CRM';
  isActive: boolean;
  version: number;
  triggerEvent: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  delugeSnippet: string;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientEmail: string;
  title: string;
  message: string;
  type: 'REQUEST_SUBMITTED' | 'APPROVAL_NEEDED' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'ENQUIRY_ASSIGNED' | 'SLA_BREACH';
  relatedEntityId: string;
  relatedEntityType: 'REQUEST' | 'ENQUIRY' | 'WORKFLOW';
  channel: 'IN_APP' | 'EMAIL' | 'BOTH';
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  isRead: boolean;
  createdAt: string;
  emailTemplate?: {
    subject: string;
    from: string;
    bodyHtml: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'REQUEST' | 'APPROVAL' | 'ENQUIRY' | 'WORKFLOW' | 'SYSTEM' | 'AUTH';
  entityId: string;
  description: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface TestScenarioResult {
  id: string;
  name: string;
  suite: 'VALIDATION' | 'APPROVAL_ENGINE' | 'SECURITY_RBAC' | 'NOTIFICATION' | 'API_INTEGRATION';
  description: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  expected: string;
  actual: string;
  logs: string[];
}
