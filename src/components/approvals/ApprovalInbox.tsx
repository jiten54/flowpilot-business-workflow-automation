import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Filter, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BusinessRequest, User } from '../../types';
import { approveBusinessRequest, rejectBusinessRequest } from '../../services/storage';

interface ApprovalInboxProps {
  currentUser: User;
  requests: BusinessRequest[];
  onSelectRequest: (request: BusinessRequest) => void;
  onRefresh: () => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  currentUser,
  requests,
  onSelectRequest,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [rejectionModalReq, setRejectionModalReq] = useState<BusinessRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter requests waiting for current user's approval
  const pendingForCurrentUser = requests.filter(r => {
    if (r.status !== 'SUBMITTED' && r.status !== 'UNDER_REVIEW') return false;
    const currentStep = r.approvalChain[r.currentStepIndex];
    if (!currentStep) return false;

    if (currentUser.role === 'ADMIN') return true; // Admin can approve Admin step or override
    if (currentUser.role === 'MANAGER' && currentStep.roleRequired === 'MANAGER') return true;
    return false;
  });

  // History of requests already decided by this user
  const historyForCurrentUser = requests.filter(r => {
    return r.approvalChain.some(step => step.actionByUserId === currentUser.id);
  });

  const handleQuickApprove = (req: BusinessRequest) => {
    const comment = approvalComment[req.id] || '';
    const res = approveBusinessRequest(req.id, comment);
    if (res.success) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
      setActionMessage({ text: res.message, type: 'success' });
      onRefresh();
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectionModalReq) return;
    if (!rejectionReason.trim() || rejectionReason.length < 5) {
      alert('Please provide an explicit rejection reason of at least 5 characters for compliance audit.');
      return;
    }

    const res = rejectBusinessRequest(rejectionModalReq.id, rejectionReason);
    if (res.success) {
      setActionMessage({ text: res.message, type: 'success' });
      setRejectionModalReq(null);
      setRejectionReason('');
      onRefresh();
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Multi-Level Approval Inbox
          </h1>
          <p className="text-xs text-slate-500">
            Review, validate, approve, or reject team requisitions aligned with corporate policies
          </p>
        </div>

        {/* Pending vs History Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Action Required</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {pendingForCurrentUser.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Decision History</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {historyForCurrentUser.length}
            </span>
          </button>
        </div>
      </div>

      {/* Global Action Banner */}
      {actionMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-500 hover:text-slate-800 font-bold">×</button>
        </div>
      )}

      {/* Role Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-slate-600">
          <strong className="text-slate-800">Active Reviewer Role: {currentUser.role} ({currentUser.name})</strong>
          <p className="mt-0.5">
            {currentUser.role === 'ADMIN'
              ? 'As Executive Admin, you have authority to approve Tier 2 high-value claims (> ₹10,000 threshold) and executive equipment allocations.'
              : currentUser.role === 'MANAGER'
              ? 'As Department Manager, you approve Tier 1 submissions. Claims exceeding ₹10,000 will automatically escalate to Executive Admin.'
              : 'Switch to Manager (Priya Sharma) or Admin (Rajesh Kumar) using the header role switcher to review pending approvals.'}
          </p>
        </div>
      </div>

      {/* List Content */}
      {activeTab === 'PENDING' ? (
        pendingForCurrentUser.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">Inbox Zero · No Pending Approvals</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are completely caught up! Any new employee requisitions requiring your approval will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingForCurrentUser.map(req => {
              const currentStep = req.approvalChain[req.currentStepIndex];
              const isHighValue = req.requiresAdminApproval;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{req.requestNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-600">{req.type}</span>
                      {isHighValue && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] font-mono text-amber-700 font-semibold">
                            Dual-Tier (&gt;₹10,000)
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Submitted by <strong className="text-slate-800">{req.requesterName}</strong></span>
                      <span>·</span>
                      <span>{req.requesterDepartment}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h3 
                        onClick={() => onSelectRequest(req)}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{req.description}</p>
                    </div>

                    {/* Numeric Value */}
                    <div className="text-right shrink-0">
                      {req.amount !== undefined ? (
                        <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                          ₹{req.amount.toLocaleString('en-IN')}
                        </div>
                      ) : req.daysCount !== undefined ? (
                        <div className="text-sm font-semibold text-slate-800">
                          {req.daysCount} days ({req.startDate} to {req.endDate})
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-slate-800">{req.equipmentItem}</div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5">{req.category}</div>
                    </div>
                  </div>

                  {/* Pipeline Stage Visualizer */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Approval Step:</span>
                      <span className="font-mono text-blue-800 font-bold">
                        Tier {req.currentStepIndex + 1} of {req.approvalChain.length} ({currentStep.roleRequired})
                      </span>
                      {currentStep.stepNumber === 2 && (
                        <span className="text-[11px] text-amber-700 font-medium">
                          (Executive Admin review after Manager approval)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectRequest(req)}
                      className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Full Requisition & Audit History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        value={approvalComment[req.id] || ''}
                        onChange={e => setApprovalComment({ ...approvalComment, [req.id]: e.target.value })}
                        placeholder="Add review note / ledger remark (optional)..."
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setRejectionModalReq(req);
                          setRejectionReason('');
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        Reject...
                      </button>

                      <button
                        onClick={() => handleQuickApprove(req)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {req.currentStepIndex === req.approvalChain.length - 1
                            ? 'Grant Final Approval'
                            : 'Approve & Escalate to Admin'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* History Tab */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {historyForCurrentUser.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No historical approvals recorded yet for {currentUser.name}.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4">Your Decision</th>
                  <th className="py-3 px-4">Final Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyForCurrentUser.map(r => {
                  const myStep = r.approvalChain.find(s => s.actionByUserId === currentUser.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelectRequest(r)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{r.requestNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{r.title}</td>
                      <td className="py-3 px-4 text-slate-600">{r.requesterName}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                        {r.amount ? `₹${r.amount.toLocaleString('en-IN')}` : r.daysCount ? `${r.daysCount} days` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {myStep?.status === 'APPROVED' ? (
                          <span className="text-emerald-700 font-semibold">Approved (Tier {myStep.stepNumber})</span>
                        ) : (
                          <span className="text-rose-700 font-semibold">Rejected (Tier {myStep?.stepNumber})</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{r.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectionModalReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Requisition: {rejectionModalReq.requestNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted by {rejectionModalReq.requesterName} · {rejectionModalReq.category}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Rejection Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="State compliance reason, missing invoices, or alternative policy recommendations..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This reason will be recorded in the immutable audit log and emailed to {rejectionModalReq.requesterName}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectionModalReq(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
