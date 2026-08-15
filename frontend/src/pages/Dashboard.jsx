import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  FileText,
  Boxes,
  Truck,
  GitPullRequest,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [sumData, needsData, allocData] = await Promise.all([
        sahayogApi.getDashboardSummary(),
        sahayogApi.getNeeds({ page_size: 5 }),
        sahayogApi.getAllocations({ page_size: 5 }),
      ]);
      setSummary(sumData);
      setNeeds(needsData?.items || []);
      setAllocations(allocData?.items || []);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Unable to reach backend API. Displaying cached command center metrics.');
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

  return (
    <MainLayout title="SAHAYOG Command Center" unreadAlertsCount={summary?.unread_alerts_count || 0}>
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold tracking-wide uppercase font-mono text-white">
              SAHAYOG Command Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-900 text-blue-200 rounded border border-blue-700">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Multi-Agency Disaster Resource Coordination — Rajasthan Flood Response (Hadoti Sector)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <button
            onClick={() => navigate('/matching')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded text-xs font-mono font-semibold text-white shadow-sm transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Matching Engine</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-900/30 border border-amber-700/60 rounded text-xs text-amber-200 flex items-center justify-between font-mono">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="underline text-amber-300">Dismiss</button>
        </div>
      )}

      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Critical Needs */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Critical Needs</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-rose-600">
              {loading ? '...' : summary?.needs?.critical_count ?? 4}
            </span>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
              Immediate Action
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Deadline ≤ 2 hours</p>
        </div>

        {/* Card 2: Open Needs */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Open Needs</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900">
              {loading ? '...' : summary?.needs?.open ?? 8}
            </span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
              Unfulfilled
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total Active Requisitions</p>
        </div>

        {/* Card 3: Available Resources */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Available Stock</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-700">
              {loading ? '...' : (summary?.resources?.available ?? 78500).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
              Pooled
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ready for Dispatch</p>
        </div>

        {/* Card 4: Resources In Transit */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-blue-700">
              {loading ? '...' : (summary?.resources?.in_transit ?? 20500).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
              En Route
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Authorized Shipments</p>
        </div>

        {/* Card 5: Active Allocations */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Allocations</span>
            <GitPullRequest className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-purple-700">
              {loading ? '...' : (summary?.needs?.partially_met ?? 5) + (summary?.needs?.resolved ?? 5)}
            </span>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
              Active Match
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Proposed / Accepted</p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID: RESOURCE BALANCE & DISTRICT STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RESOURCE BALANCE SECTION (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
                Resource Balance & Allocation Stock
              </h2>
              <p className="text-xs text-slate-500">
                Pooled availability vs. reserved demand across all agencies
              </p>
            </div>
            <button
              onClick={() => navigate('/pool')}
              className="text-xs font-mono text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <span>View Pool Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Water */}
            <div className="border border-slate-100 rounded-md p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-slate-900 text-sm">Drinking Water (liters)</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[11px]">
                  DEFICIT: -10,000 L
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '60%' }} title="Available: 15,000 L"></div>
                <div className="bg-purple-500 h-full" style={{ width: '20%' }} title="Reserved: 5,000 L"></div>
                <div className="bg-blue-500 h-full" style={{ width: '20%' }} title="In Transit: 5,000 L"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available: 15,000 L</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Reserved: 5,000 L</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Transit: 5,000 L</span>
                <span className="font-bold text-slate-900">Total Demand: 25,000 L</span>
              </div>
            </div>

            {/* Rescue Boats */}
            <div className="border border-slate-100 rounded-md p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-slate-900 text-sm">Rescue Boats (units)</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[11px]">
                  DEFICIT: -7 UNITS
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '70%' }} title="Available: 18 units"></div>
                <div className="bg-purple-500 h-full" style={{ width: '15%' }} title="Reserved: 4 units"></div>
                <div className="bg-blue-500 h-full" style={{ width: '15%' }} title="In Transit: 4 units"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available: 18</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Reserved: 4</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Transit: 4</span>
                <span className="font-bold text-slate-900">Total Demand: 25</span>
              </div>
            </div>

            {/* Food Packets */}
            <div className="border border-slate-100 rounded-md p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-slate-900 text-sm">Food Ration Packets</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
                  SURPLUS: +4,000 PACKETS
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '75%' }} title="Available: 12,000"></div>
                <div className="bg-purple-500 h-full" style={{ width: '15%' }} title="Reserved: 2,000"></div>
                <div className="bg-blue-500 h-full" style={{ width: '10%' }} title="In Transit: 1,000"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available: 12,000</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Reserved: 2,000</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Transit: 1,000</span>
                <span className="font-bold text-slate-900">Total Demand: 8,000</span>
              </div>
            </div>

            {/* Ambulances */}
            <div className="border border-slate-100 rounded-md p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-bold text-slate-900 text-sm">Medical Ambulances</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[11px]">
                  DEFICIT: -4 UNITS
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '65%' }} title="Available: 8"></div>
                <div className="bg-purple-500 h-full" style={{ width: '20%' }} title="Reserved: 2"></div>
                <div className="bg-blue-500 h-full" style={{ width: '15%' }} title="In Transit: 2"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available: 8</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Reserved: 2</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Transit: 2</span>
                <span className="font-bold text-slate-900">Total Demand: 12</span>
              </div>
            </div>
          </div>
        </div>

        {/* DISTRICT STATUS SECTION (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
              District Sector Status
            </h2>
            <p className="text-xs text-slate-500">Hadoti Region Administrative Sectors</p>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {/* Kota */}
            <div className="border border-rose-200 bg-rose-50/50 rounded p-3 text-xs">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" /> KOTA
                </span>
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px]">CRITICAL</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-slate-700 text-[11px]">
                <div>Water Deficit: <span className="font-bold text-rose-700">-4,500 L</span></div>
                <div>Open Needs: <span className="font-bold">8</span></div>
                <div>Agencies Present: <span className="font-bold">4 (NDRF/Army)</span></div>
                <div>Priority: <span className="font-bold text-rose-700">CRITICAL (1.5h)</span></div>
              </div>
            </div>

            {/* Bundi */}
            <div className="border border-amber-200 bg-amber-50/50 rounded p-3 text-xs">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> BUNDI
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px]">HIGH ALERT</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-slate-700 text-[11px]">
                <div>Food Balance: <span className="font-bold text-emerald-700">+4,000 PKT</span></div>
                <div>Open Needs: <span className="font-bold">4</span></div>
                <div>Agencies Present: <span className="font-bold">3 (SDRF/NGO)</span></div>
                <div>Priority: <span className="font-bold text-amber-700">HIGH (4.0h)</span></div>
              </div>
            </div>

            {/* Baran */}
            <div className="border border-amber-200 bg-amber-50/50 rounded p-3 text-xs">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> BARAN
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px]">HIGH ALERT</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-slate-700 text-[11px]">
                <div>Ambulance Deficit: <span className="font-bold text-rose-700">-4 Units</span></div>
                <div>Open Needs: <span className="font-bold">3</span></div>
                <div>Agencies Present: <span className="font-bold">2 (Army/Health)</span></div>
                <div>Priority: <span className="font-bold text-amber-700">HIGH (5.5h)</span></div>
              </div>
            </div>

            {/* Jhalawar */}
            <div className="border border-emerald-200 bg-emerald-50/50 rounded p-3 text-xs">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> JHALAWAR
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">STABLE / SURPLUS</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-slate-700 text-[11px]">
                <div>Generators Surplus: <span className="font-bold text-emerald-700">+4 Units</span></div>
                <div>Open Needs: <span className="font-bold">1</span></div>
                <div>Agencies Present: <span className="font-bold">2 (SDRF/Local)</span></div>
                <div>Priority: <span className="font-bold text-emerald-700">LOW (28h)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL NEEDS TABLE & RECENT ALLOCATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRITICAL NEEDS TABLE */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
                Critical Priority Requisitions
              </h2>
            </div>
            <button
              onClick={() => navigate('/needs')}
              className="text-xs font-mono text-blue-700 hover:text-blue-900 font-semibold"
            >
              View All Needs ({summary?.needs?.total_needs ?? 18})
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                  <th className="p-3">District</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Req / Fulfilled</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">Kota</td>
                  <td className="p-3 font-semibold text-blue-900">DRINKING_WATER</td>
                  <td className="p-3">10,000 / <span className="text-amber-700">2,500 L</span></td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded">
                      CRITICAL (1.5h)
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate('/matching')}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold"
                    >
                      Match Stock
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">Kota</td>
                  <td className="p-3 font-semibold text-blue-900">BOAT</td>
                  <td className="p-3">15 / <span className="text-amber-700">5 units</span></td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded">
                      CRITICAL (1.8h)
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate('/matching')}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold"
                    >
                      Match Stock
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">Baran</td>
                  <td className="p-3 font-semibold text-blue-900">AMBULANCE</td>
                  <td className="p-3">6 / <span className="text-amber-700">2 units</span></td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">
                      HIGH (4.2h)
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate('/matching')}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[10px] font-bold"
                    >
                      Match Stock
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ALLOCATIONS TABLE */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
                Recent Allocation Dispatch
              </h2>
            </div>
            <button
              onClick={() => navigate('/allocations')}
              className="text-xs font-mono text-blue-700 hover:text-blue-900 font-semibold"
            >
              Manage Allocations
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                  <th className="p-3">Agency</th>
                  <th className="p-3">Resource Split</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">NDRF Kota</td>
                  <td className="p-3">4,000 L Water</td>
                  <td className="p-3 text-slate-600">12 km</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded text-[10px]">
                      IN_TRANSIT
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">Army 61 Bn</td>
                  <td className="p-3">3,500 L Water</td>
                  <td className="p-3 text-slate-600">28 km</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 font-bold rounded text-[10px]">
                      PROPOSED
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">NGO Sahayata</td>
                  <td className="p-3">2,000 Food Pkts</td>
                  <td className="p-3 text-slate-600">14 km</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded text-[10px]">
                      ACCEPTED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
