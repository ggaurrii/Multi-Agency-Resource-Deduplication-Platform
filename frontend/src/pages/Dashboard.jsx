import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  FileText,
  Boxes,
  Truck,
  GitPullRequest,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Shield,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Wrench,
  Building2
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCommandHeader, getUserCommandRole } from '../utils/permissions';
import {
  LIFECYCLE_PHASES,
  districtRiskProfiles,
  activeIncidents,
  riskZones,
  disasterAlerts
} from '../data/disasterMockData';

const DEFAULT_POST_DISASTER_CASES = [
  {
    id: 'pd-case-001',
    title: 'MBS Hospital Kota Emergency Power & Structural Damage',
    damage_category: 'HOSPITAL',
    district_name: 'Kota',
    location_name: 'Nayapura, Kota',
    recovery_score: 92.5,
    priority_level: 'IMMEDIATE',
    status: 'RESTORATION_STARTED',
    affected_population: 15000,
    estimated_cost_inr: 4500000,
    description: 'Critical hospital power grid disruption and basement water logging following Chambal river overflow.',
  },
  {
    id: 'pd-case-002',
    title: 'NH-52 Chambal River Bridge Approach Washout',
    damage_category: 'BRIDGE',
    district_name: 'Bundi',
    location_name: 'Old Bundi Road Crossing',
    recovery_score: 86.0,
    priority_level: 'IMMEDIATE',
    status: 'ASSESSED',
    affected_population: 12000,
    estimated_cost_inr: 8500000,
    description: 'Bridge structural foundation intact but North approach road eroded by fast-flowing flood water.',
  },
  {
    id: 'pd-case-003',
    title: 'Baran District Electrical Substation Submerged',
    damage_category: 'POWER_INFRASTRUCTURE',
    district_name: 'Baran',
    location_name: 'Anta Road, Baran',
    recovery_score: 78.4,
    priority_level: 'HIGH',
    status: 'RESTORED',
    affected_population: 6500,
    estimated_cost_inr: 2200000,
    description: '33kV Substation transformers inundated. Emergency dewatering completed and power restored.',
  },
  {
    id: 'pd-case-004',
    title: 'Jhalawar Community Relief Shelter Roof Repairs',
    damage_category: 'SHELTER',
    district_name: 'Jhalawar',
    location_name: 'Government Secondary School, Jhalrapatan',
    recovery_score: 64.2,
    priority_level: 'MEDIUM',
    status: 'VERIFIED',
    affected_population: 3200,
    estimated_cost_inr: 950000,
    description: 'Storm wind damage to shelter roof panels. Temporary waterproofing applied and verified.',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const commandHeader = getCommandHeader(user);
  const commandRole = getUserCommandRole(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [postDisasterCases, setPostDisasterCases] = useState([]);

  // Disaster Lifecycle Phase state: PRE_DISASTER | DURING_DISASTER | POST_DISASTER
  const [activePhase, setActivePhase] = useState(LIFECYCLE_PHASES.PRE_DISASTER);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const sumData = await sahayogApi.getDashboardSummary();
      setSummary(sumData);
      try {
        const pdData = await sahayogApi.getPostDisasterCases();
        if (pdData?.items?.length) {
          setPostDisasterCases(pdData.items.slice(0, 4));
        }
      } catch (e) {
        console.warn('Could not fetch live post-disaster cases for dashboard:', e);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Unable to fetch live backend metrics. Displaying prototype disaster decision support state.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'IMMEDIATE':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'REPORTED':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      case 'ASSESSED':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'PRIORITIZED':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      case 'RESTORATION_STARTED':
        return 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] font-bold';
      case 'RESTORED':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      case 'VERIFIED':
        return 'bg-[#2E7D32] text-white font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B]';
    }
  };

  const highRiskCount = districtRiskProfiles.filter((d) => d.riskScore >= 70).length;
  const criticalAlertsCount = disasterAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const activeIncidentsCount = activeIncidents.length;

  return (
    <MainLayout title="Disaster Decision Support Center" unreadAlertsCount={summary?.unread_alerts_count || 3}>
      {/* HEADER BANNER WITH DISASTER LIFECYCLE SELECTOR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-sans shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold tracking-wide uppercase font-mono text-[#243447]">
              {commandHeader.title}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#DCECF8] text-[#1E425E] rounded border border-[#8DB9D9]">
              Logged in as: {commandHeader.badge}
            </span>
          </div>
        </div>

        {/* PROMINENT DISASTER LIFECYCLE TOGGLE */}
        <div className="flex items-center bg-[#EEF5FA] border border-[#D7E2EA] p-1 rounded font-mono text-xs shadow-2xs">
          <button
            onClick={() => setActivePhase(LIFECYCLE_PHASES.PRE_DISASTER)}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activePhase === LIFECYCLE_PHASES.PRE_DISASTER
                ? 'bg-[#2F6F95] text-white shadow-2xs'
                : 'text-[#5B6B7A] hover:text-[#243447]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PRE-DISASTER</span>
          </button>

          <button
            onClick={() => setActivePhase(LIFECYCLE_PHASES.DURING_DISASTER)}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activePhase === LIFECYCLE_PHASES.DURING_DISASTER
                ? 'bg-[#C62828] text-white shadow-2xs'
                : 'text-[#5B6B7A] hover:text-[#243447]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DURING DISASTER</span>
          </button>

          <button
            onClick={() => setActivePhase(LIFECYCLE_PHASES.POST_DISASTER)}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activePhase === LIFECYCLE_PHASES.POST_DISASTER
                ? 'bg-[#2E7D32] text-white shadow-2xs'
                : 'text-[#5B6B7A] hover:text-[#243447]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>POST-DISASTER</span>
          </button>
        </div>
      </div>

      {summary?.is_demo_fallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>PROTOTYPE MODE ACTIVE</strong> — Displaying synchronized decision support datasets for Hadoti region.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            SIH Evaluation Dataset
          </span>
        </div>
      )}

      {/* CURRENT SITUATION OVERVIEW BAR — LIGHT INSTITUTIONAL EOC PANEL */}
      <div className="bg-white border border-[#D7E2EA] text-[#243447] rounded p-4 font-mono shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D7E2EA] pb-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded font-bold text-xs uppercase flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-[#C62828] animate-pulse" />
              <span>OVERALL RISK LEVEL: CRITICAL</span>
            </div>
            <span className="text-xs text-[#5B6B7A]">
              Active Operational Phase: <strong className="text-[#2F6F95] uppercase font-bold">{activePhase.replace('_', ' ')}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-1 px-3 py-1 bg-[#2F6F95] hover:bg-[#255C7C] rounded text-xs font-bold text-white transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Sensor Data'}</span>
            </button>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center space-x-1.5 px-3.5 py-1 bg-[#EEF5FA] hover:bg-[#DCECF7] border border-[#D7E2EA] rounded text-xs font-bold text-[#2F6F95] transition-colors shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#2F6F95]" />
              <span>Launch Command Map</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-[#EEF5FA] border border-[#D7E2EA] rounded p-2.5 shadow-2xs">
            <span className="text-[10px] text-[#5B6B7A] uppercase font-bold">High-Risk Zones</span>
            <p className="text-xl font-bold text-[#C62828] mt-0.5">{highRiskCount} Districts</p>
            <p className="text-[9px] text-[#5B6B7A] mt-0.5">Score ≥ 70/100</p>
          </div>

          <div className="bg-[#EEF5FA] border border-[#D7E2EA] rounded p-2.5 shadow-2xs">
            <span className="text-[10px] text-[#5B6B7A] uppercase font-bold">Active Field Incidents</span>
            <p className="text-xl font-bold text-[#2F6F95] mt-0.5">{activeIncidentsCount} Incidents</p>
            <p className="text-[9px] text-[#5B6B7A] mt-0.5">1 Embankment Breach</p>
          </div>

          <div className="bg-[#EEF5FA] border border-[#D7E2EA] rounded p-2.5 shadow-2xs">
            <span className="text-[10px] text-[#5B6B7A] uppercase font-bold">Critical Alerts</span>
            <p className="text-xl font-bold text-[#C62828] mt-0.5">{criticalAlertsCount} Alerts</p>
            <p className="text-[9px] text-[#5B6B7A] mt-0.5">Immediate Action Required</p>
          </div>

          <div className="bg-[#EEF5FA] border border-[#D7E2EA] rounded p-2.5 shadow-2xs">
            <span className="text-[10px] text-[#5B6B7A] uppercase font-bold">Open Response Needs</span>
            <p className="text-xl font-bold text-[#D97706] mt-0.5">{summary?.needs?.open ?? 8} Requisitions</p>
            <p className="text-[9px] text-[#5B6B7A] mt-0.5">Awaiting Match/Dispatch</p>
          </div>

          <div className="bg-[#EEF5FA] border border-[#D7E2EA] rounded p-2.5 shadow-2xs">
            <span className="text-[10px] text-[#5B6B7A] uppercase font-bold">Available Emergency Stock</span>
            <p className="text-xl font-bold text-[#2E7D32] mt-0.5">
              {(summary?.resources?.available ?? 78500).toLocaleString()} Units
            </p>
            <p className="text-[9px] text-[#5B6B7A] mt-0.5">Multi-Agency Pooled</p>
          </div>
        </div>
      </div>

      {/* TOP KPI SUMMARY CARDS */}
      {activePhase === LIFECYCLE_PHASES.POST_DISASTER ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Damage Sites</span>
              <Building2 className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#243447]">4</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Assessed Infrastructure</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Critical Damage</span>
              <AlertOctagon className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">2</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Hospitals & Bridges</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>People Affected</span>
              <Activity className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#D97706]">36,700</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Displaced / Disrupted</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Restoration Active</span>
              <Zap className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">1</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Repairs Underway</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Recovery Progress</span>
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">40.0%</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Overall Completion</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Restored Sites</span>
              <CheckCircle2 className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">1</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Verified Restored</p>
          </div>
        </div>
      ) : commandRole === 'NDRF_ADMIN' ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Critical Incidents</span>
              <AlertOctagon className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">2</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Immediate Rescue Needed</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Rescue Requisitions</span>
              <FileText className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#D97706]">4</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Rescue Boats & Medics</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Rescue Boats</span>
              <Boxes className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">35</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">NDRF Motorized Boats</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Ambulances</span>
              <Truck className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">8</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Active Medical Units</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Blocked Routes</span>
              <AlertTriangle className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">1</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">NH-52 Submerged</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Dispatch Status</span>
              <Zap className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">ACTIVE</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Battalion 5 Responding</p>
          </div>
        </div>
      ) : commandRole === 'ARMY_ADMIN' ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Logistics Stock</span>
              <Boxes className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#243447]">450</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Heavy Equipment Units</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Blocked Corridors</span>
              <AlertOctagon className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">1</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">NH-52 Washout</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>In-Transit Convoys</span>
              <Truck className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#D97706]">2</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">En Route Bundi</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Heavy Generators</span>
              <Zap className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">15</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Power Units Deployed</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Deployment Status</span>
              <Activity className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">READY</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Hadoti Column Active</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Allocations</span>
              <GitPullRequest className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">3</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Authorized Dispatches</p>
          </div>
        </div>
      ) : commandRole === 'NGO_ADMIN' ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Relief Shelters</span>
              <Building2 className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">8</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Active Relief Centers</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Food Packets Stock</span>
              <Boxes className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#D97706]">7,500</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Ration Packets Ready</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Clean Water</span>
              <Activity className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">12,000 L</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Potable Water Supply</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Assistance Needs</span>
              <FileText className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">3</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Shelter Requests</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Community Reports</span>
              <AlertTriangle className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">2</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Field Submissions</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Recovery Support</span>
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">ACTIVE</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Community Aid</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>High-Risk Zones</span>
              <ShieldAlert className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{highRiskCount}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Score ≥ 70</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Active Incidents</span>
              <Activity className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{activeIncidentsCount}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Ground Reports</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Critical Alerts</span>
              <AlertOctagon className="w-4 h-4 text-[#C62828]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{criticalAlertsCount}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Early Warnings</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Open Needs</span>
              <FileText className="w-4 h-4 text-[#35698F]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#243447]">{summary?.needs?.open ?? 8}</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Unmet Demand</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Available Resources</span>
              <Boxes className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">
              {(summary?.resources?.available ?? 78500).toLocaleString()}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Pooled Stock</p>
          </div>

          <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[10px]">
              <span>Priority Cases</span>
              <Zap className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">4</div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Action Recommended</p>
          </div>
        </div>
      )}

      {/* PHASE-AWARE DASHBOARD BODY CONTENT */}
      {activePhase === LIFECYCLE_PHASES.POST_DISASTER ? (
        <div className="space-y-4 font-mono text-xs">
          {/* POST-DISASTER DAMAGE ASSESSMENT OVERVIEW CARD */}
          <div className="bg-white border border-[#D7E2EA] rounded shadow-2xs">
            <div className="px-4 py-3 border-b border-[#D7E2EA] bg-[#EEF5FA] flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-[#2F6F95]" />
                  <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
                    POST-DISASTER DAMAGE ASSESSMENT & RESTORATION OVERVIEW
                  </h2>
                </div>
                <p className="text-[11px] text-[#5B6B7A]">
                  Transparent Recovery Prioritization Engine (0–100 Score), Infrastructure Restoration Progress & Damage Sites
                </p>
              </div>

              <button
                onClick={() => navigate('/post-disaster')}
                className="px-3.5 py-1.5 bg-[#2F6F95] hover:bg-[#255C7C] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors self-start md:self-auto"
              >
                <span>Open Full Post-Disaster Recovery Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* RECOVERY CASE SUMMARY CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(postDisasterCases.length > 0 ? postDisasterCases : DEFAULT_POST_DISASTER_CASES).map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#D7E2EA] rounded p-3.5 bg-[#F7FAFC] space-y-3 shadow-2xs hover:border-[#2F6F95] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-[#2F6F95]" />
                          <span className="font-bold text-[#243447] text-sm">{item.title}</span>
                        </div>
                        <span className="text-[11px] text-[#5B6B7A] mt-0.5 block">
                          Category: <strong className="text-[#2F6F95]">{item.damage_category}</strong> • District: <strong className="text-[#243447]">{item.district_name || 'Kota'}</strong> ({item.location_name})
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] rounded ${getPriorityBadge(item.priority_level)}`}>
                          {item.priority_level}
                        </span>
                        <div className="mt-1 font-bold text-[#243447] text-sm">
                          Score {item.recovery_score}<span className="text-xs text-[#5B6B7A]">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* RESTORATION STATUS & AFFECTED POPULATION */}
                    <div className="bg-white border border-[#D7E2EA] rounded p-2.5 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between border-b border-[#D7E2EA] pb-1">
                        <span className="text-[10px] font-bold text-[#5B6B7A] uppercase">Restoration Status:</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#5B6B7A]">Affected Population:</span>
                        <strong className="text-[#243447]">{Number(item.affected_population || 0).toLocaleString()} people</strong>
                      </div>
                      {item.estimated_cost_inr && (
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#5B6B7A]">Estimated Repair Cost:</span>
                          <strong className="text-[#2E7D32]">₹ {Number(item.estimated_cost_inr).toLocaleString()} INR</strong>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] bg-[#FFF8E1] border border-[#FFE082] rounded p-2 text-[#854D0E]">
                      <strong className="font-bold uppercase text-[10px] block text-[#D97706]">RESTORATION PLAN SUMMARY:</strong>
                      <span>{item.description}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* BOTTOM ACTION PROMPT */}
              <div className="p-3 bg-[#EEF5FA] border border-[#D7E2EA] rounded text-center flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#5B6B7A] font-semibold">
                  Track full restoration lifecycles, verify completed recoveries, and inspect transparent 4-factor scoring breakdowns.
                </span>
                <button
                  onClick={() => navigate('/post-disaster')}
                  className="px-4 py-1.5 bg-[#2F6F95] hover:bg-[#255C7C] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>Open Full Post-Disaster Recovery Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* RISK PRIORITY RANKING & TRANSPARENT ALGORITHMIC SCORING MODEL */}
          <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs font-mono text-xs">
            <div className="px-4 py-3 border-b border-[#D9E3EC] bg-[#F4F8FC] flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-[#35698F]" />
                  <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
                    PRE-DISASTER RISK PRIORITY MATRIX & TRANSPARENT SCORING MODEL
                  </h2>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Algorithmic Risk Derivation: Risk Score = f(Hazard Severity, Population Exposure, Infrastructure Risk, Time-to-Impact)
                </p>
              </div>
              <button
                onClick={() => navigate('/risk-mitigation')}
                className="text-xs font-bold text-[#35698F] hover:underline flex items-center gap-1 self-start md:self-auto"
              >
                <span>Full Risk Intelligence</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {districtRiskProfiles.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#D9E3EC] rounded p-3 bg-[#F4F8FC] space-y-3 shadow-2xs hover:border-[#35698F] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-[#35698F]" />
                          <span className="font-bold text-[#243447] text-sm">{item.location}</span>
                        </div>
                        <span className="text-[11px] text-[#64748B] mt-0.5 block">
                          Main Hazard: <strong className="text-[#1E425E]">{item.mainHazard}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[10px] rounded ${getRiskBadge(item.riskLevel)}`}>
                          {item.riskLevel} RISK
                        </span>
                        <div className="mt-1 font-bold text-[#243447] text-base">
                          {item.riskScore}<span className="text-xs text-[#64748B]">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* TRANSPARENT SCORING FACTORS BREAKDOWN */}
                    <div className="bg-white border border-[#D9E3EC] rounded p-2.5 space-y-1.5 text-[11px]">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block border-b border-[#D9E3EC] pb-1">
                        Transparent Risk Calculation Factors:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-[#F4F8FC] p-1.5 rounded border border-[#D9E3EC]">
                          <span className="text-[#64748B] text-[9px] block">Hazard Severity</span>
                          <strong className="text-[#C62828] font-mono">{item.factors.hazardSeverity}/100</strong>
                        </div>
                        <div className="bg-[#F4F8FC] p-1.5 rounded border border-[#D9E3EC]">
                          <span className="text-[#64748B] text-[9px] block">Population Exposure</span>
                          <strong className="text-[#D97706] font-mono">{item.factors.populationExposure}/100</strong>
                        </div>
                        <div className="bg-[#F4F8FC] p-1.5 rounded border border-[#D9E3EC]">
                          <span className="text-[#64748B] text-[9px] block">Infra Exposure</span>
                          <strong className="text-[#35698F] font-mono">{item.factors.infrastructureRisk}/100</strong>
                        </div>
                        <div className="bg-[#F4F8FC] p-1.5 rounded border border-[#D9E3EC]">
                          <span className="text-[#64748B] text-[9px] block">Time-to-Impact</span>
                          <strong className="text-[#C62828] font-mono">{item.factors.timeToImpact}/100</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FFF8E1] border border-[#FFE082] rounded p-2 text-[11px] text-[#854D0E]">
                      <strong className="font-bold uppercase text-[10px] block text-[#D97706]">
                        RECOMMENDED DECISION SUPPORT ACTION:
                      </strong>
                      <span>{item.recommendedAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* REQUISITIONS & ALLOCATIONS DISPATCH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* REQUISITIONS */}
            <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs flex flex-col font-mono text-xs">
              <div className="px-4 py-3 border-b border-[#D9E3EC] bg-[#F4F8FC] flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-[#C62828]" />
                  <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
                    Critical Priority Requisitions
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/needs')}
                  className="text-xs font-bold text-[#35698F] hover:underline"
                >
                  View All ({summary?.needs?.total_needs ?? 18})
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse border-b border-[#D9E3EC]">
                  <thead>
                    <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                      <th className="p-2.5">District</th>
                      <th className="p-2.5">Resource</th>
                      <th className="p-2.5">Req / Fulfilled</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3EC]">
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">Kota</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">DRINKING_WATER</td>
                      <td className="p-2.5">10,000 / <span className="text-[#D97706] font-bold">2,500 L</span></td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[9px] font-bold rounded">
                          CRITICAL (1.5h)
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => navigate('/matching')}
                          className="px-2 py-0.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold"
                        >
                          Match Stock
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">Kota</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">BOAT</td>
                      <td className="p-2.5">15 / <span className="text-[#D97706] font-bold">5 units</span></td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[9px] font-bold rounded">
                          CRITICAL (1.8h)
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => navigate('/matching')}
                          className="px-2 py-0.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold"
                        >
                          Match Stock
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">Baran</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">AMBULANCE</td>
                      <td className="p-2.5">6 / <span className="text-[#D97706] font-bold">2 units</span></td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#D97706] text-white text-[9px] font-bold rounded">
                          HIGH (4.2h)
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => navigate('/matching')}
                          className="px-2 py-0.5 bg-[#64748B] hover:bg-[#475569] text-white rounded text-[10px] font-bold"
                        >
                          Match Stock
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ALLOCATIONS */}
            <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs flex flex-col font-mono text-xs">
              <div className="px-4 py-3 border-b border-[#D9E3EC] bg-[#F4F8FC] flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-[#35698F]" />
                  <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
                    Recent Allocation Dispatch
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/allocations')}
                  className="text-xs font-bold text-[#35698F] hover:underline"
                >
                  Manage Allocations
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse border-b border-[#D9E3EC]">
                  <thead>
                    <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                      <th className="p-2.5">Agency</th>
                      <th className="p-2.5">Resource Split</th>
                      <th className="p-2.5">Distance</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3EC]">
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">NDRF Kota</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">4,000 L Water</td>
                      <td className="p-2.5 text-[#64748B]">12 km</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold rounded text-[9px]">
                          IN_TRANSIT
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">Army 61 Bn</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">3,500 L Water</td>
                      <td className="p-2.5 text-[#64748B]">28 km</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold rounded text-[9px]">
                          PROPOSED
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F4F8FC]">
                      <td className="p-2.5 font-bold text-[#243447]">NGO Sahayata</td>
                      <td className="p-2.5 font-semibold text-[#1E425E]">2,000 Food Pkts</td>
                      <td className="p-2.5 text-[#64748B]">14 km</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold rounded text-[9px]">
                          ACCEPTED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
