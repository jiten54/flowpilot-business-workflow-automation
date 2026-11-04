# FlowPilot – Intelligent Business Workflow Automation Platform

> **Anesight Tech** · Technical Assessment Demonstration Project  
> Practical Demonstration for **Fresher / Junior Zoho Creator & Full-Stack Automation Engineer**

---

## 1. Project Overview & Problem Statement

Modern enterprise operations require rapid, reliable coordination between employees, department managers, executive leadership, and customer accounts. In legacy setups:
- Employee requisitions (leave, expense reimbursements, equipment purchases) are trapped in email threads or unorganized spreadsheets.
- High-value expenditures slip through without multi-tier executive approval.
- Inbound customer sales leads lack automated routing, scoring, and follow-up SLAs.
- Approvals lack auditability, timestamp tracking, and policy enforcement.

**FlowPilot** solves these challenges by combining the principles of **Zoho Creator, Deluge Scripting, and Zoho Catalyst** with a modern full-stack web architecture. It demonstrates:
- Form validation and business constraints before persistence
- Dynamic multi-tier approval state machines with a ₹10,000 threshold dual-tier rule
- Visual workflow orchestration with triggers, conditions, and actions
- Lightweight CRM customer enquiry register with follow-ups and notes
- RESTful microservice API explorer with OpenAPI / Swagger sandbox
- Event-driven notifications with email provider abstraction and retry queues
- Strict Role-Based Access Control (Admin, Manager, Employee, Support)
- Comprehensive audit trails with state diffs
- In-browser automated quality assurance test runner (7 test suites)

---

## 2. Architecture & Technology Stack

### System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 19 (SPA) + TypeScript + Tailwind CSS v4 + Motion + Recharts                |
|  - Role Switcher (Admin, Manager, Employee, Support)                              |
|  - Visual Workflow Builder (Nodes & Connections Canvas)                          |
|  - Dynamic Multi-Tier Approval Pipeline UI                                        |
|  - Swagger / OpenAPI REST Explorer & Testing Console                              |
|  - Interactive Zoho Creator & Deluge Script Learning Hub                          |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (Bearer JWT Auth)
                                           v
+-----------------------------------------------------------------------------------+
|                                 API & ENGINE LAYER                                |
|  FastAPI (Python 3.12) / Node.js Express Controller Gateway                       |
|  - Pydantic v2 Request Validation & Schema Serializers                           |
|  - Multi-Tier Workflow Engine (Conditional Rules & Dynamic Approval Chains)       |
|  - RBAC Security Guard (Role Permissions Interceptor)                             |
|  - Notification Dispatcher (Email Service Abstraction: SMTP / SendGrid / SES)     |
|  - Audit Log Event Stream Generator                                               |
+------------------------------------------+----------------------------------------+
                                           | Database Engine
                                           v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE LAYER                                  |
|  PostgreSQL 16 (Hosted on Render) + SQLAlchemy ORM / LocalStorage Cache           |
|  - users / roles / departments                                                    |
|  - business_requests (leave, expense, equipment)                                  |
|  - approval_steps (hierarchical multi-level state machine)                        |
|  - crm_enquiries & enquiry_notes                                                  |
|  - workflow_definitions, nodes, edges                                             |
|  - audit_log_entries (immutable chronological ledger)                             |
+-----------------------------------------------------------------------------------+
```

### Technology Stack Table

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Motion, Canvas-Confetti |
| **Backend & APIs** | Python 3.12, FastAPI, Pydantic, Express / TSX runtime, REST APIs |
| **Database** | PostgreSQL 16, SQLAlchemy ORM, Reactive LocalStorage Client Cache |
| **Hosting & CI/CD** | Vercel (Frontend SPA), Render (FastAPI / Node Backend), GitHub Actions |
| **Testing** | Automated Browser Test Runner Suite, PyTest backend assertions |

---

## 3. Workflow Diagrams

### High-Value Expense Approval Workflow (> ₹10,000)

```
[ Employee Submits Expense Claim ]
               |
               v
  [ System Validates Constraints ]  ---> (Invalid: Rejection Alert)
               |
               v
    [ Amount > ₹10,000 INR? ]
       /               \
     (No)             (Yes)
      /                  \
[ Tier 1: Manager ]   [ Tier 1: Manager Review ]
      |                          |
 (Approved)                 (Approved)
      |                          v
      |               [ Tier 2: Executive Admin Review ]
      |                          |
      \                          /
       -----> [ Final Decision ] <-----
                   /        \
              (Approved)   (Rejected)
                 /             \
 [ Status: APPROVED ]      [ Status: REJECTED ]
 [ Notify Requester ]      [ Mandatory Reason ]
 [ Queue for Payroll ]     [ Notify Requester ]
         |                         |
         +----------+--------------+
                    |
                    v
      [ Append Immutable Audit Log ]
```

---

## 4. Database Schema

### Table: `users`
- `id` (VARCHAR PK)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE)
- `role` (ENUM: `ADMIN`, `MANAGER`, `EMPLOYEE`, `SUPPORT`)
- `department` (VARCHAR)
- `manager_id` (VARCHAR FK -> users.id)

### Table: `business_requests`
- `id` (VARCHAR PK)
- `request_number` (VARCHAR UNIQUE, e.g. `REQ-2026-0041`)
- `type` (ENUM: `EXPENSE`, `LEAVE`, `EQUIPMENT`)
- `title` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR)
- `amount` (DECIMAL, for Expense)
- `days_count` (INTEGER, for Leave)
- `equipment_item` (VARCHAR, for Equipment)
- `urgency` (ENUM: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `status` (ENUM: `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`)
- `requester_id` (VARCHAR FK -> users.id)
- `requires_admin_approval` (BOOLEAN)
- `current_step_index` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Table: `approval_steps`
- `id` (VARCHAR PK)
- `request_id` (VARCHAR FK -> business_requests.id)
- `step_number` (INTEGER)
- `role_required` (ENUM: `MANAGER`, `ADMIN`)
- `assigned_to_user_id` (VARCHAR FK -> users.id)
- `status` (ENUM: `PENDING`, `APPROVED`, `REJECTED`, `SKIPPED`)
- `action_date` (TIMESTAMP)
- `comments` (TEXT)
- `rejection_reason` (TEXT)

### Table: `crm_enquiries`
- `id` (VARCHAR PK)
- `ticket_number` (VARCHAR UNIQUE, e.g. `ENQ-2026-0101`)
- `customer_name` (VARCHAR)
- `customer_email` (VARCHAR)
- `company_name` (VARCHAR)
- `subject` (VARCHAR)
- `description` (TEXT)
- `priority` (ENUM: `LOW`, `MEDIUM`, `HIGH`)
- `status` (ENUM: `NEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `assigned_to_id` (VARCHAR FK -> users.id)
- `estimated_deal_value` (DECIMAL)

### Table: `audit_log_entries`
- `id` (VARCHAR PK)
- `timestamp` (TIMESTAMP)
- `actor_id` (VARCHAR)
- `actor_name` (VARCHAR)
- `actor_role` (VARCHAR)
- `action` (VARCHAR)
- `entity_type` (VARCHAR)
- `entity_id` (VARCHAR)
- `outcome` (ENUM: `SUCCESS`, `FAILURE`, `WARNING`)
- `metadata` (JSONB)

---

## 5. Zoho Creator & Deluge Mapping Reference

| Zoho Creator Concept | FlowPilot Modern Architecture | Deluge Implementation |
| :--- | :--- | :--- |
| **Form Events (On Validate)** | React Form Validators & Pydantic Schemas | `alert "Validation Error"; cancel submit;` |
| **Approval Processes** | Dynamic Multi-Tier State Machine | Conditional routing based on `amount > 10000` |
| **invokeurl REST APIs** | Asynchronous Fetch / FastAPI Proxy | `invokeurl [url: "https://api...", type: POST]` |
| **Criteria Reports** | React Filter Bars & SQL WHERE queries | `Expense_Claims[Approval_Status == "Under Review"]` |
| **Schedules & SLA Cron** | Background Escalation Timers | Scheduled daily SLA monitor with automated emails |
| **Role-Based Permissions** | RBAC Guards & Route Interceptors | `zoho.adminuser == true` check |

---

## 6. Setup & Installation

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Python >= 3.11 (if running local FastAPI server)

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/anesight-tech/flowpilot.git
cd flowpilot

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:3000
```

### Environment Variables (`.env.example`)
```env
# General
APP_URL="http://localhost:3000"
API_BASE_URL="http://localhost:8000/api/v1"

# Email Provider Configuration
EMAIL_PROVIDER="SMTP"
SMTP_HOST="mail.anesight.tech"
SMTP_PORT="587"
SMTP_USER="notifications@anesight.tech"
SMTP_PASS="secret_password"

# Zoho Integration
ZOHO_CREATOR_APP_OWNER="anesighttech"
ZOHO_CREATOR_APP_NAME="flowpilot_enterprise"
ZOHO_OAUTH_CLIENT_ID="1000.xxxxxx"
```

---

## 7. Testing Instructions

FlowPilot features a built-in automated test suite runner:
1. Open FlowPilot in the browser.
2. Select the **Automated Test Runner** tab in the sidebar.
3. Click **"Run All Test Suites"**.
4. Observe step-by-step real-time assertions covering:
   - Form Validation (Negative amount / empty title rejection)
   - RBAC Security (Employee unauthorized approval block)
   - Tier 1 Manager Approval Execution
   - High-Value ₹10,000 Threshold Dual-Tier Enforcement
   - Mandatory Rejection Reason Compliance
   - Notification Service Retry & Recovery
   - Idempotency & Duplicate Submission Guard

---

## 8. Deployment

- **Frontend**: Configured for continuous deployment on **Vercel** (`npm run build`).
- **Backend API**: Configured for deployment on **Render** (FastAPI with Uvicorn `uvicorn main:app --host 0.0.0.0 --port 10000`).
- **Database**: PostgreSQL database hosted on Render with automated migration scripts.
