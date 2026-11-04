import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Code2,
  X
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AuditLogsProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE' | 'WARNING'>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filtered = auditLogs.filter(log => {
    if (outcomeFilter !== 'ALL' && log.outcome !== outcomeFilter) return false;
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchId = log.entityId.toLowerCase().includes(q);
      const matchDesc = log.description.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchId && !matchDesc) return false;
    }
    return true;
  });

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'Actor Name', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Outcome', 'IP Address', 'Description'];
    const rows = filtered.map(l => [
      l.timestamp,
      l.actorName,
      l.actorRole,
      l.action,
      l.entityType,
      l.entityId,
      l.outcome,
      l.ipAddress,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowpilot_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System Audit & Activity Logs
          </h1>
          <p className="text-xs text-slate-500">
            Tamper-evident chronological ledger of all user actions, approval decisions, status changes, and API events
          </p>
        </div>

        <button
          onClick={exportAuditCsv}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by actor, action type, request #, or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['ALL', 'SUCCESS', 'FAILURE', 'WARNING'] as const).map(out => (
              <button
                key={out}
                onClick={() => setOutcomeFilter(out)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  outcomeFilter === out
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {out}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Category Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium shrink-0">Entity:</span>
          {['ALL', 'REQUEST', 'APPROVAL', 'ENQUIRY', 'WORKFLOW', 'AUTH', 'SYSTEM'].map(ent => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors ${
                entityFilter === ent
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ent}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums">
            {filtered.length} events logged
          </span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="block text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{log.actorName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{log.actorRole}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-slate-800 font-medium">{log.entityId}</span>
                    <span className="block text-[10px] text-slate-400">{log.entityType}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                    {log.description}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-semibold">
                    {log.outcome === 'SUCCESS' && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                      </span>
                    )}
                    {log.outcome === 'FAILURE' && (
                      <span className="text-rose-700 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> FAILURE
                      </span>
                    )}
                    {log.outcome === 'WARNING' && (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {log.metadata ? (
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspector Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit Event Metadata Inspector</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedEntry.action} · {selectedEntry.entityId}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-400 mb-0.5">Description</div>
                <div className="font-medium text-slate-800">{selectedEntry.description}</div>
              </div>

              <div>
                <div className="text-slate-400 font-medium mb-1">State Diffs & Parameters (JSON)</div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedEntry.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
