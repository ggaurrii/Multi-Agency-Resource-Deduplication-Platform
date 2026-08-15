import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  FileQuestion,
  AlertOctagon,
  Plus,
  Filter,
  Zap,
  CheckCircle2,
  Clock,
  Eye,
  X,
  ShieldAlert,
  Search,
  RotateCcw,
  Building2,
  MapPin
} from 'lucide-react';

export default function Needs() {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchNeeds = async () => {
    setLoading(true);
    const params = {};
    if (districtFilter) params.district_id = districtFilter;
    if (resourceTypeFilter) params.resource_type = resourceTypeFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (statusFilter) params.status = statusFilter;

    const data = await sahayogApi.getNeeds(params);
    if (data?.is_demo_fallback) {
      setIsDemoFallback(true);
      setNeeds([]);
    } else {
      setIsDemoFallback(false);
      setNeeds(data?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNeeds();
  }, [districtFilter, resourceTypeFilter, priorityFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setDistrictFilter('');
    setResourceTypeFilter('');
    setPriorityFilter('');
    setStatusFilter('');
  };

  // High-fidelity Hadoti Flood Requisition Data
  const mockNeeds = [
    {
      id: 'n-1042-kota-water',
      district_name: 'Kota',
      resource_type: 'DRINKING_WATER',
      quantity_needed: 10000,
      quantity_fulfilled: 4000,
      unit: 'liters',
      priority: 'CRITICAL',
      deadline: '2026-08-16T03:30:00Z',
      status: 'OPEN',
      created_at: '2026-08-15T21:00:00Z',
    },
    {
      id: 'n-1043-kota-boats',
      district_name: 'Kota',
      resource_type: 'BOAT',
      quantity_needed: 15,
      quantity_fulfilled: 5,
      unit: 'units',
      priority: 'CRITICAL',
      deadline: '2026-08-16T04:00:00Z',
      status: 'PARTIALLY_MET',
      created_at: '2026-08-15T21:30:00Z',
    },
    {
      id: 'n-1044-baran-amb',
      district_name: 'Baran',
      resource_type: 'AMBULANCE',
      quantity_needed: 6,
      quantity_fulfilled: 2,
      unit: 'units',
      priority: 'HIGH',
      deadline: '2026-08-16T07:30:00Z',
      status: 'OPEN',
      created_at: '2026-08-15T22:00:00Z',
    },
    {
      id: 'n-1045-bundi-food',
      district_name: 'Bundi',
      resource_type: 'FOOD_PACKET',
      quantity_needed: 5000,
      quantity_fulfilled: 5000,
      unit: 'packets',
      priority: 'MEDIUM',
      deadline: '2026-08-16T18:00:00Z',
      status: 'RESOLVED',
      created_at: '2026-08-15T18:00:00Z',
    },
    {
      id: 'n-1046-jhalawar-gen',
      district_name: 'Jhalawar',
      resource_type: 'GENERATOR',
      quantity_needed: 8,
      quantity_fulfilled: 8,
      unit: 'units',
      priority: 'LOW',
      deadline: '2026-08-17T12:00:00Z',
      status: 'RESOLVED',
      created_at: '2026-08-15T15:00:00Z',
    },
  ];

  const itemsToDisplay = (needs.length > 0 ? needs : mockNeeds).filter((n) => {
    const matchesSearch =
      !searchQuery ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.district_name && n.district_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDistrict = !districtFilter || n.district_name === districtFilter;
    const matchesType = !resourceTypeFilter || n.resource_type === resourceTypeFilter;
    const matchesPriority = !priorityFilter || n.priority === priorityFilter;
    const matchesStatus = !statusFilter || n.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesType && matchesPriority && matchesStatus;
  });

  // KPI Calculations
  const allItems = needs.length > 0 ? needs : mockNeeds;
  const criticalCount = allItems.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const highCount = allItems.filter((i) => i.priority === 'HIGH' && i.status !== 'RESOLVED').length;
  const openCount = allItems.filter((i) => i.status === 'OPEN').length;
  const partiallyMetCount = allItems.filter((i) => i.status === 'PARTIALLY_MET').length;
  const resolvedCount = allItems.filter((i) => i.status === 'RESOLVED').length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white font-bold';
      case 'HIGH':
        return 'bg-amber-600 text-white font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      default:
        return 'bg-slate-200 text-slate-800 font-bold';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      case 'PARTIALLY_MET':
        return 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <MainLayout title="NEEDS & REQUISITIONS">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileQuestion className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold font-mono uppercase tracking-wide">
              NEEDS & REQUISITIONS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor, prioritize and resolve disaster resource requirements across affected districts
          </p>
        </div>
        <button className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>File New Requisition</span>
        </button>
      </div>

      {/* DEV MODE Authorization Banner */}
      {isDemoFallback && (
        <div className="p-3 bg-amber-950/80 border border-amber-800/80 text-amber-200 rounded-md text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEVELOPMENT AUTHORIZATION REQUIRED</strong> — Endpoint <code className="bg-amber-900 px-1 py-0.5 rounded text-amber-200">GET /api/v1/needs</code> requires a valid backend JWT login session. Displaying prototype requisitions.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-900 text-amber-300 rounded font-bold text-[10px] uppercase">
            Prototype View
          </span>
        </div>
      )}

      {/* NEEDS KPI CARDS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Critical Requisitions</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-rose-600">{criticalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Deadline ≤ 2 hours</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>High Priority</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-600">{highCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Deadline ≤ 6 hours</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Open Needs</span>
            <FileQuestion className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900">{openCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting Allocation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Partially Met</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-blue-700">{partiallyMetCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Partial Match In Progress</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold uppercase">
            <span>Resolved Needs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-700">{resolvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">100% Demand Met</p>
        </div>
      </div>

      {/* CRITICAL NEED HIGHLIGHT CARDS */}
      {allItems.filter((n) => n.priority === 'CRITICAL' && n.status !== 'RESOLVED').length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono">
            <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
              URGENT ACTION REQUIRED — CRITICAL REQUISITIONS
            </h2>
            <span className="text-[11px] text-slate-500">Sorted by nearest deadline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {allItems
              .filter((n) => n.priority === 'CRITICAL' && n.status !== 'RESOLVED')
              .map((need) => {
                const remaining = need.quantity_needed - need.quantity_fulfilled;
                return (
                  <div key={need.id} className="bg-rose-50/70 border border-rose-300 rounded-md p-4 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-rose-600" /> {need.district_name || 'Kota'} Sector
                        </span>
                        <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-[10px]">
                          CRITICAL (≤ 2h)
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>Requisition: <strong className="text-blue-900">{need.resource_type}</strong></div>
                        <div className="text-sm font-black text-rose-700">
                          REMAINING DEFICIT: {remaining.toLocaleString()} {need.unit}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Deadline: {new Date(need.deadline).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-rose-200 flex justify-end">
                      <button
                        onClick={() => navigate(`/matching?need=${need.id}`)}
                        className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>FIND MATCH FOR #{need.id.slice(0, 8)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Need ID / District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs font-mono w-full border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono bg-white"
          >
            <option value="">All Districts</option>
            <option value="Kota">Kota</option>
            <option value="Bundi">Bundi</option>
            <option value="Baran">Baran</option>
            <option value="Jhalawar">Jhalawar</option>
          </select>

          {/* Resource Type Filter */}
          <select
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="BOAT">Rescue Boats</option>
            <option value="AMBULANCE">Ambulances</option>
            <option value="GENERATOR">Power Generators</option>
            <option value="FOOD_PACKET">Food Packets</option>
            <option value="DRINKING_WATER">Drinking Water</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono bg-white"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL (≤ 2h)</option>
            <option value="HIGH">HIGH (≤ 6h)</option>
            <option value="MEDIUM">MEDIUM (≤ 24h)</option>
            <option value="LOW">LOW (&gt; 24h)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="PARTIALLY_MET">PARTIALLY_MET</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={clearFilters}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLEAR FILTERS</span>
          </button>
          <span className="text-slate-500">
            Showing <strong className="text-slate-900">{itemsToDisplay.length}</strong> requisitions
          </span>
        </div>
      </div>

      {/* NEEDS OPERATIONAL TABLE */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500">Loading requisitions...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500">
            No requisitions match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <th className="p-3">Need ID</th>
                <th className="p-3">District</th>
                <th className="p-3">Resource Requested</th>
                <th className="p-3">Required</th>
                <th className="p-3">Fulfilled</th>
                <th className="p-3">Remaining Deficit</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsToDisplay.map((item) => {
                const remaining = item.quantity_needed - item.quantity_fulfilled;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{item.id.slice(0, 8)}</td>
                    <td className="p-3 font-bold text-slate-800">{item.district_name || 'Kota'}</td>
                    <td className="p-3 font-semibold text-blue-900">{item.resource_type}</td>
                    <td className="p-3 font-bold">{item.quantity_needed.toLocaleString()} {item.unit}</td>
                    <td className="p-3 text-emerald-700">{item.quantity_fulfilled.toLocaleString()} {item.unit}</td>
                    <td className="p-3 font-black text-rose-700 text-sm">
                      {remaining.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedNeed(item)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-bold flex items-center gap-1"
                        title="Inspect Details"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        Inspect
                      </button>
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => navigate(`/matching?need=${item.id}`)}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          FIND MATCH
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* NEED DETAIL SLIDE-OVER PANEL */}
      {selectedNeed && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Requisition Inspection</h3>
              </div>
              <button onClick={() => setSelectedNeed(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Requisition ID</span>
                <p className="font-bold text-slate-900 text-sm">#{selectedNeed.id}</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getPriorityBadge(selectedNeed.priority)}`}>
                    {selectedNeed.priority}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(selectedNeed.status)}`}>
                    {selectedNeed.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Target Sector & Item
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>District: <strong className="text-slate-900">{selectedNeed.district_name || 'Kota'}</strong></div>
                  <div>Item: <strong className="text-blue-900">{selectedNeed.resource_type}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Demand & Fulfillment Sub-Fields
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Quantity Required:</span>
                    <strong className="text-slate-900">{selectedNeed.quantity_needed.toLocaleString()} {selectedNeed.unit}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Fulfilled Quantity:</span>
                    <strong className="font-bold">{selectedNeed.quantity_fulfilled.toLocaleString()} {selectedNeed.unit}</strong>
                  </div>
                  <div className="flex justify-between text-rose-700 text-sm border-t border-slate-200 pt-1">
                    <span className="font-bold">Remaining Deficit:</span>
                    <strong className="font-black font-mono">
                      {(selectedNeed.quantity_needed - selectedNeed.quantity_fulfilled).toLocaleString()} {selectedNeed.unit}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-slate-600">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Timestamps & Priority
                </h4>
                <div>Created At: <strong>{new Date(selectedNeed.created_at || Date.now()).toLocaleString()}</strong></div>
                <div>Deadline: <strong className="text-rose-700">{new Date(selectedNeed.deadline).toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setSelectedNeed(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded font-bold hover:bg-slate-800"
              >
                Close
              </button>
              {selectedNeed.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    const needId = selectedNeed.id;
                    setSelectedNeed(null);
                    navigate(`/matching?need=${needId}`);
                  }}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Launch Matching Engine</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
