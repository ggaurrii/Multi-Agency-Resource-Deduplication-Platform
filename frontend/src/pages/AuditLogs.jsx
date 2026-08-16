import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  Lock,
  Search,
  RotateCcw,
  Eye,
  X,
  ShieldAlert,
  UserCheck,
  Shield
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;

      const data = await sahayogApi.getAuditLogs(params);
      setLogs(data?.items || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [actionFilter, entityFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('');
    setEntityFilter('');
  };

  const itemsToDisplay = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      (log.user_name && log.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.agency_name && log.agency_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.change_summary && log.change_summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entity_id && String(log.entity_id).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entity === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionBadge = (act) => {
    switch (act) {
      case 'AUTHORIZE':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      case 'REJECT':
        return 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] font-bold';
      case 'CREATE':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'UPDATE':
        return 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B] font-bold';
    }
  };

  return (
    <MainLayout title="IMMUTABLE AUDIT TRAIL">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Immutable Operational Audit Trail
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Tamper-proof event log recording all system state modifications
          </p>
        </div>
        <span className="px-2.5 py-1 bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] text-[11px] font-mono font-bold rounded flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-[#35698F]" />
          IMMUTABLE LOG ● READ ONLY
        </span>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying audit log events. All records are read-only.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype Data
          </span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search user, agency, action, entity ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Actions</option>
            <option value="AUTHORIZE">AUTHORIZE</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="REJECT">REJECT</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Entity Types</option>
            <option value="allocation">Allocation</option>
            <option value="need">Need</option>
            <option value="resource">Resource</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#D9E3EC]">
          <button
            onClick={clearFilters}
            className="text-xs text-[#64748B] hover:text-[#243447] font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLEAR FILTERS</span>
          </button>
          <span className="text-[#64748B]">
            Showing <strong className="text-[#243447]">{itemsToDisplay.length}</strong> audit records
          </span>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading audit trail...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No audit events recorded yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Timestamp (UTC)</th>
                <th className="p-2.5">User / Operator</th>
                <th className="p-2.5">Agency</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Entity Type</th>
                <th className="p-2.5">Entity ID</th>
                <th className="p-2.5">Change Summary</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 text-[#64748B] font-semibold">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="p-2.5 font-bold text-[#243447] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                    {log.user_name}
                  </td>
                  <td className="p-2.5 text-[#243447]">{log.agency_name}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#243447] font-bold uppercase text-[10px]">{log.entity}</td>
                  <td className="p-2.5 font-bold text-[#1E425E]">#{log.entity_id.slice(0, 8)}</td>
                  <td className="p-2.5 text-[#64748B] max-w-xs truncate">{log.change_summary}</td>
                  <td className="p-2.5">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#FFE082]" />
                      JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* JSON INSPECTION SLIDE-OVER */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end font-mono text-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#F4F8FC] text-[#243447] flex items-center justify-between border-b border-[#D9E3EC]">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-[#35698F]" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Audit JSON Snapshot</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Audit Event ID</span>
                <p className="font-bold text-[#243447] text-sm">#{selectedLog.id}</p>
              </div>

              {selectedLog.before_state && (
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">BEFORE STATE</span>
                  <pre className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] text-[#243447] rounded font-mono text-[11px] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.before_state, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.after_state && (
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">AFTER STATE</span>
                  <pre className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] text-[#243447] rounded font-mono text-[11px] overflow-x-auto mt-1">
                    {JSON.stringify(selectedLog.after_state, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
