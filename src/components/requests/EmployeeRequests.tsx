import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  RotateCcw,
  Download
} from 'lucide-react';
import { BusinessRequest, RequestType, RequestStatus, User } from '../../types';

interface EmployeeRequestsProps {
  requests: BusinessRequest[];
  currentUser: User;
  onSelectRequest: (request: BusinessRequest) => void;
  onOpenNewModal: () => void;
}

export const EmployeeRequests: React.FC<EmployeeRequestsProps> = ({
  requests,
  currentUser,
  onSelectRequest,
  onOpenNewModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Type filter
      if (selectedType !== 'ALL' && req.type !== selectedType) return false;
      // Status filter
      if (selectedStatus !== 'ALL' && req.status !== selectedStatus) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchNumber = req.requestNumber.toLowerCase().includes(q);
        const matchRequester = req.requesterName.toLowerCase().includes(q);
        const matchCat = req.category.toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchRequester && !matchCat) return false;
      }
      return true;
    });
  }, [requests, selectedType, selectedStatus, searchQuery]);

  const exportCsv = () => {
    const headers = ['Request Number', 'Type', 'Title', 'Category', 'Amount (INR)', 'Days', 'Status', 'Requester', 'Date'];
    const rows = filteredRequests.map(r => [
      r.requestNumber,
      r.type,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.amount || '',
      r.daysCount || '',
      r.status,
      r.requesterName,
      new Date(r.createdAt).toISOString().split('T')[0]
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowpilot_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employee Request Management
          </h1>
          <p className="text-xs text-slate-500">
            Track, review, and manage leave applications, reimbursement claims, and equipment requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Requisition</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by request #, title, category, or requester..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Interactive Segmented Filter for Type */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
            {['ALL', 'EXPENSE', 'LEAVE', 'EQUIPMENT'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium shrink-0">Status:</span>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                selectedStatus === st
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums shrink-0">
            {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No Requisitions Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records found for the selected filters. Try resetting filters or submit a new request.
            </p>
            <button
              onClick={() => { setSelectedType('ALL'); setSelectedStatus('ALL'); setSearchQuery(''); }}
              className="px-3 py-1.5 text-xs text-blue-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right">Value / Period</th>
                  <th className="py-3 px-4">Approval Chain</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {req.requestNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{req.type}</span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[220px] max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{req.title}</div>
                        <div className="text-slate-400 text-[11px] truncate flex items-center gap-1.5 mt-0.5">
                          <span>{req.category}</span>
                          {req.requiresAdminApproval && (
                            <>
                              <span>·</span>
                              <span className="text-amber-700 font-medium">Dual-tier (&gt;₹10k)</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{req.requesterName}</div>
                        <div className="text-[11px] text-slate-400">{req.requesterDepartment}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                        {req.amount !== undefined ? (
                          <span className="font-bold text-slate-900">
                            ₹{req.amount.toLocaleString('en-IN')}
                          </span>
                        ) : req.daysCount !== undefined ? (
                          <span className="text-slate-700 font-medium">
                            {req.daysCount} days
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          {req.approvalChain.map((step, idx) => (
                            <span
                              key={step.id}
                              title={`Step ${step.stepNumber}: ${step.roleRequired} (${step.status})`}
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                step.status === 'APPROVED' ? 'bg-emerald-600 text-white' :
                                step.status === 'REJECTED' ? 'bg-rose-600 text-white' :
                                idx === req.currentStepIndex && req.status !== 'CANCELLED' ? 'bg-blue-600 text-white' :
                                'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {step.stepNumber}
                            </span>
                          ))}
                          <span className="text-slate-400 text-[11px] ml-1">
                            {req.approvalChain.length === 2 ? 'Manager + Admin' : 'Manager'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {req.status === 'APPROVED' && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {req.status === 'UNDER_REVIEW' && (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Review Tier {req.currentStepIndex + 1}
                          </span>
                        )}
                        {req.status === 'SUBMITTED' && (
                          <span className="text-blue-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Submitted
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {req.status === 'CANCELLED' && (
                          <span className="text-slate-400 font-medium">Cancelled</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRequest(req);
                          }}
                          className="px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
