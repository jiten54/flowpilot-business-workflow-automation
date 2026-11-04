import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Building2, 
  GitBranch, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { BusinessRequest, CrmEnquiry, WorkflowDefinition, User } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface MainDashboardProps {
  currentUser: User;
  requests: BusinessRequest[];
  enquiries: CrmEnquiry[];
  workflows: WorkflowDefinition[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectRequest: (request: BusinessRequest) => void;
  onOpenNewRequest: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  currentUser,
  requests,
  enquiries,
  workflows,
  onNavigateTab,
  onSelectRequest,
  onOpenNewRequest,
}) => {
  const totalRequests = requests.length;
  const pendingApprovals = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');

  const openEnquiries = enquiries.filter(e => e.status !== 'RESOLVED' && e.status !== 'CLOSED');
  const totalWorkflowRuns = workflows.reduce((acc, w) => acc + w.executionCount, 0);

  // Filter requests that require current user's approval
  const pendingForCurrentUser = requests.filter(r => {
    if (r.status !== 'SUBMITTED' && r.status !== 'UNDER_REVIEW') return false;
    const currentStep = r.approvalChain[r.currentStepIndex];
    if (!currentStep) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'MANAGER' && currentStep.roleRequired === 'MANAGER') return true;
    return false;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            FlowPilot Intelligent Automation Platform · Connected to Anesight Tech ERP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('deluge-learning')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span>Zoho & Deluge Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={onOpenNewRequest}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Submit New Request</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strips (No pills, tabular numbers, clean 1-line cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Requisitions</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalRequests}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold font-mono tabular-nums">+18%</span>
            <span>vs previous month</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            {pendingApprovals.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-slate-800 font-mono tabular-nums">{pendingForCurrentUser.length}</span>
            <span>awaiting your review</span>
          </div>
        </div>

        {/* Approved Rate & Avg SLA */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Approved Requests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {approvedRequests.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Avg turnaround:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">4.2 hours</span>
          </div>
        </div>

        {/* Open CRM Enquiries */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Open Enquiries</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {openEnquiries.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Pipeline Value:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">₹27.2 Lakhs</span>
          </div>
        </div>
      </div>

      {/* Role Action Alert Banner if user has items waiting */}
      {pendingForCurrentUser.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                Action Required: {pendingForCurrentUser.length} request{pendingForCurrentUser.length > 1 ? 's' : ''} require your approval
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                {currentUser.role === 'ADMIN' 
                  ? 'Includes high-value claims exceeding the ₹10,000 threshold requiring Executive Sign-off.'
                  : 'Includes pending leave & reimbursement applications from your team.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Open Approval Inbox
          </button>
        </div>
      )}

      {/* 2-Column Split: Recent Requests & Workflows Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Recent Business Requests */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Employee Requisitions</h2>
              <p className="text-xs text-slate-500">Live feed of leave, expense, and equipment requests</p>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.slice(0, 5).map(req => {
              const isHighValue = req.requiresAdminApproval;
              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-slate-700">{req.requestNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-medium">{req.type}</span>
                      {isHighValue && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] font-mono text-amber-700 font-medium">Dual-Tier (&gt;₹10k)</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {req.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>By {req.requesterName}</span>
                      <span>·</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      {req.amount && (
                        <>
                          <span>·</span>
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            ₹{req.amount.toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium">
                      {req.status === 'APPROVED' && (
                        <span className="text-emerald-700 flex items-center gap-1 justify-end font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {req.status === 'UNDER_REVIEW' && (
                        <span className="text-amber-700 flex items-center gap-1 justify-end font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Tier {req.currentStepIndex + 1} Review
                        </span>
                      )}
                      {req.status === 'SUBMITTED' && (
                        <span className="text-blue-700 flex items-center gap-1 justify-end font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Submitted
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="text-rose-700 flex items-center gap-1 justify-end font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {req.approvalChain.length} step{req.approvalChain.length > 1 ? 's' : ''} chain
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1/3): Active Automation Workflows */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Active Workflows</h2>
              <button
                onClick={() => onNavigateTab('workflow-builder')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Configure
              </button>
            </div>

            <div className="space-y-3">
              {workflows.map(wf => (
                <div
                  key={wf.id}
                  onClick={() => onNavigateTab('workflow-builder')}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800">{wf.name}</span>
                    <span className={`text-[10px] font-mono font-bold ${wf.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {wf.isActive ? 'RUNNING' : 'PAUSED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{wf.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{wf.nodes.length} nodes</span>
                    <span>{wf.executionCount} executions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts to Developer Capabilities */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Zoho Creator Developer Skills
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Demonstrating Form Validation, Deluge Business Logic, Dynamic Multi-Tier Approvals, REST APIs, and RBAC at Anesight Tech.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('deluge-learning')}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-left transition-colors"
              >
                Deluge Scripts
                <span className="block text-[10px] text-slate-400 font-normal">Side-by-side</span>
              </button>
              <button
                onClick={() => onNavigateTab('test-runner')}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-left transition-colors"
              >
                Automated Tests
                <span className="block text-[10px] text-slate-400 font-normal">7 verification suites</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
