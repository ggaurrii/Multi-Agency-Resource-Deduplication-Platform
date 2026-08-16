import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  FileQuestion,
  AlertOctagon,
  Plus,
  Zap,
  CheckCircle2,
  Eye,
  X,
  ShieldAlert,
  Search,
  RotateCcw,
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

  const allItems = needs.length > 0 ? needs : mockNeeds;
  const criticalCount = allItems.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const highCount = allItems.filter((i) => i.priority === 'HIGH' && i.status !== 'RESOLVED').length;
  const openCount = allItems.filter((i) => i.status === 'OPEN').length;
  const partiallyMetCount = allItems.filter((i) => i.status === 'PARTIALLY_MET').length;
  const resolvedCount = allItems.filter((i) => i.status === 'RESOLVED').length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      default:
        return 'bg-[#DCECF8] text-[#1E425E] font-bold';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      case 'PARTIALLY_MET':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'RESOLVED':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B]';
    }
  };

  return (
    <MainLayout title="NEEDS & REQUISITIONS">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <FileQuestion className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Needs & Requisitions Control
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor, prioritize and resolve disaster resource requirements across affected districts
          </p>
        </div>
        <button className="px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-colors">
          <Plus className="w-4 h-4" />
          <span>File New Requisition</span>
        </button>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying prototype requisitions.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype View
          </span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Critical Requisitions</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{criticalCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Deadline ≤ 2 hours</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>High Priority</span>
            <AlertOctagon className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{highCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Deadline ≤ 6 hours</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#CA8A04] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Open Needs</span>
            <FileQuestion className="w-4 h-4 text-[#CA8A04]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#243447]">{openCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Awaiting Allocation</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Partially Met</span>
            <Zap className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">{partiallyMetCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Partial Match In Progress</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Resolved Needs</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">{resolvedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">100% Demand Met</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Need ID / District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Districts</option>
            <option value="Kota">Kota</option>
            <option value="Bundi">Bundi</option>
            <option value="Baran">Baran</option>
            <option value="Jhalawar">Jhalawar</option>
          </select>

          <select
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="BOAT">Rescue Boats</option>
            <option value="AMBULANCE">Ambulances</option>
            <option value="GENERATOR">Power Generators</option>
            <option value="FOOD_PACKET">Food Packets</option>
            <option value="DRINKING_WATER">Drinking Water</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL (≤ 2h)</option>
            <option value="HIGH">HIGH (≤ 6h)</option>
            <option value="MEDIUM">MEDIUM (≤ 24h)</option>
            <option value="LOW">LOW (&gt; 24h)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="PARTIALLY_MET">PARTIALLY_MET</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="EXPIRED">EXPIRED</option>
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
            Showing <strong className="text-[#243447]">{itemsToDisplay.length}</strong> requisitions
          </span>
        </div>
      </div>

      {/* NEEDS TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading requisitions...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No requisitions match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Need ID</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">Resource Requested</th>
                <th className="p-2.5">Required</th>
                <th className="p-2.5">Fulfilled</th>
                <th className="p-2.5">Remaining Deficit</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Deadline</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((item) => {
                const remaining = item.quantity_needed - item.quantity_fulfilled;
                return (
                  <tr key={item.id} className="hover:bg-[#F4F8FC]">
                    <td className="p-2.5 font-bold text-[#243447]">#{item.id.slice(0, 8)}</td>
                    <td className="p-2.5 font-bold text-[#243447]">{item.district_name || 'Kota'}</td>
                    <td className="p-2.5 font-semibold text-[#1E425E]">{item.resource_type}</td>
                    <td className="p-2.5 font-bold">{item.quantity_needed.toLocaleString()} {item.unit}</td>
                    <td className="p-2.5 text-[#2E7D32]">{item.quantity_fulfilled.toLocaleString()} {item.unit}</td>
                    <td className="p-2.5 font-bold text-[#C62828] text-sm">
                      {remaining.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-2.5 text-[#64748B]">
                      {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2.5 flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedNeed(item)}
                        className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        title="Inspect Details"
                      >
                        <Eye className="w-3 h-3 text-[#FFE082]" />
                        Inspect
                      </button>
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => navigate(`/matching?need=${item.id}`)}
                          className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-[#FFE082]" />
                          MATCH
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

      {/* INSPECTION SLIDE-OVER */}
      {selectedNeed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#F4F8FC] text-[#243447] flex items-center justify-between border-b border-[#D9E3EC]">
              <div className="flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-[#35698F]" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Requisition Inspection</h3>
              </div>
              <button onClick={() => setSelectedNeed(null)} className="p-1 text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Requisition ID</span>
                <p className="font-bold text-[#243447] text-sm">#{selectedNeed.id}</p>
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
                <h4 className="text-xs font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1">
                  Target Sector & Item
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                  <div>District: <strong className="text-[#243447]">{selectedNeed.district_name || 'Kota'}</strong></div>
                  <div>Item: <strong className="text-[#1E425E]">{selectedNeed.resource_type}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1">
                  Demand & Fulfillment Sub-Fields
                </h4>
                <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Total Quantity Required:</span>
                    <strong className="text-[#243447]">{selectedNeed.quantity_needed.toLocaleString()} {selectedNeed.unit}</strong>
                  </div>
                  <div className="flex justify-between text-[#2E7D32]">
                    <span>Fulfilled Quantity:</span>
                    <strong className="font-bold">{selectedNeed.quantity_fulfilled.toLocaleString()} {selectedNeed.unit}</strong>
                  </div>
                  <div className="flex justify-between text-[#C62828] text-sm border-t border-[#D9E3EC] pt-1">
                    <span className="font-bold">Remaining Deficit:</span>
                    <strong className="font-bold font-mono">
                      {(selectedNeed.quantity_needed - selectedNeed.quantity_fulfilled).toLocaleString()} {selectedNeed.unit}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-between items-center">
              <button
                onClick={() => setSelectedNeed(null)}
                className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
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
                  className="px-4 py-2 bg-[#35698F] hover:bg-[#255273] text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Zap className="w-4 h-4 text-[#FFE082]" />
                  <span>Launch Match Engine</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
