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
  ShieldAlert
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
      setError('Unable to fetch live backend metrics. Showing prototype command center state.');
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
      <div className="bg-white border border-[#D9E3EC] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-wide uppercase font-mono text-[#243447]">
              State Emergency Operations Center
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#DCECF8] text-[#1E425E] rounded border border-[#8DB9D9]">
              LIVE DISASTER CONTROL
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Hadoti Flood Relief & Multi-Agency Resource Coordination (Kota, Bundi, Baran, Jhalawar)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#F4F8FC] hover:bg-[#DCECF8] border border-[#D9E3EC] rounded text-xs font-mono font-semibold text-[#243447] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <button
            onClick={() => navigate('/matching')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] border border-[#255273] rounded text-xs font-mono font-bold text-white shadow-2xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#FFE082]" />
            <span>Match Engine</span>
          </button>
        </div>
      </div>

      {summary?.is_demo_fallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV AUTH ACTIVE</strong> — Live DB synchronization requires active JWT login. Displaying prototype command center state.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype View
          </span>
        </div>
      )}

      {/* ACTIVE ALERTS SECTION */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 font-mono text-xs shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#D9E3EC] pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C62828] animate-pulse"></span>
            <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
              OPERATIONAL ALERTS
            </h2>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="text-[11px] font-bold text-[#35698F] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL ({summary?.unread_alerts_count || 3})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded p-2.5 text-xs space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-[#C62828] flex items-center gap-1 text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5 text-[#C62828]" /> CRITICAL DEFICIT
              </span>
              <span className="text-[9px] bg-[#C62828] text-white px-1.5 py-0.5 rounded uppercase">Kota Sector</span>
            </div>
            <p className="font-bold text-[#243447] text-xs">Drinking Water Deficit: -10,000 L</p>
            <p className="text-[11px] text-[#64748B]">Shelter camps requirement. Deadline ≤ 1.5h</p>
          </div>

          <div className="bg-[#FFF8E1] border border-[#FFE082] rounded p-2.5 text-xs space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-[#D97706] flex items-center gap-1 text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5 text-[#D97706]" /> HIGH PRIORITY
              </span>
              <span className="text-[9px] bg-[#D97706] text-white px-1.5 py-0.5 rounded uppercase">Kota Sector</span>
            </div>
            <p className="font-bold text-[#243447] text-xs">Rescue Boats Needed: 15 Units</p>
            <p className="text-[11px] text-[#64748B]">5/15 units matched. Additional 10 needed.</p>
          </div>

          <div className="bg-[#DCECF8] border border-[#8DB9D9] rounded p-2.5 text-xs space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="text-[#1E425E] flex items-center gap-1 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-[#35698F]" /> ALLOCATION PROPOSED
              </span>
              <span className="text-[9px] bg-[#35698F] text-white px-1.5 py-0.5 rounded uppercase">#alloc-9901</span>
            </div>
            <p className="font-bold text-[#243447] text-xs">Proposal alloc-9901 Awaiting Review</p>
            <p className="text-[11px] text-[#64748B]">6,000 L water matched (NDRF + Army).</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded text-xs text-[#C62828] flex items-center justify-between font-mono">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="underline font-bold text-[#C62828]">Dismiss</button>
        </div>
      )}

      {/* TOP COMPACT OPERATIONAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold uppercase">
            <span>Critical Needs</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#C62828]">
              {loading ? '...' : summary?.needs?.critical_count ?? 4}
            </span>
            <span className="text-[9px] text-[#C62828] bg-[#FFEBEE] px-1.5 py-0.5 rounded font-bold uppercase">
              ≤ 2 Hours
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Immediate Requisition</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold uppercase">
            <span>Open Needs</span>
            <FileText className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#243447]">
              {loading ? '...' : summary?.needs?.open ?? 8}
            </span>
            <span className="text-[9px] text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded font-bold uppercase">
              Unmet
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Active Demands</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold uppercase">
            <span>Available Stock</span>
            <Boxes className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#2E7D32]">
              {loading ? '...' : (summary?.resources?.available ?? 78500).toLocaleString()}
            </span>
            <span className="text-[9px] text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded font-bold uppercase">
              Pooled
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Ready to Dispatch</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold uppercase">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#1E425E]">
              {loading ? '...' : (summary?.resources?.in_transit ?? 20500).toLocaleString()}
            </span>
            <span className="text-[9px] text-[#1E425E] bg-[#DCECF8] px-1.5 py-0.5 rounded font-bold uppercase">
              En Route
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Authorized Shipments</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold uppercase">
            <span>Allocations</span>
            <GitPullRequest className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#6B21A8]">
              {loading ? '...' : (summary?.needs?.partially_met ?? 5) + (summary?.needs?.resolved ?? 5)}
            </span>
            <span className="text-[9px] text-[#6B21A8] bg-[#F3E8FF] px-1.5 py-0.5 rounded font-bold uppercase">
              Matched
            </span>
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Proposed / Accepted</p>
        </div>
      </div>

      {/* RESOURCE BALANCE MONITORING TABLE & DISTRICT STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RESOURCE BALANCE TABLE (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#D9E3EC] rounded shadow-2xs">
          <div className="px-4 py-3 border-b border-[#D9E3EC] bg-[#F4F8FC] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold font-mono text-[#243447] uppercase tracking-wide">
                Resource Availability & Allocation Stock
              </h2>
              <p className="text-[11px] text-[#64748B]">Multi-Agency Deduplicated Inventory Monitoring</p>
            </div>
            <button
              onClick={() => navigate('/pool')}
              className="text-xs font-mono text-[#35698F] hover:underline font-bold flex items-center gap-1"
            >
              <span>Pooled Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4 font-mono text-xs">
            {/* Table layout */}
            <table className="w-full text-left border-collapse border border-[#D9E3EC]">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                  <th className="p-2.5">Resource</th>
                  <th className="p-2.5">Available</th>
                  <th className="p-2.5">Reserved</th>
                  <th className="p-2.5">In Transit</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3EC]">
                <tr className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">DRINKING WATER</td>
                  <td className="p-2.5 text-[#2E7D32] font-bold">15,000 L</td>
                  <td className="p-2.5 text-[#CA8A04] font-bold">3,000 L</td>
                  <td className="p-2.5 text-[#35698F] font-bold">5,000 L</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[10px] font-bold rounded">
                      DEFICIT (-10k L)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">RESCUE BOATS</td>
                  <td className="p-2.5 text-[#2E7D32] font-bold">18 units</td>
                  <td className="p-2.5 text-[#CA8A04] font-bold">5 units</td>
                  <td className="p-2.5 text-[#35698F] font-bold">7 units</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] text-[10px] font-bold rounded">
                      DEFICIT (-7)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">FOOD PACKETS</td>
                  <td className="p-2.5 text-[#2E7D32] font-bold">12,000 pkts</td>
                  <td className="p-2.5 text-[#CA8A04] font-bold">2,000 pkts</td>
                  <td className="p-2.5 text-[#35698F] font-bold">1,000 pkts</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] text-[10px] font-bold rounded">
                      SURPLUS (+4k)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">AMBULANCES</td>
                  <td className="p-2.5 text-[#2E7D32] font-bold">8 units</td>
                  <td className="p-2.5 text-[#CA8A04] font-bold">2 units</td>
                  <td className="p-2.5 text-[#35698F] font-bold">2 units</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] text-[10px] font-bold rounded">
                      STABLE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* DISTRICT STATUS BOARD (1 Col) */}
        <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs flex flex-col font-mono text-xs">
          <div className="px-4 py-3 border-b border-[#D9E3EC] bg-[#F4F8FC]">
            <h2 className="text-xs font-bold text-[#243447] uppercase tracking-wide">
              District Operations Board
            </h2>
            <p className="text-[11px] text-[#64748B]">Hadoti Regional Emergency Status</p>
          </div>

          <div className="p-3 space-y-2 flex-1">
            <div className="border border-[#FFCDD2] bg-[#FFEBEE]/50 rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#243447] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C62828]" /> KOTA SECTOR
                </span>
                <span className="px-1.5 py-0.5 bg-[#C62828] text-white text-[9px] font-bold rounded">CRITICAL</span>
              </div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                Water Deficit: <strong className="text-[#C62828]">-4,500 L</strong> | Open Needs: <strong>8</strong>
              </div>
            </div>

            <div className="border border-[#FFE082] bg-[#FFF8E1]/50 rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#243447] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" /> BUNDI SECTOR
                </span>
                <span className="px-1.5 py-0.5 bg-[#D97706] text-white text-[9px] font-bold rounded">HIGH ALERT</span>
              </div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                Food Balance: <strong className="text-[#2E7D32]">+4,000 PKT</strong> | Open Needs: <strong>4</strong>
              </div>
            </div>

            <div className="border border-[#FFE082] bg-[#FFF8E1]/50 rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#243447] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" /> BARAN SECTOR
                </span>
                <span className="px-1.5 py-0.5 bg-[#D97706] text-white text-[9px] font-bold rounded">HIGH ALERT</span>
              </div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                Ambulance Deficit: <strong className="text-[#C62828]">-4 Units</strong> | Open Needs: <strong>3</strong>
              </div>
            </div>

            <div className="border border-[#A5D6A7] bg-[#E8F5E9]/50 rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-[#243447] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" /> JHALAWAR SECTOR
                </span>
                <span className="px-1.5 py-0.5 bg-[#2E7D32] text-white text-[9px] font-bold rounded">STABLE</span>
              </div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                Generator Surplus: <strong className="text-[#2E7D32]">+4 Units</strong> | Open Needs: <strong>1</strong>
              </div>
            </div>
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
    </MainLayout>
  );
}
