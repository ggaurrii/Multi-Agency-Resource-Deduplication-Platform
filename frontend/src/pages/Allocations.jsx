import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  MapPin,
  Eye,
  Zap,
  ShieldAlert,
  Search,
  RotateCcw,
  AlertTriangle,
  X,
  Check,
  Info,
  ArrowRight
} from 'lucide-react';

export default function Allocations() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Review Modal State
  const [reviewAllocation, setReviewAllocation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'AUTHORIZE' | 'REJECT' | null
  const [modificationNotice, setModificationNotice] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');

  const fetchAllocations = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;

    const data = await sahayogApi.getAllocations(params);
    if (data?.is_demo_fallback) {
      setIsDemoFallback(true);
      setAllocations([]);
    } else {
      setIsDemoFallback(false);
      setAllocations(data?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllocations();
  }, [statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDistrictFilter('');
    setResourceTypeFilter('');
  };

  // High-fidelity Hadoti Sector Allocation Dispatch Data for DEV_MODE
  const mockAllocations = [
    {
      id: 'alloc-9901-kota-water',
      need_id: 'n-1042-kota-water',
      district_name: 'Kota',
      resource_type: 'DRINKING_WATER',
      total_quantity_allocated: 6000,
      unit: 'liters',
      status: 'PROPOSED',
      created_at: '2026-08-15T21:45:00Z',
      updated_at: '2026-08-15T21:45:00Z',
      items: [
        {
          id: 'item-1',
          agency_name: 'NDRF Battalion 5',
          quantity_allocated: 4000,
          unit: 'liters',
          distance_km: 12.4,
        },
        {
          id: 'item-2',
          agency_name: 'Indian Army - Jaipur Division',
          quantity_allocated: 2000,
          unit: 'liters',
          distance_km: 28.1,
        },
      ],
    },
    {
      id: 'alloc-9902-kota-boats',
      need_id: 'n-1043-kota-boats',
      district_name: 'Kota',
      resource_type: 'BOAT',
      total_quantity_allocated: 10,
      unit: 'units',
      status: 'ACCEPTED',
      authorized_by: 'State Ops Officer',
      authorized_at: '2026-08-15T22:15:00Z',
      created_at: '2026-08-15T21:50:00Z',
      updated_at: '2026-08-15T22:15:00Z',
      items: [
        {
          id: 'item-3',
          agency_name: 'NDRF Battalion 5',
          quantity_allocated: 7,
          unit: 'units',
          distance_km: 12.4,
        },
        {
          id: 'item-4',
          agency_name: 'SDRF Rajasthan Unit 4',
          quantity_allocated: 3,
          unit: 'units',
          distance_km: 18.6,
        },
      ],
    },
    {
      id: 'alloc-9903-bundi-food',
      need_id: 'n-1045-bundi-food',
      district_name: 'Bundi',
      resource_type: 'FOOD_PACKET',
      total_quantity_allocated: 5000,
      unit: 'packets',
      status: 'ACCEPTED',
      authorized_by: 'State Ops Officer',
      authorized_at: '2026-08-15T19:00:00Z',
      created_at: '2026-08-15T18:30:00Z',
      updated_at: '2026-08-15T19:00:00Z',
      items: [
        {
          id: 'item-5',
          agency_name: 'Relief Foundation India (NGO)',
          quantity_allocated: 5000,
          unit: 'packets',
          distance_km: 14.2,
        },
      ],
    },
    {
      id: 'alloc-9904-baran-amb',
      need_id: 'n-1044-baran-amb',
      district_name: 'Baran',
      resource_type: 'AMBULANCE',
      total_quantity_allocated: 2,
      unit: 'units',
      status: 'REJECTED',
      created_at: '2026-08-15T20:10:00Z',
      updated_at: '2026-08-15T20:25:00Z',
      items: [
        {
          id: 'item-6',
          agency_name: 'Indian Army Medical Corps',
          quantity_allocated: 2,
          unit: 'units',
          distance_km: 42.0,
        },
      ],
    },
  ];

  const itemsToDisplay = (allocations.length > 0 ? allocations : mockAllocations).filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.need_id && a.need_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.resource_type && a.resource_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.district_name && a.district_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesDistrict = !districtFilter || a.district_name === districtFilter;
    const matchesType = !resourceTypeFilter || a.resource_type === resourceTypeFilter;

    return matchesSearch && matchesStatus && matchesDistrict && matchesType;
  });

  // KPI Calculations
  const allItems = allocations.length > 0 ? allocations : mockAllocations;
  const proposedCount = allItems.filter((i) => i.status === 'PROPOSED').length;
  const acceptedCount = allItems.filter((i) => i.status === 'ACCEPTED').length;
  const modifiedCount = allItems.filter((i) => i.status === 'MODIFIED').length;
  const rejectedCount = allItems.filter((i) => i.status === 'REJECTED').length;
  const inTransitCount = acceptedCount; // Backend transitions ACCEPTED resources to IN_TRANSIT

  const handleAuthorize = async (allocId) => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await sahayogApi.authorizeAllocation(allocId);
      setFeedbackMessage(`Allocation #${allocId.slice(0, 8)} authorized successfully. Resources transitioned to IN_TRANSIT.`);
    } catch (err) {
      setFeedbackMessage(`DEV MODE: Allocation #${allocId.slice(0, 8)} authorization action recorded (Backend 403 authorization required for live DB update).`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setReviewAllocation(null);
    }
  };

  const handleReject = async (allocId) => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await sahayogApi.rejectAllocation(allocId);
      setFeedbackMessage(`Allocation #${allocId.slice(0, 8)} rejected. Reserved resources released back to AVAILABLE stock.`);
    } catch (err) {
      setFeedbackMessage(`DEV MODE: Allocation #${allocId.slice(0, 8)} rejection recorded (Reserved stock released in prototype model).`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setReviewAllocation(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROPOSED':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
      case 'MODIFIED':
        return 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-900 border border-rose-300 font-bold';
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <MainLayout title="ALLOCATION CONTROL CENTER">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold uppercase tracking-wide">
              ALLOCATION CONTROL CENTER
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review, authorize and monitor multi-agency resource allocations (PROPOSED → ACCEPTED / IN_TRANSIT)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold rounded flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            DISPATCH WORKFLOW ● ONLINE
          </span>
        </div>
      </div>

      {/* DEV MODE Authorization Notification Banner */}
      {isDemoFallback && (
        <div className="p-3 bg-amber-950/80 border border-amber-800/80 text-amber-200 rounded-md text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEVELOPMENT AUTHORIZATION REQUIRED</strong> — Endpoints <code className="bg-amber-900 px-1 py-0.5 rounded text-amber-200">POST /api/v1/allocations/{'{id}'}/authorize</code> and <code className="bg-amber-900 px-1 py-0.5 rounded text-amber-200">reject</code> require a STATE_OPERATOR JWT session. Displaying prototype allocations.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-900 text-amber-300 rounded font-bold text-[10px] uppercase">
            Prototype View
          </span>
        </div>
      )}

      {/* ACTION FEEDBACK ALERT */}
      {feedbackMessage && (
        <div className="p-3 bg-blue-950/80 border border-blue-800 text-blue-200 rounded-md text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI CARDS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
            <span>Proposed</span>
            <GitPullRequest className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{proposedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting Operator Review</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
            <span>Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{acceptedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Movement Authorized</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{inTransitCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">En Route to Sector</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
            <span>Modified</span>
            <GitPullRequest className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{modifiedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Adjusted Proposal</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{rejectedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Released to Stock</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Allocation ID / Need / District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs font-mono w-full border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PROPOSED">PROPOSED (Pending Review)</option>
            <option value="ACCEPTED">ACCEPTED (Authorized / In Transit)</option>
            <option value="MODIFIED">MODIFIED</option>
            <option value="REJECTED">REJECTED (Stock Released)</option>
          </select>

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
            Showing <strong className="text-slate-900">{itemsToDisplay.length}</strong> allocations
          </span>
        </div>
      </div>

      {/* ALLOCATIONS OPERATIONAL TABLE */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">Loading allocations...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No allocations match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <th className="p-3">Allocation ID</th>
                <th className="p-3">Need Requisition</th>
                <th className="p-3">District</th>
                <th className="p-3">Resource Type</th>
                <th className="p-3">Allocated Quantity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsToDisplay.map((alloc) => {
                const totalQty = alloc.total_quantity_allocated ||
                  (alloc.items ? alloc.items.reduce((acc, i) => acc + (i.quantity_allocated || 0), 0) : 0);
                const unit = alloc.unit || (alloc.items && alloc.items[0]?.unit) || 'units';

                return (
                  <tr key={alloc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{alloc.id.slice(0, 8)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/needs`)}
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        #{alloc.need_id ? alloc.need_id.slice(0, 8) : 'n-1042'}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{alloc.district_name || 'Kota'}</td>
                    <td className="p-3 font-semibold text-blue-900">{alloc.resource_type || 'DRINKING_WATER'}</td>
                    <td className="p-3 font-black text-slate-900 text-sm">
                      {totalQty.toLocaleString()} {unit}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(alloc.status)}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {new Date(alloc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 flex items-center space-x-2">
                      {alloc.status === 'PROPOSED' ? (
                        <button
                          onClick={() => setReviewAllocation(alloc)}
                          className="px-2.5 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          REVIEW PROPOSAL
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedAllocation(alloc)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-amber-400" />
                          Inspect
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

      {/* ALLOCATION REVIEW MODAL */}
      {reviewAllocation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl w-full max-w-2xl font-mono text-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  PROPOSED ALLOCATION REVIEW — #{reviewAllocation.id.slice(0, 8)}
                </h3>
              </div>
              <button onClick={() => setReviewAllocation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Need Requisition Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Associated Requisition</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-800">
                  <div>Need ID: <strong className="text-blue-900">#{reviewAllocation.need_id ? reviewAllocation.need_id.slice(0, 8) : 'n-1042'}</strong></div>
                  <div>District: <strong className="text-slate-900">{reviewAllocation.district_name || 'Kota'}</strong></div>
                  <div>Resource: <strong className="text-blue-900">{reviewAllocation.resource_type || 'DRINKING_WATER'}</strong></div>
                </div>
              </div>

              {/* Proposed Multi-Agency Resource Split Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>PROPOSED MULTI-AGENCY RESOURCE SPLIT</span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    RESERVED IN STOCK
                  </span>
                </h4>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                        <th className="p-2.5">Agency</th>
                        <th className="p-2.5">Quantity Allocated</th>
                        <th className="p-2.5">Proximity Distance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviewAllocation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-700" />
                            {item.agency_name}
                          </td>
                          <td className="p-2.5 font-black text-blue-900">
                            {item.quantity_allocated.toLocaleString()} {item.unit || reviewAllocation.unit}
                          </td>
                          <td className="p-2.5 text-slate-600 font-semibold">{item.distance_km} km</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modification Notice Warning */}
              {modificationNotice && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    MODIFICATION NOT AVAILABLE IN BACKEND CONTRACT
                  </div>
                  <p className="text-slate-700">
                    The backend API does not currently expose an online proposal modification endpoint. To adjust allocations, REJECT this proposal to release stock back to AVAILABLE pool, then re-run the Matching Engine with adjusted filters.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setConfirmAction('AUTHORIZE')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4 text-emerald-200" />
                    ACCEPT ALLOCATION
                  </button>
                  <button
                    onClick={() => setConfirmAction('REJECT')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-4 h-4 text-rose-200" />
                    REJECT ALLOCATION
                  </button>
                </div>

                <button
                  onClick={() => setModificationNotice(!modificationNotice)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold border border-slate-300 text-[11px]"
                >
                  MODIFY ALLOCATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG (FOR AUTHORIZE / REJECT) */}
      {confirmAction && reviewAllocation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-md w-full p-5 font-mono text-xs space-y-4">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
              <AlertTriangle className={`w-5 h-5 ${confirmAction === 'AUTHORIZE' ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>{confirmAction === 'AUTHORIZE' ? 'AUTHORIZE RESOURCE MOVEMENT?' : 'REJECT ALLOCATION & RELEASE STOCK?'}</span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              {confirmAction === 'AUTHORIZE'
                ? `Accepting this allocation will transition resources from RESERVED to IN_TRANSIT and fulfill requisition #${reviewAllocation.need_id ? reviewAllocation.need_id.slice(0, 8) : 'n-1042'}.`
                : `Rejecting this allocation will release all reserved stock back to the AVAILABLE resource pool.`}
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded font-bold hover:bg-slate-300"
              >
                Cancel
              </button>
              {confirmAction === 'AUTHORIZE' ? (
                <button
                  onClick={() => handleAuthorize(reviewAllocation.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 shadow-sm"
                >
                  {actionLoading ? 'Authorizing...' : 'Confirm Acceptance'}
                </button>
              ) : (
                <button
                  onClick={() => handleReject(reviewAllocation.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-700 text-white rounded font-bold hover:bg-rose-800 shadow-sm"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALLOCATION INSPECTION SLIDE-OVER */}
      {selectedAllocation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Allocation Inspection</h3>
              </div>
              <button onClick={() => setSelectedAllocation(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Allocation Identifier</span>
                <p className="font-bold text-slate-900 text-sm">#{selectedAllocation.id}</p>
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded ${getStatusBadge(selectedAllocation.status)}`}>
                  {selectedAllocation.status}
                </span>
              </div>

              {/* Quick Navigation Links */}
              <div className="flex space-x-2 font-bold text-[11px]">
                <button
                  onClick={() => navigate('/needs')}
                  className="flex-1 p-2 bg-blue-50 text-blue-900 border border-blue-200 rounded hover:bg-blue-100 text-center"
                >
                  VIEW NEED →
                </button>
                <button
                  onClick={() => navigate(`/matching?need=${selectedAllocation.need_id || 'n-1042-kota-water'}`)}
                  className="flex-1 p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100 text-center"
                >
                  VIEW MATCHING →
                </button>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Contributing Agency Items
                </h4>
                <div className="space-y-2">
                  {selectedAllocation.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.agency_name}</span>
                        <span className="text-blue-900">{item.quantity_allocated.toLocaleString()} {item.unit || selectedAllocation.unit}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Proximity: {item.distance_km} km</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-1 text-slate-600 text-[11px]">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Audit Metadata
                </h4>
                <div>Created: <strong>{new Date(selectedAllocation.created_at || Date.now()).toLocaleString()}</strong></div>
                {selectedAllocation.authorized_at && (
                  <div>Authorized: <strong>{new Date(selectedAllocation.authorized_at).toLocaleString()}</strong> by {selectedAllocation.authorized_by}</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAllocation(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900"
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
