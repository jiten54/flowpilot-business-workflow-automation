import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { CrmEnquiry, EnquiryStatus, User as UserType } from '../../types';
import { createEnquiry, addEnquiryNote, updateEnquiryStatus } from '../../services/storage';

interface CrmEnquiriesProps {
  enquiries: CrmEnquiry[];
  allUsers: UserType[];
  currentUser: UserType;
  onRefresh: () => void;
}

export const CrmEnquiries: React.FC<CrmEnquiriesProps> = ({
  enquiries,
  allUsers,
  currentUser,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CrmEnquiry | null>(enquiries[0] || null);
  const [newNoteText, setNewNoteText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Enquiry Form state
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dealValue, setDealValue] = useState<number | ''>(750000);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [assignedToId, setAssignedToId] = useState('usr-sup-01');

  const filtered = enquiries.filter(enq => {
    if (selectedStatus !== 'ALL' && enq.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = enq.customerName.toLowerCase().includes(q);
      const matchComp = enq.companyName.toLowerCase().includes(q);
      const matchSub = enq.subject.toLowerCase().includes(q);
      const matchNum = enq.ticketNumber.toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchSub && !matchNum) return false;
    }
    return true;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNoteText.trim()) return;

    addEnquiryNote(selectedEnquiry.id, newNoteText);
    setNewNoteText('');
    onRefresh();
    // Refresh selected enquiry reference
    const updated = enquiries.find(e => e.id === selectedEnquiry.id);
    if (updated) setSelectedEnquiry(updated);
  };

  const handleStatusChange = (status: EnquiryStatus) => {
    if (!selectedEnquiry) return;
    updateEnquiryStatus(selectedEnquiry.id, status);
    onRefresh();
  };

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !companyName || !subject) return;

    const assignedUser = allUsers.find(u => u.id === assignedToId);

    const created = createEnquiry({
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      subject,
      description,
      source: 'WEBSITE',
      priority,
      status: 'ASSIGNED',
      assignedToId,
      assignedToName: assignedUser?.name || 'Vikram Patel',
      estimatedDealValue: Number(dealValue) || 0,
      followUpDate: '2026-11-06',
    });

    onRefresh();
    setSelectedEnquiry(created);
    setShowNewModal(false);
    // Reset fields
    setCustomerName('');
    setCompanyName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSubject('');
    setDescription('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            CRM Customer Enquiry Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Inbound prospect requests, automated lead scoring, assignment rules, and internal communications
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Enquiry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ticket #, company, contact name, or subject..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs">
          {['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Enquiry List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching enquiries found.
            </div>
          ) : (
            filtered.map(enq => {
              const isSelected = selectedEnquiry?.id === enq.id;
              return (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiry(enq)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-2 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-800">{enq.ticketNumber}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">{enq.subject}</h4>
                  <div className="text-xs text-slate-600 truncate mt-0.5">{enq.companyName} ({enq.customerName})</div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      ₹{enq.estimatedDealValue?.toLocaleString('en-IN') || '—'}
                    </span>
                    <span className={`font-semibold ${
                      enq.status === 'RESOLVED' ? 'text-emerald-700' :
                      enq.status === 'IN_PROGRESS' ? 'text-amber-700' :
                      enq.status === 'ASSIGNED' ? 'text-blue-700' : 'text-slate-600'
                    }`}>
                      {enq.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Enquiry Detail & Notes (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {selectedEnquiry ? (
            <>
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-700">{selectedEnquiry.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedEnquiry.priority} Priority</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedEnquiry.subject}</h2>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Status:</label>
                  <select
                    value={selectedEnquiry.status}
                    onChange={e => handleStatusChange(e.target.value as EnquiryStatus)}
                    className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 font-medium">Company / Client</div>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">{selectedEnquiry.companyName}</div>
                  <div className="text-slate-600">{selectedEnquiry.customerName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium">Deal Potential</div>
                  <div className="font-mono font-bold text-slate-900 text-base mt-0.5 tabular-nums">
                    ₹{selectedEnquiry.estimatedDealValue?.toLocaleString('en-IN') || '—'}
                  </div>
                  <div className="text-slate-500 text-[11px]">Source: {selectedEnquiry.source}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium">Direct Contact</div>
                  <div className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEnquiry.customerEmail}</span>
                  </div>
                  <div className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEnquiry.customerPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-medium">Assigned Specialist</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedEnquiry.assignedToName || 'Unassigned'}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Next follow-up: {selectedEnquiry.followUpDate || 'Not scheduled'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Requirement Summary</h4>
                <p className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.description}
                </p>
              </div>

              {/* Internal Communications & Notes Thread */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Internal Communication Notes ({selectedEnquiry.notes.length})
                </h4>

                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {selectedEnquiry.notes.map(note => (
                    <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-800">{note.authorName}</span>
                        <span className="font-mono text-[10px]">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700">{note.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Log client call notes, discovery findings, or next actions..."
                    className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select an enquiry from the left list to view details and communication history.
            </div>
          )}
        </div>
      </div>

      {/* New Enquiry Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register New Customer Enquiry</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Reliance Retail Logistics"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="ramesh@relianceretail.com"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Zoho Creator Warehouse Dispatch Integration"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Deal Value (INR ₹)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Specialist</label>
                  <select
                    value={assignedToId}
                    onChange={e => setAssignedToId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Notes & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail scope, timelines, or legacy software migration needs..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save & Trigger Lead Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
