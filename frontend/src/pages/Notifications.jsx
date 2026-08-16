import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  RotateCcw,
  Eye,
  X,
  ShieldAlert,
  ArrowRight,
  MapPin
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (readFilter === 'unread') params.unread_only = true;

      const data = await sahayogApi.getNotifications(params);
      setNotifications(data?.items || []);
    } catch (err) {
      console.error('Error fetching backend notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [readFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSeverityFilter('');
    setTypeFilter('');
    setReadFilter('');
  };

  const itemsToDisplay = notifications.filter((a) => {
    const textToSearch = `${a.title || ''} ${a.message || ''}`.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      textToSearch.includes(searchQuery.toLowerCase()) ||
      (a.district_name && a.district_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = !severityFilter || a.severity === severityFilter;
    const matchesType = !typeFilter || a.type === typeFilter;
    const matchesRead =
      !readFilter ||
      (readFilter === 'unread' ? !a.read_at : true) ||
      (readFilter === 'read' ? !!a.read_at : true);

    return matchesSearch && matchesSeverity && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((a) => !a.read_at).length;
  const criticalCount = notifications.filter((a) => a.severity === 'CRITICAL').length;
  const resourceAlertCount = notifications.filter((a) => a.type === 'RESOURCE_SHORTAGE' || a.type === 'CRITICAL_NEED').length;
  const allocAlertCount = notifications.filter((a) => a.type.includes('ALLOCATION')).length;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
    }
  };

  const handleSmartNavigate = (alert) => {
    if (alert.ref_type === 'need' || alert.type.includes('NEED') || alert.type.includes('SHORTAGE')) {
      navigate(alert.ref_id ? `/matching?need=${alert.ref_id}` : '/needs');
    } else if (alert.ref_type === 'allocation' || alert.type.includes('ALLOCATION')) {
      navigate('/allocations');
    } else {
      navigate('/map');
    }
  };

  return (
    <MainLayout title="OPERATIONAL ALERTS">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Operational Alerts & Notifications
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Real-time multi-agency disaster response notifications and system alerts
          </p>
        </div>
        <span className="px-2.5 py-1 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] text-[11px] font-mono font-bold rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
          {unreadCount} UNREAD ALERTS
        </span>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying command center alert console stream.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype View
          </span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Unread Alerts</span>
            <Bell className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{unreadCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Requires Review</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Critical Severity</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{criticalCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Immediate Deficit Risk</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Resource Shortages</span>
            <AlertTriangle className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">{resourceAlertCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Stock Warnings</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Allocation Dispatches</span>
            <CheckCircle2 className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">{allocAlertCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Match Proposal Events</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search alert text, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Categories</option>
            <option value="CRITICAL_NEED">Critical Need</option>
            <option value="RESOURCE_SHORTAGE">Resource Shortage</option>
            <option value="ALLOCATION_PROPOSED">Allocation Proposed</option>
            <option value="ALLOCATION_ACCEPTED">Allocation Authorized</option>
            <option value="ALLOCATION_REJECTED">Allocation Rejected</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Read Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
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
            Showing <strong className="text-[#243447]">{itemsToDisplay.length}</strong> alerts
          </span>
        </div>
      </div>

      {/* NOTIFICATION STREAM LIST */}
      <div className="space-y-2.5 font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading operational alerts...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] bg-white border border-[#D9E3EC] rounded">
            NO ACTIVE ALERTS FOUND MATCHING SELECTION.
          </div>
        ) : (
          itemsToDisplay.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded p-3 shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                !alert.read_at ? 'border-l-3 border-l-[#D97706] border-[#D9E3EC] bg-[#FFF8E1]/30' : 'border-[#D9E3EC]'
              }`}
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="px-2 py-0.5 bg-[#DCECF8] text-[#1E425E] font-bold text-[10px] rounded border border-[#8DB9D9]">
                    {alert.type}
                  </span>
                  {alert.district_name && (
                    <span className="text-[#64748B] font-bold flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#C62828]" /> {alert.district_name} Sector
                    </span>
                  )}
                  <span className="text-[#64748B] text-[11px]">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="font-bold text-[#243447] text-xs">{alert.title}</h3>
                <p className="text-[#64748B] text-[11px] leading-relaxed">{alert.message}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="px-2 py-1 bg-[#64748B] hover:bg-[#475569] text-white rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Eye className="w-3 h-3 text-[#FFE082]" />
                  Inspect
                </button>
                <button
                  onClick={() => handleSmartNavigate(alert)}
                  className="px-2.5 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <span>ACTION</span>
                  <ArrowRight className="w-3 h-3 text-[#FFE082]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INSPECTION SLIDE-OVER */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end font-mono text-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#F4F8FC] text-[#243447] flex items-center justify-between border-b border-[#D9E3EC]">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#35698F]" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Alert Inspection</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Alert Identifier</span>
                <p className="font-bold text-[#243447] text-sm">#{selectedAlert.id}</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getSeverityBadge(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                  <span className="px-2 py-0.5 bg-[#DCECF8] text-[#1E425E] font-bold rounded text-[10px]">
                    {selectedAlert.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1">
                  Alert Description & Context
                </h4>
                <p className="text-[#243447] leading-relaxed font-semibold">{selectedAlert.title}</p>
                <p className="text-[#64748B] bg-[#F4F8FC] p-3 rounded border border-[#D9E3EC] leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-between items-center">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-1.5 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const alert = selectedAlert;
                  setSelectedAlert(null);
                  handleSmartNavigate(alert);
                }}
                className="px-4 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <span>VIEW RECORD</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFE082]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
