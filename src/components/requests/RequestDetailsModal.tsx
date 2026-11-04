import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Paperclip, 
  AlertTriangle, 
  User, 
  Send, 
  Code2, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { BusinessRequest, User as UserType } from '../../types';
import { approveBusinessRequest, rejectBusinessRequest, withdrawBusinessRequest } from '../../services/storage';

interface RequestDetailsModalProps {
  request: BusinessRequest | null;
  currentUser: UserType;
  onClose: () => void;
  onUpdate: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  currentUser,
  onClose,
  onUpdate,
}) => {
  const [commentText, setCommentText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showDelugeCode, setShowDelugeCode] = useState(false);

  if (!request) return null;

  const currentStep = request.approvalChain[request.currentStepIndex];
  const isPending = request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW';

  // Check if current user is authorized to act on this step
  const canApprove = isPending && currentStep && (
    (currentStep.roleRequired === 'MANAGER' && (currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN')) ||
    (currentStep.roleRequired === 'ADMIN' && currentUser.role === 'ADMIN')
  );

  const canWithdraw = isPending && (
    currentUser.id === request.requesterId || currentUser.role === 'ADMIN'
  );

  const handleApprove = () => {
    setActionError('');
    const res = approveBusinessRequest(request.id, commentText);
    if (res.success) {
      setActionSuccess(res.message);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 700);
    } else {
      setActionError(res.message);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setActionError('Please specify a rejection reason for compliance records.');
      return;
    }
    setActionError('');
    const res = rejectBusinessRequest(request.id, rejectionReason);
    if (res.success) {
      setActionSuccess(res.message);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 700);
    } else {
      setActionError(res.message);
    }
  };

  const handleWithdraw = () => {
    if (window.confirm('Are you sure you want to withdraw this request?')) {
      const res = withdrawBusinessRequest(request.id);
      if (res.success) {
        onUpdate();
        onClose();
      } else {
        setActionError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700">{request.requestNumber}</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{request.type} Requisition</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-blue-700">{request.status}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* Messages */}
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}
          {actionSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Title and Requester Info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{request.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-medium text-slate-800">Requester: {request.requesterName}</span>
              <span>·</span>
              <span>{request.requesterDepartment}</span>
              <span>·</span>
              <span>Submitted {new Date(request.createdAt).toLocaleString()}</span>
              <span>·</span>
              <span className="font-medium">Urgency: {request.urgency}</span>
            </div>
          </div>

          {/* Specific Requisition Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Category</div>
              <div className="font-semibold text-slate-800 mt-0.5">{request.category}</div>
            </div>

            {request.amount !== undefined && (
              <div>
                <div className="text-slate-400 font-medium">Claim Amount</div>
                <div className="font-mono font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                  ₹{request.amount.toLocaleString('en-IN')}
                </div>
              </div>
            )}

            {request.daysCount !== undefined && (
              <div>
                <div className="text-slate-400 font-medium">Leave Duration</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {request.daysCount} days ({request.startDate} to {request.endDate})
                </div>
              </div>
            )}

            {request.equipmentItem && (
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-medium">Requested Equipment</div>
                <div className="font-semibold text-slate-800 mt-0.5">{request.equipmentItem}</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Business Rationale & Description</h4>
            <p className="text-slate-700 leading-relaxed bg-white border border-slate-200 p-3.5 rounded-xl whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supporting Documents & Receipts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {request.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{att.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">{att.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threshold Alert notice if > 10,000 */}
          {request.requiresAdminApproval && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Dual-Tier Approval Rule Enforced</div>
                <p className="text-amber-800 mt-0.5">{request.adminThresholdReason}</p>
              </div>
            </div>
          )}

          {/* Multi-Level Approval Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Multi-Level Approval Pipeline</h4>
            <div className="space-y-3">
              {request.approvalChain.map((step, idx) => {
                const isCurrent = isPending && idx === request.currentStepIndex;
                const isApproved = step.status === 'APPROVED';
                const isRejected = step.status === 'REJECTED';
                const isWaiting = step.status === 'PENDING' && !isCurrent;

                return (
                  <div 
                    key={step.id} 
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isCurrent 
                        ? 'border-blue-300 bg-blue-50/50' 
                        : isApproved 
                        ? 'border-emerald-200 bg-emerald-50/30' 
                        : isRejected 
                        ? 'border-rose-200 bg-rose-50/30' 
                        : 'border-slate-200 bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isApproved ? 'bg-emerald-600 text-white' :
                          isRejected ? 'bg-rose-600 text-white' :
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {step.stepNumber}
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-slate-900">
                            Tier {step.stepNumber}: {step.roleRequired} Review
                          </span>
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                              CURRENT STEP
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs font-medium">
                        {isApproved && <span className="text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>}
                        {isRejected && <span className="text-rose-700 font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                        {isCurrent && <span className="text-blue-700 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Awaiting Action</span>}
                        {isWaiting && <span className="text-slate-400">Queued</span>}
                      </div>
                    </div>

                    {step.actionByName && (
                      <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                        <span>Reviewed by: <strong className="text-slate-800">{step.actionByName}</strong></span>
                        {step.actionDate && <span>· {new Date(step.actionDate).toLocaleString()}</span>}
                      </div>
                    )}

                    {step.comments && (
                      <div className="mt-2 p-2 bg-white/80 rounded border border-slate-200/60 text-xs text-slate-700">
                        <strong>Approver Comments:</strong> {step.comments}
                      </div>
                    )}

                    {step.rejectionReason && (
                      <div className="mt-2 p-2 bg-rose-100/60 rounded border border-rose-200 text-xs text-rose-800">
                        <strong>Rejection Reason:</strong> {step.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deluge Script Equivalent Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowDelugeCode(!showDelugeCode)}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>{showDelugeCode ? 'Hide' : 'Inspect'} Zoho Deluge Business Logic for this Requisition</span>
            </button>

            {showDelugeCode && (
              <div className="mt-3 p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
                <div className="text-slate-400 text-[11px] font-sans pb-1 border-b border-slate-800">
                  Illustrative Deluge script that executes on Zoho Creator when this request is processed:
                </div>
                <pre className="text-blue-300 leading-relaxed">
{`// Zoho Creator Deluge Workflow: ${request.requestNumber}
void Process_${request.type}_Workflow(int reqId) 
{
    reqRecord = Requisition_Master[ID == reqId];
    ${request.amount ? `if (reqRecord.Amount > 10000) {
        reqRecord.Requires_Executive_Signoff = true;
        reqRecord.Approval_Tier = 1; // Tier 1: Manager
        sendmail [ to: reqRecord.Manager_Email, subject: "Approval Required: " + reqRecord.Request_Number ];
    } else {
        reqRecord.Approval_Tier = 1;
    }` : `reqRecord.Approval_Tier = 1; // Standard Manager Review`}
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Action Box: Approve / Reject Controls */}
          {canApprove && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Reviewer Decision ({currentUser.role} Level)
                </span>
                <span className="text-xs text-slate-500 font-mono">Step {request.currentStepIndex + 1} of {request.approvalChain.length}</span>
              </div>

              {!showRejectBox ? (
                <>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add approval comment or notes (optional)..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => setShowRejectBox(true)}
                      className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg font-semibold transition-colors"
                    >
                      Reject Request...
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{request.currentStepIndex === request.approvalChain.length - 1 ? 'Grant Final Approval' : 'Approve & Escalate'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-rose-800">
                    Specify Mandatory Rejection Reason:
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Enter explicit reason for rejection (compliance requirement)..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowRejectBox(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {canWithdraw && (
              <button
                onClick={handleWithdraw}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Withdraw Request</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
