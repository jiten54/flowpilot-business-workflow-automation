import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  IndianRupee, 
  Monitor, 
  Paperclip, 
  AlertCircle, 
  Check, 
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { RequestType, User } from '../../types';
import { createBusinessRequest } from '../../services/storage';

interface NewRequestModalProps {
  currentUser: User;
  onClose: () => void;
  onCreated: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  currentUser,
  onClose,
  onCreated,
}) => {
  const [activeType, setActiveType] = useState<RequestType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Training & Development');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Expense fields
  const [amount, setAmount] = useState<number | ''>(12500);

  // Leave fields
  const [startDate, setStartDate] = useState('2026-11-18');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [daysCount, setDaysCount] = useState(3);

  // Equipment fields
  const [equipmentItem, setEquipmentItem] = useState('Apple MacBook Pro M3 Max 36GB RAM');

  // Mock attachments
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([
    { name: 'Official_Vendor_Quotation.pdf', size: '1.2 MB', type: 'application/pdf' }
  ]);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto calculate days when dates change
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    calculateDays(val, endDate);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    calculateDays(startDate, val);
  };

  const calculateDays = (start: string, end: string) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setDaysCount(diffDays);
      }
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || title.length < 5) {
      setErrorMessage('Please enter a descriptive request title (at least 5 characters).');
      return;
    }

    if (!description.trim() || description.length < 10) {
      setErrorMessage('Please provide a detailed business justification (at least 10 characters).');
      return;
    }

    if (activeType === 'EXPENSE') {
      if (!amount || amount <= 0) {
        setErrorMessage('Reimbursement amount must be greater than ₹0.');
        return;
      }
    }

    if (activeType === 'LEAVE') {
      if (new Date(endDate) < new Date(startDate)) {
        setErrorMessage('End date cannot precede the start date.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      createBusinessRequest({
        type: activeType,
        title,
        description,
        category,
        amount: activeType === 'EXPENSE' ? Number(amount) : undefined,
        currency: 'INR (₹)',
        startDate: activeType === 'LEAVE' ? startDate : undefined,
        endDate: activeType === 'LEAVE' ? endDate : undefined,
        daysCount: activeType === 'LEAVE' ? daysCount : undefined,
        equipmentItem: activeType === 'EQUIPMENT' ? equipmentItem : undefined,
        urgency,
        status: 'SUBMITTED',
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterRole: currentUser.role,
        requesterDepartment: currentUser.department,
        requiresAdminApproval: activeType === 'EXPENSE' && Number(amount) > 10000,
        attachments: attachedFiles,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit request.');
      setIsSubmitting(false);
    }
  };

  const isHighValue = activeType === 'EXPENSE' && typeof amount === 'number' && amount > 10000;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit New Employee Requisition</h2>
            <p className="text-xs text-slate-500">Routing automatically through FlowPilot Multi-Tier Approval Engine</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Selector (Interactive Segmented Control) */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Select Requisition Type
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveType('EXPENSE');
                  setCategory('Training & Development');
                  setTitle('Cloud Architecture Certification & Books Reimbursement');
                }}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  activeType === 'EXPENSE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IndianRupee className="w-4 h-4" />
                <span>Expense Claim</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveType('LEAVE');
                  setCategory('Paid Annual Leave');
                  setTitle('Annual Paid Vacation - Year End Break');
                }}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  activeType === 'LEAVE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Leave Application</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveType('EQUIPMENT');
                  setCategory('Hardware Upgrade');
                  setTitle('Engineering Workstation 32GB RAM Requisition');
                }}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  activeType === 'EQUIPMENT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Equipment Asset</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect Professional Exam Fee"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {activeType === 'EXPENSE' && (
                  <>
                    <option value="Training & Development">Training & Development</option>
                    <option value="Travel & Lodging">Travel & Lodging</option>
                    <option value="Client Relations & Dining">Client Relations & Dining</option>
                    <option value="Software Subscription & SaaS">Software Subscription & SaaS</option>
                    <option value="Office Supplies & Miscellaneous">Office Supplies & Miscellaneous</option>
                  </>
                )}
                {activeType === 'LEAVE' && (
                  <>
                    <option value="Paid Annual Leave">Paid Annual Leave</option>
                    <option value="Sick / Medical Leave">Sick / Medical Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Maternity / Paternity Leave">Maternity / Paternity Leave</option>
                  </>
                )}
                {activeType === 'EQUIPMENT' && (
                  <>
                    <option value="Hardware Upgrade">Hardware Upgrade</option>
                    <option value="Peripheral Device">Peripheral Device (Monitor, Dock)</option>
                    <option value="Mobile Testing Device">Mobile Testing Device</option>
                    <option value="Lab Instrument">Lab & Infrastructure Asset</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority Urgency
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low (Normal 72h window)</option>
                <option value="MEDIUM">Medium (48h SLA)</option>
                <option value="HIGH">High (24h turnaround)</option>
                <option value="CRITICAL">Critical (Immediate Escalation)</option>
              </select>
            </div>
          </div>

          {/* Conditional Type Fields */}
          {activeType === 'EXPENSE' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Reimbursement Amount (INR ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Real-time threshold indicator */}
              {isHighValue ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Dual-Tier Approval Triggered:</strong> Claim exceeds ₹10,000 threshold. Will be routed first to Manager (Priya Sharma), then Executive Admin (Rajesh Kumar).
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
                  ✓ Standard Approval Flow: Single-tier approval by direct reporting manager.
                </div>
              )}
            </div>
          )}

          {activeType === 'LEAVE' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => handleStartDateChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => handleEndDateChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="col-span-2 text-[11px] text-slate-600 font-medium">
                Calculated Duration: <strong className="text-slate-900">{daysCount} business day{daysCount > 1 ? 's' : ''}</strong>. (Available Balance: 14 days)
              </div>
            </div>
          )}

          {activeType === 'EQUIPMENT' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Equipment Model & Specifications <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={equipmentItem}
                onChange={e => setEquipmentItem(e.target.value)}
                placeholder="e.g. Dell XPS 15 9530 / i9 / 32GB / RTX 4070"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Business Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State clear business rationale, client project references, or handover arrangements..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supporting Files & Invoices
            </label>
            <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 font-medium">
                  {attachedFiles.length} file attached ({attachedFiles[0].name})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedFiles(prev => [
                    ...prev,
                    { name: `Receipt_Scan_${Date.now().toString().slice(-4)}.pdf`, size: '850 KB', type: 'application/pdf' }
                  ]);
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                + Add Another File
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting to Engine...' : 'Submit Requisition'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
