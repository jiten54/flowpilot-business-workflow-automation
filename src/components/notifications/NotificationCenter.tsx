import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Search, 
  Clock, 
  FileText, 
  ExternalLink,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { 
  markNotificationRead, 
  markAllNotificationsRead, 
  retryNotification 
} from '../../services/storage';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  onNavigateToRequest?: (reqId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'EMAIL'>('ALL');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(notifications[0] || null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);

  const filtered = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'EMAIL') return n.channel === 'EMAIL' || n.channel === 'BOTH';
    return true;
  });

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    onRefresh();
  };

  const handleRetry = (id: string) => {
    const success = retryNotification(id);
    if (success) {
      setRetrySuccess(id);
      onRefresh();
      setTimeout(() => setRetrySuccess(null), 3000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Notification Center & Dispatch Queue
          </h1>
          <p className="text-xs text-slate-500">
            In-app notifications feed, simulated email templates, and delivery retry queues
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filterType === 'UNREAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilterType('EMAIL')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filterType === 'EMAIL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Email Dispatches ({notifications.filter(n => n.channel === 'EMAIL' || n.channel === 'BOTH').length})
        </button>
      </div>

      {/* Two Column Layout: List and Email Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notifications List (5 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No notifications matching current filter.
            </div>
          ) : (
            filtered.map(notif => {
              const isSelected = selectedNotif?.id === notif.id;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    setSelectedNotif(notif);
                    if (!notif.isRead) {
                      markNotificationRead(notif.id);
                      onRefresh();
                    }
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-2 border-blue-600' : 'hover:bg-slate-50'
                  } ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{notif.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.message}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">To: {notif.recipientEmail}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{notif.channel}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-semibold">{notif.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Email Template Preview (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          {selectedNotif ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Dispatch Preview & Email Payload</h3>
                </div>

                <button
                  onClick={() => handleRetry(selectedNotif.id)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {retrySuccess === selectedNotif.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>{retrySuccess === selectedNotif.id ? 'Re-dispatched!' : 'Retry Send'}</span>
                </button>
              </div>

              {/* Delivery Meta */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                <div><span className="text-slate-400 font-sans">Recipient:</span> {selectedNotif.recipientEmail}</div>
                <div><span className="text-slate-400 font-sans">Event Type:</span> {selectedNotif.type}</div>
                <div><span className="text-slate-400 font-sans">Channel:</span> {selectedNotif.channel}</div>
                <div><span className="text-slate-400 font-sans">Delivered At:</span> {new Date(selectedNotif.createdAt).toLocaleString()}</div>
                <div><span className="text-slate-400 font-sans">Delivery Status:</span> <strong className="text-emerald-700">{selectedNotif.status}</strong></div>
              </div>

              {/* Email Client Simulation Frame */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Simulated Mailer Output</span>
                  <span className="font-mono">From: {selectedNotif.emailTemplate?.from || 'notifications@anesight.tech'}</span>
                </div>
                <div className="p-4 bg-white space-y-3 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedNotif.emailTemplate?.subject || selectedNotif.title}
                    </span>
                  </div>

                  {selectedNotif.emailTemplate?.bodyHtml ? (
                    <div 
                      className="text-slate-700 leading-relaxed space-y-2"
                      dangerouslySetInnerHTML={{ __html: selectedNotif.emailTemplate.bodyHtml }}
                    />
                  ) : (
                    <div className="text-slate-700 leading-relaxed">
                      <p>{selectedNotif.message}</p>
                      <p className="mt-3 text-slate-500 text-[11px]">
                        This is an automated notification from FlowPilot Engine at Anesight Tech.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a notification from the list to preview its email contents and delivery metadata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
