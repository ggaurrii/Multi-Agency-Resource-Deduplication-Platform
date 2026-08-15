import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { History, ShieldCheck, Lock } from 'lucide-react';

const mockLogs = [
  { timestamp: '2026-08-15 22:30:12', user: 'operator@sahayog.gov.in', agency: 'State Control Room', action: 'AUTHORIZE', entity: 'Allocation', entity_id: 'a-2001', details: 'Authorized NDRF 4,000L water dispatch' },
  { timestamp: '2026-08-15 22:25:05', user: 'system_matching_engine', agency: 'SAHAYOG Platform', action: 'PROPOSE', entity: 'Allocation', entity_id: 'a-2001', details: 'Greedy matching engine generated allocation' },
  { timestamp: '2026-08-15 21:40:18', user: 'staff.kota@ndrf.gov.in', agency: 'NDRF 6th Bn', action: 'CREATE', entity: 'Resource', entity_id: 'r-9012', details: 'Registered 25 rescue boats at Kota Base' },
];

export default function AuditLogs() {
  return (
    <MainLayout title="Platform Audit Trail">
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
            Immutable Audit Trail Log
          </h1>
          <p className="text-xs text-slate-500">
            Read-only chronological record of operational state modifications
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-blue-700" />
          <span>TAMPER-PROOF AUDIT LOG</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <th className="p-3">Timestamp</th>
              <th className="p-3">User Email</th>
              <th className="p-3">Agency</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-slate-500">{log.timestamp}</td>
                <td className="p-3 font-bold text-slate-900">{log.user}</td>
                <td className="p-3 text-slate-700">{log.agency}</td>
                <td className="p-3 font-bold text-blue-900">{log.action}</td>
                <td className="p-3">{log.entity} (#{log.entity_id})</td>
                <td className="p-3 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
