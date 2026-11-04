/**
 * Zoho Creator Concepts & Deluge Scripting Demonstration Mapping
 * Specifically compiled for Junior / Fresher Zoho Creator Developers at Anesight Tech
 */

export interface DelugeConceptMapping {
  id: string;
  zohoCreatorConcept: string;
  flowpilotEquivalent: string;
  category: 'FORMS' | 'REPORTS' | 'WORKFLOWS' | 'APPROVALS' | 'DELUGE_SCRIPTING' | 'INTEGRATION' | 'RBAC';
  description: string;
  zohoImplementationDetails: string;
  flowpilotImplementationDetails: string;
  delugeCodeSnippet: string;
  delugeCodeTitle: string;
  explanation: string;
}

export const DELUGE_MAPPINGS: DelugeConceptMapping[] = [
  {
    id: 'map-01',
    zohoCreatorConcept: 'Form Events (On User Input & On Validate)',
    flowpilotEquivalent: 'React Form Validation & Pydantic / Zod Schemas',
    category: 'FORMS',
    description: 'Enforcing business constraints before a record is committed to the database (e.g. checking negative expense values or date range consistency).',
    zohoImplementationDetails: 'Written in Deluge script under Form Properties > Workflow > On Validate. Can show alerts and cancel submission with "cancel submit".',
    flowpilotImplementationDetails: 'Handled via client-side input validation handlers in React components and server-side Pydantic models in FastAPI with HTTP 422 Unprocessable Entity responses.',
    delugeCodeTitle: 'Deluge: Form Validation (On Validate Event)',
    delugeCodeSnippet: `// ==========================================
// Zoho Creator Deluge: Form On Validate Event
// Form: Expense_Reimbursement_Submission
// ==========================================

// 1. Validate reimbursement amount
if (input.Reimbursement_Amount == null || input.Reimbursement_Amount <= 0) 
{
    alert "Validation Error: Expense amount must be greater than zero.";
    cancel submit;
}

// 2. Validate receipt attachment for claims over ₹1,000
if (input.Reimbursement_Amount > 1000 && input.Receipt_Document == null) 
{
    alert "Policy Compliance: Receipts are mandatory for claims exceeding ₹1,000.";
    cancel submit;
}

// 3. Date sanity check (Cannot claim for future dates)
if (input.Expense_Date > zoho.currentdate) 
{
    alert "Error: Expense date cannot be in the future.";
    cancel submit;
}`,
    explanation: 'In Zoho Creator, "On Validate" fires immediately before the record is saved. Returning "cancel submit" halts persistence. In our platform, this maps to client-side reactive validation and backend Pydantic validators.',
  },
  {
    id: 'map-02',
    zohoCreatorConcept: 'Multi-Level Approval Process & Approver Routing',
    flowpilotEquivalent: 'Multi-Tier State Machine & Dynamic Approval Chains',
    category: 'APPROVALS',
    description: 'Automating multi-tiered review where high-value claims (> ₹10,000) escalate to Executive Finance Admin after initial Manager sign-off.',
    zohoImplementationDetails: 'Configured under Zoho Creator > Approvals. Defines Tier 1 (Manager) and Tier 2 (Admin) rules based on criteria (Amount > 10000).',
    flowpilotImplementationDetails: 'Implemented in storage.ts / workflowEngine with ApprovalStep chains, currentStepIndex tracking, and strict RBAC validation guarding each step.',
    delugeCodeTitle: 'Deluge: Multi-Tier Approval Logic (On Success / Custom Action)',
    delugeCodeSnippet: `// ========================================================
// Zoho Creator Deluge: Approval Assignment Logic
// Trigger: On Add -> On Success
// ========================================================

void Route_Approval_Chain(int recordId, decimal claimAmount) 
{
    // Fetch employee supervisor mapping
    emp = Employee_Directory[User_ID == zoho.loginuserid];
    
    // Evaluate Corporate Threshold: ₹10,000
    if (claimAmount > 10000) 
    {
        // High-Value Flow: Two-Tier Review
        update Record Expense_Claims [ID == recordId] {
            Approval_Status = "Under Review",
            Current_Tier = 1,
            Assigned_Approver_Role = "MANAGER",
            Requires_Admin_Signoff = true,
            Escalation_Reason = "Amount exceeds ₹10,000 limit"
        };
        
        // Send email alert to direct manager
        sendmail [
            from: zoho.adminuserid
            to: emp.Manager_Email
            subject: "Tier 1 Approval Required: ₹" + claimAmount
            message: "Employee " + emp.Full_Name + " requested ₹" + claimAmount + ". Please review."
        ];
    }
    else 
    {
        // Standard Flow: Single Manager Approval
        update Record Expense_Claims [ID == recordId] {
            Approval_Status = "Under Review",
            Current_Tier = 1,
            Assigned_Approver_Role = "MANAGER",
            Requires_Admin_Signoff = false
        };
    }
}`,
    explanation: 'Illustrates how Deluge dynamically branches execution based on numerical thresholds and updates record fields to manage approval progression.',
  },
  {
    id: 'map-03',
    zohoCreatorConcept: 'External REST API Integration (invokeurl)',
    flowpilotEquivalent: 'Fetch / Axios REST APIs & FastAPI Proxy Handlers',
    category: 'INTEGRATION',
    description: 'Integrating external SaaS services (e.g. ERP systems, Slack webhooks, currency converters) via authenticated HTTP requests.',
    zohoImplementationDetails: 'Executed using the built-in Deluge `invokeurl` task with headers, query parameters, and OAuth / Bearer connection tokens.',
    flowpilotImplementationDetails: 'Modern asynchronous REST API calls with error handling, status code checking, and fallback resilience demonstrated in the API Explorer.',
    delugeCodeTitle: 'Deluge: External REST API Invocation (invokeurl)',
    delugeCodeSnippet: `// ===================================================
// Zoho Creator Deluge: External Webhook & API Dispatch
// Task: invokeurl for ERP Integration
// ===================================================

void Push_Approved_Expense_To_ERP(int requestId, decimal amount, string vendorName) 
{
    // Build JSON request payload
    payloadMap = Map();
    payloadMap.put("sourceSystem", "FlowPilot_ZohoCreator");
    payloadMap.put("requestId", requestId);
    payloadMap.put("reimbursementAmount", amount);
    payloadMap.put("currency", "INR");
    payloadMap.put("beneficiary", vendorName);
    payloadMap.put("timestamp", zoho.currenttime.toString());
    
    // Set headers
    headersMap = Map();
    headersMap.put("Content-Type", "application/json");
    headersMap.put("Authorization", "Bearer " + getSysConfig("ERP_BEARER_KEY"));
    
    // Invoke external REST API
    apiResponse = invokeurl [
        url: "https://api.anesight.tech/v1/erp/reimbursements/queue"
        type: POST
        parameters: payloadMap.toString()
        headers: headersMap
    ];
    
    // Parse response
    if (apiResponse.get("status_code") == 200 || apiResponse.get("status_code") == 201) 
    {
        info "ERP sync successful. Transaction ref: " + apiResponse.get("transactionId");
    } 
    else 
    {
        info "Failed to dispatch to ERP. Status: " + apiResponse.get("status_code");
    }
}`,
    explanation: 'Demonstrates Deluge invokeurl connecting to an external REST endpoint with JSON serialization and authentication headers.',
  },
  {
    id: 'map-04',
    zohoCreatorConcept: 'Reports, Filtered Views & Criteria',
    flowpilotEquivalent: 'Filtered React Data Tables & PostgreSQL WHERE Queries',
    category: 'REPORTS',
    description: 'Creating role-tailored report views such as "My Pending Approvals", "Approved Claims This Month", and "Department Breakdown".',
    zohoImplementationDetails: 'Created in Zoho Creator under Reports > Criteria. Uses declarative filters like `[Approval_Status == "Under Review" && Manager_ID == zoho.loginuserid]`.',
    flowpilotImplementationDetails: 'Implemented with client-side reactive filter bars (segmented status buttons, category selectors, date range filters) and tabular layouts.',
    delugeCodeTitle: 'Deluge: Dynamic Report Criteria / Filter Query',
    delugeCodeSnippet: `// ======================================================
// Zoho Creator Deluge: Dynamic Record Query & Criteria
// Function: Get_Pending_Approvals_For_Current_Manager
// ======================================================

list<int> pendingIds = list();

// Fetch all records where current user is the designated reviewer
pendingRecords = Expense_Claims [
    Approval_Status == "Under Review" && 
    (
        (Current_Tier == 1 && Manager_Email == zoho.loginuser) ||
        (Current_Tier == 2 && zoho.adminuser == true)
    )
];

for each record in pendingRecords 
{
    pendingIds.add(record.ID);
}

return pendingIds;`,
    explanation: 'In Zoho Creator, views and reports dynamically filter data depending on who is logged in. FlowPilot provides role-aware approval inboxes for Managers and Admins.',
  },
  {
    id: 'map-05',
    zohoCreatorConcept: 'Schedules, Cron Jobs & Automated Reminders',
    flowpilotEquivalent: 'Background Task Scheduler, Cron & Escalation SLA Timers',
    category: 'WORKFLOWS',
    description: 'Automating periodic checks to detect pending approvals exceeding 48 hours SLA and dispatch escalation alerts.',
    zohoImplementationDetails: 'Configured in Zoho Creator > Workflows > Schedules (Daily/Hourly cron execution) using Deluge to iterate and alert.',
    flowpilotImplementationDetails: 'Automated notification engine with SLA indicators, status escalation flags, and retry queues.',
    delugeCodeTitle: 'Deluge: SLA Escalation Scheduled Function',
    delugeCodeSnippet: `// =====================================================
// Zoho Creator Deluge: Scheduled Daily SLA Monitor
// Frequency: Every 12 Hours
// =====================================================

void Check_Approval_SLA_Breaches() 
{
    thresholdHours = 48;
    cutoffTime = zoho.currenttime.subHours(thresholdHours);
    
    // Find requests pending past SLA threshold
    breachedList = Expense_Claims [
        Approval_Status == "Under Review" && 
        Submitted_Time < cutoffTime
    ];
    
    for each req in breachedList 
    {
        // Log SLA warning
        info "SLA Breach on Request: " + req.Request_Number;
        
        // Dispatch urgent reminder to manager
        sendmail [
            from: "escalations@anesight.tech"
            to: req.Manager_Email
            subject: "[URGENT] Approval Overdue: " + req.Request_Number
            message: "Request " + req.Request_Number + " has exceeded the 48-hour SLA. Please take action immediately."
        ];
    }
}`,
    explanation: 'Scheduled Deluge functions allow Zoho Creator apps to execute headless recurring checks. In FlowPilot, this is showcased in Automation Settings & Notifications.',
  },
  {
    id: 'map-06',
    zohoCreatorConcept: 'Role-Based Access Control (RBAC) & Field Permissions',
    flowpilotEquivalent: 'Role-Based Navigation, Action Guards & Audit Logs',
    category: 'RBAC',
    description: 'Restricting sensitive operations (such as approving requests, configuring workflows, or viewing audit trails) based on User Roles.',
    zohoImplementationDetails: 'Configured in Zoho Creator Settings > Users and Permissions > Roles (Admin, Manager, Employee) and field-level read/write permissions.',
    flowpilotImplementationDetails: 'Guarded by active role switcher (Admin, Manager, Employee, Support), dynamic menu visibility, action guards, and security audit logs.',
    delugeCodeTitle: 'Deluge: RBAC Authorization Guard in Custom Function',
    delugeCodeSnippet: `// ======================================================
// Zoho Creator Deluge: Authorization Guard Check
// ======================================================

bool Check_User_Can_Approve(int requestId) 
{
    req = Expense_Claims[ID == requestId];
    
    // Check if user is Admin
    if (zoho.adminuser == true) {
        return true;
    }
    
    // Check if user is the direct manager
    if (req.Current_Tier == 1 && req.Manager_Email == zoho.loginuser) {
        return true;
    }
    
    // Deny access
    alert "Security Alert: You are not authorized to perform this approval action.";
    return false;
}`,
    explanation: 'Demonstrates role-based security checks in Deluge preventing unauthorized approvers from approving their own or peer requests.',
  }
];
