import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  RotateCcw,
  Eye,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Zap,
  Activity,
  Shield
} from 'lucide-react';
import { disasterAlerts } from '../data/disasterMockData';

export default function Notifications() {
  const navigate = useNavigate();

  // Category Tab Filter: ALL | EARLY_WARNING | ACTIVE_INCIDENT | RESPONSE
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filteredAlerts = disasterAlerts.filter((alt) => {
    const matchesCategory = activeCategory === 'ALL' || alt.category === activeCategory;
    const matchesSeverity = !severityFilter || alt.severity === severityFilter;
    const textSearch = `${alt.title} ${alt.location} ${alt.recommendedAction}`.toLowerCase();
    const matchesSearch = !searchQuery || textSearch.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#C62828] text-white font-bold animate-pulse';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'EARLY_WARNING':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'ACTIVE_INCIDENT':
        return 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] font-bold';
      case 'RESPONSE':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B] font-bold';
    }
  };

  return (
    <MainLayout title="DISASTER ALERTS & EARLY WARNING CONSOLE">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Disaster Alert & Early Warning Command Console
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Pre-Disaster Warnings, Active Distress Incidents & Multi-Agency Dispatch Notifications
          </p>
        </div>

        {/* 3 CATEGORY TABS */}
        <div className="flex items-center space-x-1 bg-[#F4F8FC] p-1 rounded border border-[#D9E3EC] font-mono text-xs shadow-inner">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1 rounded font-bold transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-[#35698F] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#243447]'
            }`}
          >
            ALL ALERTS
          </button>
          <button
            onClick={() => setActiveCategory('EARLY_WARNING')}
            className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
              activeCategory === 'EARLY_WARNING'
                ? 'bg-[#35698F] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#243447]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>EARLY WARNINGS</span>
          </button>
          <button
            onClick={() => setActiveCategory('ACTIVE_INCIDENT')}
            className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
              activeCategory === 'ACTIVE_INCIDENT'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#243447]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ACTIVE INCIDENTS</span>
          </button>
          <button
            onClick={() => setActiveCategory('RESPONSE')}
            className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
              activeCategory === 'RESPONSE'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#243447]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RESPONSE / STATUS</span>
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Early Warnings</span>
            <Shield className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">
            {disasterAlerts.filter((a) => a.category === 'EARLY_WARNING').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Pre-Disaster Risk Bulletins</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Active Incidents</span>
            <Activity className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">
            {disasterAlerts.filter((a) => a.category === 'ACTIVE_INCIDENT').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Ground Emergencies</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Response Dispatches</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">
            {disasterAlerts.filter((a) => a.category === 'RESPONSE').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Active Shipments</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Critical Severity</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">
            {disasterAlerts.filter((a) => a.severity === 'CRITICAL').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Immediate Action Required</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search title, location, action..."
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

          <button
            onClick={() => {
              setSearchQuery('');
              setSeverityFilter('');
              setActiveCategory('ALL');
            }}
            className="text-xs text-[#64748B] hover:text-[#243447] font-semibold flex items-center justify-center gap-1 border border-[#D9E3EC] rounded py-1.5 bg-[#F4F8FC]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET FILTERS</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION STREAM LIST */}
      <div className="space-y-3 font-mono text-xs">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] bg-white border border-[#D9E3EC] rounded">
            NO DISASTER ALERTS FOUND MATCHING CRITERIA.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL';
            return (
              <div
                key={alt.id}
                className={`p-4 rounded border transition-all shadow-2xs ${
                  isCritical
                    ? 'bg-[#FFEBEE] border-[#FFCDD2] border-l-4 border-l-[#C62828]'
                    : 'bg-white border-[#D9E3EC] hover:bg-[#F4F8FC]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E3EC]/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getCategoryBadge(alt.category)}`}>
                      {alt.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getSeverityBadge(alt.severity)}`}>
                      {alt.severity}
                    </span>
                    <span className="font-bold text-[#243447] text-xs font-mono">{alt.eventType}</span>
                  </div>

                  <span className="text-[11px] text-[#64748B] font-semibold">{alt.timestamp}</span>
                </div>

                <div className="pt-2.5 space-y-2">
                  <h3 className="font-bold text-[#243447] text-sm flex items-center gap-1.5">
                    {isCritical && <AlertOctagon className="w-4 h-4 text-[#C62828] shrink-0" />}
                    <span>{alt.title}</span>
                  </h3>

                  <div className="flex items-center space-x-2 text-[11px] text-[#64748B]">
                    <MapPin className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                    <span>Location Sector: <strong className="text-[#243447]">{alt.location}</strong></span>
                  </div>

                  {/* RECOMMENDED DECISION ACTION BOX */}
                  <div className="p-2.5 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded font-semibold text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-[#D97706] uppercase text-[10px] block font-bold">
                        REQUIRED / RECOMMENDED ACTION:
                      </strong>
                      <span>{alt.recommendedAction}</span>
                    </div>

                    <button
                      onClick={() => navigate('/matching')}
                      className="px-3 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    >
                      <Zap className="w-3 h-3 text-[#FFE082]" />
                      <span>Take Action</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </MainLayout>
  );
}
