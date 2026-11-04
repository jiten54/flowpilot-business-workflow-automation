import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Mail, 
  Server, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  Sparkles 
} from 'lucide-react';
import { resetToInitialData } from '../../services/storage';

interface AppSettingsProps {
  onResetData: () => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ onResetData }) => {
  const [orgName, setOrgName] = useState('Anesight Tech Pvt Ltd');
  const [currencySymbol, setCurrencySymbol] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST, UTC+5:30)');
  const [zohoWebhookSync, setZohoWebhookSync] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System & Architecture Settings
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise database connection parameters, Zoho Catalyst sync hooks, and platform preferences
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Applied!' : 'Save System Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Organization Parameters</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Currency</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Backend Infrastructure Stack */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Deployment Architecture (Production)</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Frontend Layer</span>
                <p className="text-[11px] text-slate-500">React 19 + TypeScript + Tailwind CSS v4</p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Vercel</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Backend Microservices</span>
                <p className="text-[11px] text-slate-500">Python 3.12 + FastAPI + Pydantic v2</p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Render</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Database Engine</span>
                <p className="text-[11px] text-slate-500">PostgreSQL 16 with SQLAlchemy ORM</p>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Hosted PG</span>
            </div>
          </div>
        </div>

        {/* Zoho Creator Webhook Sync */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Zoho Creator & Catalyst Webhook Gateway</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={zohoWebhookSync}
                onChange={e => setZohoWebhookSync(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="font-semibold text-slate-800">
                Enable bi-directional sync with Zoho Creator Form Events
              </span>
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When active, every approved request triggers a Deluge-style webhook callback to sync status into Zoho ERP tables.
            </p>

            <div className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg border border-slate-800">
              ZOHO_CREATOR_APP_OWNER="anesighttech"<br />
              ZOHO_CREATOR_APP_NAME="flowpilot_enterprise"<br />
              SYNC_STATUS="CONNECTED (Latency: 48ms)"
            </div>
          </div>
        </div>

        {/* Danger Zone: Factory Reset */}
        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900">Database Reset to Default Sample State</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Restores all requisitions, approval steps, CRM enquiries, notifications, and audit records to the original factory test dataset.
          </p>

          <button
            onClick={() => {
              if (window.confirm('Reset FlowPilot database to sample state? All test additions will be reset.')) {
                onResetData();
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
