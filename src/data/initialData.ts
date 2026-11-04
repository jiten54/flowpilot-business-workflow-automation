import { User, BusinessRequest, CrmEnquiry, WorkflowDefinition, NotificationItem, AuditLogEntry } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@anesight.tech',
    role: 'ADMIN',
    department: 'Executive Management & Finance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    reportingEmployeeIds: ['usr-mgr-01', 'usr-sup-01'],
  },
  {
    id: 'usr-mgr-01',
    name: 'Priya Sharma',
    email: 'priya.sharma@anesight.tech',
    role: 'MANAGER',
    department: 'Engineering & Delivery',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-admin-01',
    reportingEmployeeIds: ['usr-emp-01', 'usr-emp-02'],
  },
  {
    id: 'usr-emp-01',
    name: 'Ananya Sen',
    email: 'ananya.sen@anesight.tech',
    role: 'EMPLOYEE',
    department: 'Engineering & Delivery',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-mgr-01',
  },
  {
    id: 'usr-sup-01',
    name: 'Vikram Patel',
    email: 'vikram.patel@anesight.tech',
    role: 'SUPPORT',
    department: 'Client Success & CRM Ops',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr-admin-01',
  },
];

export const INITIAL_REQUESTS: BusinessRequest[] = [
  {
    id: 'req-001',
    requestNumber: 'REQ-2026-0041',
    type: 'EXPENSE',
    title: 'Cloud Infrastructure & Kubernetes Certification Training',
    description: 'Course enrollment fees and certification exam vouchers for CKAD & CKA for team technical upskilling.',
    category: 'Training & Development',
    amount: 48500,
    currency: 'INR (₹)',
    urgency: 'HIGH',
    status: 'UNDER_REVIEW',
    requesterId: 'usr-emp-01',
    requesterName: 'Ananya Sen',
    requesterRole: 'EMPLOYEE',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-11-02T10:30:00Z',
    updatedAt: '2026-11-03T09:15:00Z',
    requiresAdminApproval: true,
    adminThresholdReason: 'Amount exceeds ₹10,000 threshold (Current: ₹48,500). Dual-approval required: Manager + Admin.',
    currentStepIndex: 1, // Manager approved, waiting for Admin
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'APPROVED',
        actionDate: '2026-11-02T14:45:00Z',
        actionByUserId: 'usr-mgr-01',
        actionByName: 'Priya Sharma (Engineering Lead)',
        comments: 'Recommended. This aligns with our Q4 client deliverables for cloud automation migration.',
      },
      {
        id: 'step-02',
        stepNumber: 2,
        roleRequired: 'ADMIN',
        assignedToUserId: 'usr-admin-01',
        status: 'PENDING',
        comments: 'Pending executive sign-off and finance voucher validation.',
      },
    ],
    attachments: [
      { name: 'LinuxFoundation_Invoice_Quote.pdf', size: '1.4 MB', type: 'application/pdf' },
      { name: 'Course_Curriculum_Syllabus.pdf', size: '840 KB', type: 'application/pdf' }
    ],
    commentsCount: 2,
  },
  {
    id: 'req-002',
    requestNumber: 'REQ-2026-0042',
    type: 'LEAVE',
    title: 'Annual Family Leave & Festival Travel',
    description: 'Taking planned paid annual leaves to visit family during cultural celebrations.',
    category: 'Paid Annual Leave',
    startDate: '2026-11-12',
    endDate: '2026-11-17',
    daysCount: 5,
    urgency: 'MEDIUM',
    status: 'SUBMITTED',
    requesterId: 'usr-emp-01',
    requesterName: 'Ananya Sen',
    requesterRole: 'EMPLOYEE',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-11-03T08:00:00Z',
    updatedAt: '2026-11-03T08:00:00Z',
    requiresAdminApproval: false,
    currentStepIndex: 0,
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'PENDING',
      },
    ],
    attachments: [],
    commentsCount: 0,
  },
  {
    id: 'req-003',
    requestNumber: 'REQ-2026-0039',
    type: 'EXPENSE',
    title: 'Client Lunch & Onsite Solution Review Meeting',
    description: 'Executive lunch hosting key architects from Tata Digital Labs regarding the workflow automation project.',
    category: 'Client Relations & Dining',
    amount: 6800,
    currency: 'INR (₹)',
    urgency: 'MEDIUM',
    status: 'APPROVED',
    requesterId: 'usr-mgr-01',
    requesterName: 'Priya Sharma',
    requesterRole: 'MANAGER',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-10-28T14:20:00Z',
    updatedAt: '2026-10-29T11:00:00Z',
    requiresAdminApproval: false,
    currentStepIndex: 0,
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'ADMIN',
        assignedToUserId: 'usr-admin-01',
        status: 'APPROVED',
        actionDate: '2026-10-29T11:00:00Z',
        actionByUserId: 'usr-admin-01',
        actionByName: 'Rajesh Kumar (Director)',
        comments: 'Approved. Great progress with the Tata accounts team.',
      },
    ],
    attachments: [
      { name: 'Restaurant_Tax_Receipt_1029.pdf', size: '520 KB', type: 'application/pdf' }
    ],
    commentsCount: 1,
  },
  {
    id: 'req-004',
    requestNumber: 'REQ-2026-0038',
    type: 'EQUIPMENT',
    title: 'Dual 27-inch 4K Color-Accurate Monitors & Docking Hub',
    description: 'Hardware upgrade for dual monitors and Thunderbolt 4 hub for development efficiency and multitasking.',
    category: 'Hardware Upgrade',
    equipmentItem: 'Dell UltraSharp 27" 4K Monitor + CalDigit TS4 Dock',
    urgency: 'HIGH',
    status: 'UNDER_REVIEW',
    requesterId: 'usr-emp-01',
    requesterName: 'Ananya Sen',
    requesterRole: 'EMPLOYEE',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-10-25T11:15:00Z',
    updatedAt: '2026-10-26T16:30:00Z',
    requiresAdminApproval: true,
    adminThresholdReason: 'Hardware asset requisition valued at > ₹35,000 requires IT Admin approval.',
    currentStepIndex: 1,
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'APPROVED',
        actionDate: '2026-10-26T16:30:00Z',
        actionByUserId: 'usr-mgr-01',
        actionByName: 'Priya Sharma (Engineering Lead)',
        comments: 'Verified team equipment lifecycle eligibility. Approved from department budget.',
      },
      {
        id: 'step-02',
        stepNumber: 2,
        roleRequired: 'ADMIN',
        assignedToUserId: 'usr-admin-01',
        status: 'PENDING',
        comments: 'Procurement checking authorized Dell vendor stock availability.',
      },
    ],
    attachments: [
      { name: 'IT_Asset_Eligibility_Checklist.pdf', size: '310 KB', type: 'application/pdf' }
    ],
    commentsCount: 2,
  },
  {
    id: 'req-005',
    requestNumber: 'REQ-2026-0035',
    type: 'LEAVE',
    title: 'Sick Leave - Medical Procedure & Recovery',
    description: 'Outpatient orthopedic procedure and physician recommended rest period.',
    category: 'Sick / Medical Leave',
    startDate: '2026-10-18',
    endDate: '2026-10-19',
    daysCount: 2,
    urgency: 'CRITICAL',
    status: 'APPROVED',
    requesterId: 'usr-emp-01',
    requesterName: 'Ananya Sen',
    requesterRole: 'EMPLOYEE',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-10-17T18:00:00Z',
    updatedAt: '2026-10-18T07:30:00Z',
    requiresAdminApproval: false,
    currentStepIndex: 0,
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'APPROVED',
        actionDate: '2026-10-18T07:30:00Z',
        actionByUserId: 'usr-mgr-01',
        actionByName: 'Priya Sharma',
        comments: 'Take care and get well soon. Tasks delegated to Nikhil.',
      },
    ],
    attachments: [
      { name: 'Doctor_Consultation_Note.pdf', size: '280 KB', type: 'application/pdf' }
    ],
    commentsCount: 1,
  },
  {
    id: 'req-006',
    requestNumber: 'REQ-2026-0031',
    type: 'EXPENSE',
    title: 'Off-site Team Gaming Lounge & Dinner Reimbursement',
    description: 'Post-release informal team dinner and entertainment venue reservation.',
    category: 'Team Bonding & Entertainment',
    amount: 19500,
    currency: 'INR (₹)',
    urgency: 'LOW',
    status: 'REJECTED',
    requesterId: 'usr-emp-01',
    requesterName: 'Ananya Sen',
    requesterRole: 'EMPLOYEE',
    requesterDepartment: 'Engineering & Delivery',
    createdAt: '2026-10-10T15:00:00Z',
    updatedAt: '2026-10-12T10:45:00Z',
    requiresAdminApproval: true,
    adminThresholdReason: 'Amount exceeds ₹10,000 threshold.',
    currentStepIndex: 0,
    approvalChain: [
      {
        id: 'step-01',
        stepNumber: 1,
        roleRequired: 'MANAGER',
        assignedToUserId: 'usr-mgr-01',
        status: 'REJECTED',
        actionDate: '2026-10-12T10:45:00Z',
        actionByUserId: 'usr-mgr-01',
        actionByName: 'Priya Sharma',
        rejectionReason: 'Requires prior written pre-approval before booking informal entertainment venues as per company travel & expense policy section 4.2.',
      },
    ],
    attachments: [
      { name: 'Lounge_Receipt_Scanned.pdf', size: '420 KB', type: 'application/pdf' }
    ],
    commentsCount: 1,
  }
];

export const INITIAL_ENQUIRIES: CrmEnquiry[] = [
  {
    id: 'enq-101',
    ticketNumber: 'ENQ-2026-0101',
    customerName: 'Aditya Birla Group - Innovation Wing',
    customerEmail: 's.nair@adityabirla.com',
    customerPhone: '+91 98201 44512',
    companyName: 'Aditya Birla Enterprise',
    subject: 'Enterprise Workflow Engine & Zoho Creator Migration',
    description: 'Looking to automate multi-tiered CAPEX approval workflows, vendor onboarding forms, and integrate with their SAP ERP via REST APIs.',
    source: 'WEBSITE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToId: 'usr-sup-01',
    assignedToName: 'Vikram Patel',
    createdAt: '2026-11-01T11:00:00Z',
    updatedAt: '2026-11-03T14:30:00Z',
    followUpDate: '2026-11-06',
    estimatedDealValue: 1250000,
    notes: [
      {
        id: 'n-1',
        authorId: 'usr-sup-01',
        authorName: 'Vikram Patel',
        content: 'Conducted initial discovery call with Mr. Suresh Nair. High intent. Prepared a tailored architecture deck showcasing Deluge script equivalent logic and PostgreSQL data pipelines.',
        createdAt: '2026-11-01T16:00:00Z',
      },
      {
        id: 'n-2',
        authorId: 'usr-admin-01',
        authorName: 'Rajesh Kumar',
        content: 'Offer a 15-day proof of concept demonstrating the ₹10,000 threshold approval automation rule.',
        createdAt: '2026-11-02T10:15:00Z',
      }
    ],
  },
  {
    id: 'enq-102',
    ticketNumber: 'ENQ-2026-0102',
    customerName: 'Kavita Menon',
    customerEmail: 'kavita@zenithlogistics.in',
    customerPhone: '+91 97112 88491',
    companyName: 'Zenith Fleet & Logistics',
    subject: 'Driver Manifest Automation & Real-time Webhooks',
    description: 'Requires an automated ticketing system where warehouse dispatch requests get auto-routed to regional supervisors with SMS and email notifications.',
    source: 'EMAIL',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    assignedToId: 'usr-sup-01',
    assignedToName: 'Vikram Patel',
    createdAt: '2026-11-02T09:30:00Z',
    updatedAt: '2026-11-02T11:00:00Z',
    followUpDate: '2026-11-05',
    estimatedDealValue: 620000,
    notes: [
      {
        id: 'n-3',
        authorId: 'usr-sup-01',
        authorName: 'Vikram Patel',
        content: 'Sent initial intake questionnaire and compliance requirements.',
        createdAt: '2026-11-02T11:00:00Z',
      }
    ],
  },
  {
    id: 'enq-103',
    ticketNumber: 'ENQ-2026-0103',
    customerName: 'Dr. Rohan Deshmukh',
    customerEmail: 'rdeshmukh@apexhealthcare.org',
    customerPhone: '+91 94220 19340',
    companyName: 'Apex Multi-Specialty Clinics',
    subject: 'Staff Shift Management & Doctor Leave Approvals',
    description: 'Medical clinic group needing automated emergency shift swapping and multi-manager medical leave approval workflows with audit logs.',
    source: 'PARTNER_PORTAL',
    priority: 'HIGH',
    status: 'NEW',
    createdAt: '2026-11-03T16:45:00Z',
    updatedAt: '2026-11-03T16:45:00Z',
    followUpDate: '2026-11-04',
    estimatedDealValue: 850000,
    notes: [],
  },
  {
    id: 'enq-104',
    ticketNumber: 'ENQ-2026-0104',
    customerName: 'Meera Chawla',
    customerEmail: 'meera.c@cloudscale-saas.com',
    customerPhone: '+91 98840 55192',
    companyName: 'CloudScale SaaS Solutions',
    subject: 'CRM Webhook Failure & Retry Logic Consultation',
    description: 'Technical advisory request regarding idempotent webhook handling and automated retry queues in Zoho Catalyst serverless microservices.',
    source: 'WEBSITE',
    priority: 'LOW',
    status: 'RESOLVED',
    assignedToId: 'usr-sup-01',
    assignedToName: 'Vikram Patel',
    createdAt: '2026-10-24T14:00:00Z',
    updatedAt: '2026-10-26T17:20:00Z',
    followUpDate: '2026-10-26',
    estimatedDealValue: 180000,
    notes: [
      {
        id: 'n-4',
        authorId: 'usr-sup-01',
        authorName: 'Vikram Patel',
        content: 'Delivered sample code for exponential backoff retry in Deluge invokeurl and Node.js webhook listeners. Customer confirmed resolution.',
        createdAt: '2026-10-26T17:20:00Z',
      }
    ],
  }
];

export const INITIAL_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-001',
    code: 'WF-EXP-MULTI',
    name: 'Multi-Level Expense Approval Engine',
    description: 'Evaluates submitted expense claims. If the amount exceeds ₹10,000, triggers dual-level approval (Manager + Executive Finance Admin). Otherwise auto-routes to direct Manager.',
    category: 'EXPENSE',
    isActive: true,
    version: 3,
    triggerEvent: 'ON_EXPENSE_SUBMITTED',
    executionCount: 142,
    lastExecutedAt: '2026-11-02T10:30:00Z',
    nodes: [
      {
        id: 'node-1',
        type: 'TRIGGER',
        title: 'Expense Request Submitted',
        description: 'Fired when an employee submits an expense reimbursement form',
        config: { form: 'Expense_Reimbursement_Form', event: 'on_success' },
        x: 60,
        y: 80,
      },
      {
        id: 'node-2',
        type: 'CONDITION',
        title: 'Amount > ₹10,000 ?',
        description: 'Checks whether amount exceeds the corporate finance review threshold',
        config: { field: 'amount', operator: 'GREATER_THAN', value: 10000 },
        x: 320,
        y: 80,
      },
      {
        id: 'node-3',
        type: 'APPROVAL',
        title: 'Tier 1: Manager Review',
        description: 'Direct reporting manager validates receipts and business rationale',
        config: { role: 'MANAGER', slaHours: 24 },
        x: 580,
        y: 40,
      },
      {
        id: 'node-4',
        type: 'APPROVAL',
        title: 'Tier 2: Admin / Finance Sign-off',
        description: 'Director / Executive Finance approval required for high-value claims',
        config: { role: 'ADMIN', slaHours: 48, condition: 'Tier 1 Approved' },
        x: 840,
        y: 40,
      },
      {
        id: 'node-5',
        type: 'NOTIFICATION',
        title: 'Notify Requester & Record Audit',
        description: 'Sends email & in-app notification with decision comments and writes audit log',
        config: { channels: ['EMAIL', 'IN_APP'], template: 'DECISION_ANNOUNCEMENT' },
        x: 1100,
        y: 80,
      },
    ],
    edges: [
      { id: 'e1', source: 'node-1', target: 'node-2' },
      { id: 'e2', source: 'node-2', target: 'node-3', label: 'All Expenses' },
      { id: 'e3', source: 'node-3', target: 'node-4', label: 'If Amount > ₹10k' },
      { id: 'e4', source: 'node-4', target: 'node-5', label: 'On Decision' },
    ],
    delugeSnippet: `// FlowPilot Workflow WF-EXP-MULTI: Multi-Level Approval
void Workflow_Expense_Approval(int requestId, decimal amount, int managerId) 
{
    // 1. Validate submission parameters
    if (amount <= 0) {
        alert "Invalid reimbursement amount. Must be greater than zero.";
        cancel submit;
    }
    
    // 2. Fetch employee profile & manager
    empRecord = Employee_Directory[ID == zoho.loginuserid];
    
    // 3. Conditional Multi-Tier Routing
    if (amount > 10000) 
    {
        // High-Value Request: Two-Step Approval Chain
        update Record Expense_Request [ID == requestId] {
            Approval_Status = "Under Review",
            Requires_Admin_Approval = true,
            Current_Approval_Level = 1
        };
        
        // Notify Manager for Step 1
        sendmail [
            from: zoho.adminuserid
            to: empRecord.Manager_Email
            subject: "Action Required: High-Value Expense Approval (" + amount + " INR)"
            message: "Employee " + empRecord.Full_Name + " submitted an expense exceeding ₹10,000 threshold."
        ];
    } 
    else 
    {
        // Standard Request: Single Manager Approval
        update Record Expense_Request [ID == requestId] {
            Approval_Status = "Under Review",
            Requires_Admin_Approval = false,
            Current_Approval_Level = 1
        };
    }
}`,
  },
  {
    id: 'wf-002',
    code: 'WF-LEAVE-AUTO',
    name: 'Leave Request SLA & Auto-Routing Engine',
    description: 'Validates leave quota balances and enforces 48-hour approval turnaround SLA with auto-reminders.',
    category: 'LEAVE',
    isActive: true,
    version: 2,
    triggerEvent: 'ON_LEAVE_SUBMITTED',
    executionCount: 89,
    lastExecutedAt: '2026-11-03T08:00:00Z',
    nodes: [
      {
        id: 'node-l1',
        type: 'TRIGGER',
        title: 'Leave Form Submitted',
        description: 'Triggered when leave request is filed',
        config: { form: 'Leave_Application' },
        x: 60,
        y: 80,
      },
      {
        id: 'node-l2',
        type: 'CONDITION',
        title: 'Quota Check & Days > 3 ?',
        description: 'Verifies available annual leaves and checks duration',
        config: { checkQuota: true },
        x: 340,
        y: 80,
      },
      {
        id: 'node-l3',
        type: 'APPROVAL',
        title: 'Manager Approval (48h SLA)',
        description: 'Assigned to direct reporting manager with automated reminder',
        config: { role: 'MANAGER', reminderHours: 24 },
        x: 620,
        y: 80,
      },
      {
        id: 'node-l4',
        type: 'NOTIFICATION',
        title: 'Calendar Sync & Employee Alert',
        description: 'Updates team calendar and sends confirmation',
        config: { syncCalendar: true },
        x: 900,
        y: 80,
      },
    ],
    edges: [
      { id: 'el1', source: 'node-l1', target: 'node-l2' },
      { id: 'el2', source: 'node-l2', target: 'node-l3' },
      { id: 'el3', source: 'node-l3', target: 'node-l4' },
    ],
    delugeSnippet: `// FlowPilot Workflow WF-LEAVE-AUTO: Leave Validation & Quota Deduction
void Validate_And_Route_Leave(int leaveId, date startDate, date endDate, int days) 
{
    userQuota = Employee_Leave_Balances[User_ID == zoho.loginuserid];
    if (userQuota.Available_Days < days) {
        alert "Insufficient leave balance. You have " + userQuota.Available_Days + " days remaining.";
        cancel submit;
    }
    
    // Assign to Manager
    managerRecord = Employee_Directory[ID == userQuota.Manager_ID];
    sendmail [
        from: "notifications@anesight.tech"
        to: managerRecord.Email
        subject: "Leave Approval Request from " + userQuota.Employee_Name
        message: "Please review the leave request for " + days + " days starting " + startDate
    ];
}`,
  },
  {
    id: 'wf-003',
    code: 'WF-CRM-LEAD',
    name: 'High-Value CRM Enquiry Auto-Assignment',
    description: 'Inspects inbound customer enquiries. If estimated deal value > ₹500,000, alerts Senior Support & sets Priority = HIGH.',
    category: 'CRM',
    isActive: true,
    version: 1,
    triggerEvent: 'ON_ENQUIRY_CREATED',
    executionCount: 64,
    lastExecutedAt: '2026-11-03T16:45:00Z',
    nodes: [
      {
        id: 'node-c1',
        type: 'TRIGGER',
        title: 'New Customer Enquiry',
        description: 'Fired upon website or API enquiry creation',
        config: { form: 'CRM_Inbound_Enquiries' },
        x: 60,
        y: 80,
      },
      {
        id: 'node-c2',
        type: 'CONDITION',
        title: 'Deal Value > ₹500,000 ?',
        description: 'Evaluates commercial potential',
        config: { field: 'estimatedDealValue', operator: 'GREATER_THAN', value: 500000 },
        x: 340,
        y: 80,
      },
      {
        id: 'node-c3',
        type: 'ACTION',
        title: 'Auto-Assign to Vikram Patel & Set High Priority',
        description: 'Designates dedicated enterprise specialist',
        config: { assignTo: 'usr-sup-01', priority: 'HIGH' },
        x: 620,
        y: 80,
      },
      {
        id: 'node-c4',
        type: 'NOTIFICATION',
        title: 'Instant Slack/Email Alert to Sales Lead',
        description: 'Immediate notification within 5 minutes',
        config: { channel: 'EMAIL' },
        x: 900,
        y: 80,
      },
    ],
    edges: [
      { id: 'ec1', source: 'node-c1', target: 'node-c2' },
      { id: 'ec2', source: 'node-c2', target: 'node-c3' },
      { id: 'ec3', source: 'node-c3', target: 'node-c4' },
    ],
    delugeSnippet: `// FlowPilot Workflow WF-CRM-LEAD: Lead Scoring & Auto-Assignment
void AutoRoute_Customer_Enquiry(int enquiryId, decimal estimatedValue) 
{
    if (estimatedValue >= 500000) 
    {
        update Record Inbound_Enquiries [ID == enquiryId] {
            Priority = "HIGH",
            Assigned_Specialist = "Vikram Patel",
            SLA_Response_Hours = 2
        };
        
        // External Webhook to CRM or Slack
        payload = {"enquiryId": enquiryId, "value": estimatedValue, "status": "ESCALATED"};
        response = invokeurl [
            url: "https://api.anesight.tech/v1/crm/webhooks/lead-alert"
            type: POST
            parameters: payload.toString()
            headers: {"Content-Type": "application/json"}
        ];
    }
}`,
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    recipientId: 'usr-admin-01',
    recipientEmail: 'rajesh.kumar@anesight.tech',
    title: 'High-Value Approval Needed (REQ-2026-0041)',
    message: 'Expense claim of ₹48,500 by Ananya Sen requires Executive Admin approval following Manager clearance.',
    type: 'APPROVAL_NEEDED',
    relatedEntityId: 'req-001',
    relatedEntityType: 'REQUEST',
    channel: 'BOTH',
    status: 'DELIVERED',
    isRead: false,
    createdAt: '2026-11-02T14:46:00Z',
    emailTemplate: {
      from: 'system@anesight.tech',
      subject: '[ACTION REQUIRED] Executive Sign-off: REQ-2026-0041 (₹48,500)',
      bodyHtml: `<p>Dear Rajesh,</p><p>Priya Sharma (Manager) has approved <strong>REQ-2026-0041</strong> (Cloud Infrastructure & Kubernetes Certification Training) for <strong>Ananya Sen</strong>.</p><p>Because the total amount of <strong>₹48,500</strong> exceeds our ₹10,000 threshold, your executive approval is required before reimbursement disbursement.</p><p>Please log in to FlowPilot to approve or reject this request.</p>`,
    },
  },
  {
    id: 'notif-002',
    recipientId: 'usr-mgr-01',
    recipientEmail: 'priya.sharma@anesight.tech',
    title: 'New Leave Request (REQ-2026-0042)',
    message: 'Ananya Sen submitted a 5-day Annual Leave request starting November 12, 2026.',
    type: 'APPROVAL_NEEDED',
    relatedEntityId: 'req-002',
    relatedEntityType: 'REQUEST',
    channel: 'BOTH',
    status: 'DELIVERED',
    isRead: false,
    createdAt: '2026-11-03T08:01:00Z',
    emailTemplate: {
      from: 'system@anesight.tech',
      subject: 'Leave Approval Needed: Ananya Sen (Nov 12 - Nov 17)',
      bodyHtml: `<p>Hi Priya,</p><p>Ananya Sen has submitted an Annual Leave request for 5 days. Please review and respond in FlowPilot within 48 hours SLA.</p>`,
    },
  },
  {
    id: 'notif-003',
    recipientId: 'usr-emp-01',
    recipientEmail: 'ananya.sen@anesight.tech',
    title: 'Manager Approval Recorded (REQ-2026-0041)',
    message: 'Priya Sharma approved Step 1 of your expense request. Now awaiting Executive Admin approval.',
    type: 'REQUEST_SUBMITTED',
    relatedEntityId: 'req-001',
    relatedEntityType: 'REQUEST',
    channel: 'IN_APP',
    status: 'DELIVERED',
    isRead: true,
    createdAt: '2026-11-02T14:45:30Z',
  },
  {
    id: 'notif-004',
    recipientId: 'usr-sup-01',
    recipientEmail: 'vikram.patel@anesight.tech',
    title: 'New Enterprise Lead Assigned (ENQ-2026-0101)',
    message: 'High-value customer enquiry from Aditya Birla Group (₹1,250,000 deal value) has been assigned to you.',
    type: 'ENQUIRY_ASSIGNED',
    relatedEntityId: 'enq-101',
    relatedEntityType: 'ENQUIRY',
    channel: 'BOTH',
    status: 'DELIVERED',
    isRead: true,
    createdAt: '2026-11-01T11:05:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-11-03T08:00:12Z',
    actorId: 'usr-emp-01',
    actorName: 'Ananya Sen',
    actorRole: 'EMPLOYEE',
    action: 'REQUEST_CREATED',
    entityType: 'REQUEST',
    entityId: 'REQ-2026-0042',
    description: 'Submitted 5-day Annual Leave request (Nov 12 - Nov 17, 2026)',
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: {
      type: 'LEAVE',
      daysCount: 5,
      quotaBefore: 14,
      quotaAfter: 9,
    },
  },
  {
    id: 'audit-002',
    timestamp: '2026-11-02T14:45:00Z',
    actorId: 'usr-mgr-01',
    actorName: 'Priya Sharma',
    actorRole: 'MANAGER',
    action: 'APPROVAL_STEP_COMPLETED',
    entityType: 'APPROVAL',
    entityId: 'REQ-2026-0041',
    description: 'Approved Step 1 (Manager Level) for Expense Reimbursement ₹48,500. Escalated to Admin.',
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.22',
    metadata: {
      step: 1,
      role: 'MANAGER',
      nextStepRole: 'ADMIN',
      thresholdTriggered: true,
      amount: 48500,
    },
  },
  {
    id: 'audit-003',
    timestamp: '2026-11-02T10:30:05Z',
    actorId: 'usr-emp-01',
    actorName: 'Ananya Sen',
    actorRole: 'EMPLOYEE',
    action: 'REQUEST_CREATED',
    entityType: 'REQUEST',
    entityId: 'REQ-2026-0041',
    description: 'Submitted High-Value Expense claim for ₹48,500 with 2 PDF attachments',
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.18',
    metadata: {
      category: 'Training & Development',
      amount: 48500,
      currency: 'INR',
      attachmentsCount: 2,
    },
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-29T11:00:22Z',
    actorId: 'usr-admin-01',
    actorName: 'Rajesh Kumar',
    actorRole: 'ADMIN',
    action: 'APPROVAL_COMPLETED',
    entityType: 'APPROVAL',
    entityId: 'REQ-2026-0039',
    description: 'Final Approval granted for Client Relations & Dining expense of ₹6,800',
    outcome: 'SUCCESS',
    ipAddress: '14.139.128.4',
    metadata: {
      amount: 6800,
      status: 'APPROVED',
      reimbursementQueue: 'QUEUED_FOR_PAYROLL',
    },
  },
  {
    id: 'audit-005',
    timestamp: '2026-10-12T10:45:10Z',
    actorId: 'usr-mgr-01',
    actorName: 'Priya Sharma',
    actorRole: 'MANAGER',
    action: 'APPROVAL_REJECTED',
    entityType: 'APPROVAL',
    entityId: 'REQ-2026-0031',
    description: 'Rejected Expense claim ₹19,500 due to non-compliance with Pre-approval Travel Policy section 4.2',
    outcome: 'SUCCESS',
    ipAddress: '103.21.244.22',
    metadata: {
      rejectionReason: 'Requires prior written pre-approval before booking informal entertainment venues as per company travel & expense policy section 4.2.',
      amount: 19500,
    },
  },
];
