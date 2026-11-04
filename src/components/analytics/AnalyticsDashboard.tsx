import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee,
  FileSpreadsheet
} from 'lucide-react';
import { BusinessRequest, CrmEnquiry, WorkflowDefinition } from '../../types';

interface AnalyticsDashboardProps {
  requests: BusinessRequest[];
  enquiries: CrmEnquiry[];
  workflows: WorkflowDefinition[];
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  requests,
  enquiries,
  workflows,
}) => {
  const [dateRange, setDateRange] = useState<'30D' | '90D' | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Compute metrics
  const totalExpenseAmount = useMemo(() => {
    return requests
      .filter(r => r.type === 'EXPENSE' && r.status === 'APPROVED')
      .reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [requests]);

  const approvalRate = useMemo(() => {
    const decided = requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED');
    if (decided.length === 0) return 100;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    return Math.round((approved / decided.length) * 100);
  }, [requests]);

  // Chart 1: Requests by Type
  const requestsByType = useMemo(() => {
    const counts: Record<string, number> = { EXPENSE: 0, LEAVE: 0, EQUIPMENT: 0 };
    requests.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [requests]);

  // Chart 2: Status Breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));
  }, [requests]);

  // Chart 3: Expense by Category
  const expenseByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    requests.filter(r => r.type === 'EXPENSE').forEach(r => {
      catMap[r.category] = (catMap[r.category] || 0) + (r.amount || 0);
    });
    return Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [requests]);

  const handleExportSummaryCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Requisitions', requests.length],
      ['Approved Requests', requests.filter(r => r.status === 'APPROVED').length],
      ['Pending Approvals', requests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length],
      ['Rejected Requests', requests.filter(r => r.status === 'REJECTED').length],
      ['Approval Rate (%)', `${approvalRate}%`],
      ['Total Approved Expense (INR)', `₹${totalExpenseAmount.toLocaleString('en-IN')}`],
      ['Average Turnaround Time', '4.2 hours'],
      ['Open CRM Enquiries', enquiries.filter(e => e.status !== 'RESOLVED' && e.status !== 'CLOSED').length],
      ['Total Workflow Automated Runs', workflows.reduce((a, w) => a + w.executionCount, 0)],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowpilot_executive_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Analytics & Executive Reporting
          </h1>
          <p className="text-xs text-slate-500">
            Requisition volumes, financial turnaround velocity, SLA conformance, and workflow efficiency
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            {(['30D', '90D', 'ALL'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  dateRange === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d === '30D' ? 'Last 30 Days' : d === '90D' ? 'Last Quarter' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportSummaryCsv}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Approval Ratio</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {approvalRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Policy adherence rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total Approved Expense</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Disbursed via payroll</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Average Review SLA</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            4.2 hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target SLA: 48.0 hours</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Automated Workflow Executions</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-600">
            {workflows.reduce((a, w) => a + w.executionCount, 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% automated routing</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Requisitions by Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Requisitions Distribution by Type</h3>
            <span className="text-[11px] text-slate-400">Total: {requests.length}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: 8, fontSize: 12 }} 
                />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Current Request Lifecycle Statuses</h3>
            <span className="text-[11px] text-slate-400">Real-time status</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: 8, fontSize: 12 }} 
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Expense by Category */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reimbursement Spend by Category (INR ₹)</h3>
              <p className="text-xs text-slate-500">Corporate expenditure classification</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
              Total: ₹{totalExpenseAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseByCategory} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `₹${v}`} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
