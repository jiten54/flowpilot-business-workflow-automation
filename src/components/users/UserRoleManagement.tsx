import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  UserPlus, 
  ArrowRight,
  Briefcase,
  Headphones,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserRoleManagementProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (userId: string) => void;
}

export const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  users,
  currentUser,
  onSwitchUser,
}) => {
  const permissionsMatrix: { feature: string; employee: boolean; manager: boolean; admin: boolean; support: boolean }[] = [
    { feature: 'Submit Employee Requisitions (Leave/Expense/Equipment)', employee: true, manager: true, admin: true, support: true },
    { feature: 'Tier 1 Manager Approval Execution', employee: false, manager: true, admin: true, support: false },
    { feature: 'Tier 2 High-Value Approval (> ₹10,000 Threshold)', employee: false, manager: false, admin: true, support: false },
    { feature: 'CRM Enquiry Lead Logging & Notes', employee: false, manager: true, admin: true, support: true },
    { feature: 'Lead Scoring & Specialist Reassignment', employee: false, manager: false, admin: true, support: true },
    { feature: 'Visual Workflow Builder Modification', employee: false, manager: false, admin: true, support: false },
    { feature: 'Access Immutable Audit Logs & Diffs', employee: false, manager: true, admin: true, support: false },
    { feature: 'Application & Email Provider Settings', employee: false, manager: false, admin: true, support: false },
    { feature: 'Execute Automated QA Test Runner Suite', employee: true, manager: true, admin: true, support: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Directory & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise authorization policies, reporting hierarchies, and departmental role permissions
          </p>
        </div>
      </div>

      {/* User Directory Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Team Organization Directory ({users.length} Users)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(u => {
            const isCurrent = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 transition-all ${
                  isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{u.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'SUPPORT' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="text-slate-500">{u.department}</div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">{u.email}</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSwitchUser(u.id)}
                    className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-700 cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Session</span>
                      </>
                    ) : (
                      <>
                        <span>Switch to this User</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Enterprise RBAC Permission Matrix</h3>
          <p className="text-xs text-slate-500">Fine-grained access rights enforced at API and UI layers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 min-w-[280px]">Operational Capability</th>
                <th className="py-3 px-4 text-center">Employee</th>
                <th className="py-3 px-4 text-center">Manager</th>
                <th className="py-3 px-4 text-center">Support</th>
                <th className="py-3 px-4 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{item.feature}</td>

                  <td className="py-3 px-4 text-center">
                    {item.employee ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {item.manager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {item.support ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  <td className="py-3 px-4 text-center bg-blue-50/30">
                    {item.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
