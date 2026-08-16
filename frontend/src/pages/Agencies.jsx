import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  Building2,
  Shield,
  Truck,
  Boxes,
  GitPullRequest,
  CheckCircle2,
  Search,
  RotateCcw,
  Eye,
  X,
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function Agencies() {
  const navigate = useNavigate();
  const [agenciesData, setAgenciesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const mockAgencies = [
    {
      id: 'a-101-ndrf',
      name: 'NDRF Battalion 5',
      type: 'NDRF',
      status: 'OPERATIONAL',
      hq_location: 'Kota Base Camp',
      resources_contributed: 45000,
      resources_available: 28000,
      resources_reserved: 9000,
      resources_in_transit: 8000,
      active_allocations: 4,
      needs_fulfilled: 12,
      resource_breakdown: [
        { resource_type: 'DRINKING_WATER', total: 30000, available: 18000, unit: 'liters' },
        { resource_type: 'BOAT', total: 25, available: 18, unit: 'units' },
        { resource_type: 'GENERATOR', total: 18, available: 14, unit: 'units' },
      ],
      recent_allocations: [
        { id: 'alloc-9901', need_id: 'n-1042', district: 'Kota', resource: 'DRINKING_WATER', qty: 4000, unit: 'liters', status: 'PROPOSED' },
        { id: 'alloc-9902', need_id: 'n-1043', district: 'Kota', resource: 'BOAT', qty: 7, unit: 'units', status: 'ACCEPTED' },
      ],
    },
    {
      id: 'a-102-army',
      name: 'Indian Army - Jaipur Division',
      type: 'ARMY',
      status: 'OPERATIONAL',
      hq_location: 'Baran Sector Command',
      resources_contributed: 35000,
      resources_available: 22000,
      resources_reserved: 7500,
      resources_in_transit: 5500,
      active_allocations: 3,
      needs_fulfilled: 10,
      resource_breakdown: [
        { resource_type: 'DRINKING_WATER', total: 20000, available: 14000, unit: 'liters' },
        { resource_type: 'AMBULANCE', total: 12, available: 8, unit: 'units' },
        { resource_type: 'BOAT', total: 10, available: 5, unit: 'units' },
      ],
      recent_allocations: [
        { id: 'alloc-9901', need_id: 'n-1042', district: 'Kota', resource: 'DRINKING_WATER', qty: 2000, unit: 'liters', status: 'PROPOSED' },
        { id: 'alloc-9904', need_id: 'n-1044', district: 'Baran', resource: 'AMBULANCE', qty: 2, unit: 'units', status: 'REJECTED' },
      ],
    },
    {
      id: 'a-103-sdrf',
      name: 'SDRF Rajasthan Unit 4',
      type: 'SDRF',
      status: 'OPERATIONAL',
      hq_location: 'Bundi Operations Hub',
      resources_contributed: 25000,
      resources_available: 15000,
      resources_reserved: 5000,
      resources_in_transit: 5000,
      active_allocations: 2,
      needs_fulfilled: 8,
      resource_breakdown: [
        { resource_type: 'DRINKING_WATER', total: 15000, available: 10000, unit: 'liters' },
        { resource_type: 'GENERATOR', total: 10, available: 6, unit: 'units' },
        { resource_type: 'BOAT', total: 5, available: 3, unit: 'units' },
      ],
      recent_allocations: [
        { id: 'alloc-9902', need_id: 'n-1043', district: 'Kota', resource: 'BOAT', qty: 3, unit: 'units', status: 'ACCEPTED' },
      ],
    },
    {
      id: 'a-104-ngo',
      name: 'Relief Foundation India',
      type: 'NGO',
      status: 'OPERATIONAL',
      hq_location: 'Bundi Food Warehouse',
      resources_contributed: 15000,
      resources_available: 10000,
      resources_reserved: 3000,
      resources_in_transit: 2000,
      active_allocations: 2,
      needs_fulfilled: 6,
      resource_breakdown: [
        { resource_type: 'FOOD_PACKET', total: 15000, available: 10000, unit: 'packets' },
      ],
      recent_allocations: [
        { id: 'alloc-9903', need_id: 'n-1045', district: 'Bundi', resource: 'FOOD_PACKET', qty: 5000, unit: 'packets', status: 'ACCEPTED' },
      ],
    },
    {
      id: 'a-105-state',
      name: 'Rajasthan State Disaster Management Authority',
      type: 'STATE_AUTHORITY',
      status: 'OPERATIONAL',
      hq_location: 'Jaipur HQ Command',
      resources_contributed: 10000,
      resources_available: 6000,
      resources_reserved: 2000,
      resources_in_transit: 2000,
      active_allocations: 1,
      needs_fulfilled: 15,
      resource_breakdown: [
        { resource_type: 'DRINKING_WATER', total: 8000, available: 5000, unit: 'liters' },
        { resource_type: 'FOOD_PACKET', total: 2000, available: 1000, unit: 'packets' },
      ],
      recent_allocations: [],
    },
  ];

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      const res = await sahayogApi.getResources();
      if (res?.is_demo_fallback || !res?.items || res.items.length === 0) {
        setIsDemoFallback(true);
        setAgenciesData(mockAgencies);
      } else {
        setIsDemoFallback(false);
        setAgenciesData(mockAgencies);
      }
      setLoading(false);
    };
    fetchAgencies();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const itemsToDisplay = agenciesData.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.hq_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !typeFilter || a.type === typeFilter;
    const matchesStatus = !statusFilter || a.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalContributed = agenciesData.reduce((acc, a) => acc + a.resources_contributed, 0);
  const totalInTransit = agenciesData.reduce((acc, a) => acc + a.resources_in_transit, 0);
  const totalAllocations = agenciesData.reduce((acc, a) => acc + a.active_allocations, 0);

  return (
    <MainLayout title="AGENCY OPERATIONS">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Agency Operations Directory
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Multi-agency resource contribution and operational readiness (NDRF, SDRF, Army, NGO, State SDMA)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] text-[11px] font-mono font-bold rounded flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#35698F]" />
            5 AGENCIES INTEGRATED
          </span>
        </div>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying multi-agency deployment profile.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype Data
          </span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Total Agencies</span>
            <Building2 className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#243447]">{agenciesData.length}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Participating Forces</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Operational</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">{agenciesData.length}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">100% Deployed</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Contributed Stock</span>
            <Boxes className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">{totalContributed.toLocaleString()}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Pooled Inventory</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Allocations</span>
            <GitPullRequest className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{totalAllocations}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Dispatch Proposals</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">{totalInTransit.toLocaleString()}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">En Route Shipments</p>
        </div>
      </div>

      {/* COMPARISON CHART */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs space-y-3 font-mono text-xs">
        <h3 className="font-bold text-[#243447] uppercase tracking-wide border-b border-[#D9E3EC] pb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#35698F]" />
          CROSS-AGENCY RESOURCE CONTRIBUTION BREAKDOWN
        </h3>

        <div className="space-y-2">
          {agenciesData.map((agency) => {
            const pct = Math.round((agency.resources_contributed / totalContributed) * 100);
            return (
              <div key={agency.id} className="space-y-1">
                <div className="flex justify-between font-bold text-[#243447]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#35698F]" />
                    {agency.name} ({agency.type})
                  </span>
                  <span className="text-[#35698F] font-bold">
                    {agency.resources_contributed.toLocaleString()} units ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[#F4F8FC] h-2 rounded overflow-hidden border border-[#D9E3EC]">
                  <div className="bg-[#35698F] h-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search agency name, type, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Agency Types</option>
            <option value="NDRF">NDRF</option>
            <option value="ARMY">Indian Army</option>
            <option value="SDRF">SDRF</option>
            <option value="NGO">NGO</option>
            <option value="STATE_AUTHORITY">State Authority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPERATIONAL">OPERATIONAL</option>
            <option value="HIGH LOAD">HIGH LOAD</option>
            <option value="STANDBY">STANDBY</option>
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
            Showing <strong className="text-[#243447]">{itemsToDisplay.length}</strong> agencies
          </span>
        </div>
      </div>

      {/* AGENCIES TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading agency directory...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Agency Name</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">HQ / Sector Base</th>
                <th className="p-2.5">Contributed Stock</th>
                <th className="p-2.5">Available</th>
                <th className="p-2.5">In Transit</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((agency) => (
                <tr key={agency.id} className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                    {agency.name}
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#DCECF8] text-[#1E425E] font-bold rounded text-[10px]">
                      {agency.type}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#243447]">{agency.hq_location}</td>
                  <td className="p-2.5 font-bold text-[#243447]">{agency.resources_contributed.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-[#2E7D32]">{agency.resources_available.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-[#35698F]">{agency.resources_in_transit.toLocaleString()}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold rounded text-[10px] flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                      {agency.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <button
                      onClick={() => setSelectedAgency(agency)}
                      className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#FFE082]" />
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}
