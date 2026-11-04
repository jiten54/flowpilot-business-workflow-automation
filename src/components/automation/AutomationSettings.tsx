import React, { useState } from 'react';
import { 
  Sliders, 
  Mail, 
  Clock, 
  ShieldAlert, 
  Save, 
  Check, 
  Bell, 
  Send,
  RotateCcw
} from 'lucide-react';

export const AutomationSettings: React.FC = () => {
  const [expenseThreshold, setExpenseThreshold] = useState<number>(10000);
  const [slaHours, setSlaHours] = useState<number>(48);
  const [emailProvider, setEmailProvider] = useState<'SMTP' | 'SENDGRID' | 'AWS_SES' | 'ZOHO_MAIL'>('SMTP');
  const [enableDueReminders, setEnableDueReminders] = useState(true);
  const [enableAdminSms, setEnableAdminSms] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Template state
  const [approvalTemplate, setApprovalTemplate] = useState(
`Subject: [FlowPilot Action Required] Requisition {{request_number}} Requires Your Approval

Dear {{approver_name}},

An employee requisition requiring your review has been submitted:
- Request ID: {{request_number}}
- Requester: {{requester_name}} ({{department}})
- Category: {{category}}
- Value / Duration: {{value}}
- Escalation SLA: {{sla_hours}} hours

Please review and approve in FlowPilot:
{{app_url}}/approvals

Best regards,
Anesight Tech Workflow Engine`
  );

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Automation Rules & SLA Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure approval thresholds, escalation timers, notification templates, and email provider abstractions
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Configurations'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Business Thresholds & Escalation */}
        <div className="space-y-6">
          {/* Multi-Tier Approval Threshold Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">High-Value Approval Threshold</h3>
                <p className="text-xs text-slate-500">Triggers dual-level approval (Manager + Executive Admin)</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Expense Threshold Amount (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold text-xs">₹</span>
                <input
                  type="number"
                  value={expenseThreshold}
                  onChange={e => setExpenseThreshold(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Claims above ₹{expenseThreshold.toLocaleString('en-IN')} automatically require approval from both the employee's direct reporting Manager and an Executive Finance Admin.
              </p>
            </div>
          </div>

          {/* SLA Escalation Rules */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Approval SLA & Turnaround Window</h3>
                <p className="text-xs text-slate-500">Automated reminder schedule for pending reviews</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default SLA Target Hours
                </label>
                <select
                  value={slaHours}
                  onChange={e => setSlaHours(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value={24}>24 Hours (Fast-track emergency)</option>
                  <option value={48}>48 Hours (Standard Corporate SLA)</option>
                  <option value={72}>72 Hours (3 Business Days)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDueReminders}
                    onChange={e => setEnableDueReminders(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Dispatch automated reminder email 12h before SLA expiry</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAdminSms}
                    onChange={e => setEnableAdminSms(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">Escalate critical priority breaches to Director via webhook</span>
                </label>
              </div>
            </div>
          </div>

          {/* Email Service Abstraction */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Service Provider Abstraction</h3>
                <p className="text-xs text-slate-500">Configured via environment variables for zero vendor lock-in</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Active Dispatch Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'SMTP', label: 'Local SMTP Gateway' },
                    { id: 'SENDGRID', label: 'SendGrid API' },
                    { id: 'AWS_SES', label: 'Amazon SES' },
                    { id: 'ZOHO_MAIL', label: 'Zoho Mail / Catalyst' },
                  ].map(prov => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setEmailProvider(prov.id as any)}
                      className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                        emailProvider === prov.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg font-mono text-[11px] text-slate-600 border border-slate-200">
                EMAIL_PROVIDER="{emailProvider}"<br />
                SMTP_HOST="mail.anesight.tech"<br />
                SMTP_PORT="587"<br />
                EMAIL_FROM="notifications@anesight.tech"
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Template Editor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Notification Template</h3>
              <p className="text-xs text-slate-500">Rendered when requisitions transition to reviewers</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              APPROVAL_NEEDED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Template Body (Markdown / Plain Text)</label>
                <span className="text-slate-400 text-[11px]">Supports dynamic handlebars</span>
              </div>
              <textarea
                rows={14}
                value={approvalTemplate}
                onChange={e => setApprovalTemplate(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-700 block">Available Template Variables:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-600">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{request_number}}'}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{requester_name}}'}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{department}}'}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{category}}'}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{value}}'}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{'{{sla_hours}}'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
