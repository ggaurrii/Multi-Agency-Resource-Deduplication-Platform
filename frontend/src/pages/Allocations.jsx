import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canAuthorizeAllocation, canRejectAllocation } from '../utils/permissions';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  Eye,
  Zap,
  ShieldAlert,
  Search,
  RotateCcw,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';

export default function Allocations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAuthorize = canAuthorizeAllocation(user);
  const canReject = canRejectAllocation(user);
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

  const allItems = allocations.length > 0 ? allocations : mockAllocations;
  const proposedCount = allItems.filter((i) => i.status === 'PROPOSED').length;
  const acceptedCount = allItems.filter((i) => i.status === 'ACCEPTED').length;
  const modifiedCount = allItems.filter((i) => i.status === 'MODIFIED').length;
  const rejectedCount = allItems.filter((i) => i.status === 'REJECTED').length;
  const inTransitCount = acceptedCount;

  const handleAuthorize = async (allocId) => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await sahayogApi.authorizeAllocation(allocId);
      setFeedbackMessage(`Allocation #${allocId.slice(0, 8)} authorized successfully. Resources transitioned to IN_TRANSIT.`);
      fetchAllocations();
    } catch (err) {
      if (err.response?.status === 403) {
        setFeedbackMessage('You are not authorized to perform this action.');
      } else {
        setFeedbackMessage(`Error: ${err.response?.data?.detail?.error?.message || err.message || 'Authorization failed'}`);
      }
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
      fetchAllocations();
    } catch (err) {
      if (err.response?.status === 403) {
        setFeedbackMessage('You are not authorized to perform this action.');
      } else {
        setFeedbackMessage(`Error: ${err.response?.data?.detail?.error?.message || err.message || 'Rejection failed'}`);
      }
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setReviewAllocation(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROPOSED':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      case 'ACCEPTED':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      case 'MODIFIED':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'REJECTED':
        return 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B]';
    }
  };

  return (
    <MainLayout title="ALLOCATION CONTROL CENTER">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Allocation Control Center
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Review, authorize and monitor multi-agency resource allocations (PROPOSED → ACCEPTED / IN_TRANSIT)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] text-[11px] font-mono font-bold rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
            DISPATCH WORKFLOW ACTIVE
          </span>
        </div>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying prototype allocations.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype View
          </span>
        </div>
      )}

      {feedbackMessage && (
        <div className="p-3 bg-[#DCECF8] border border-[#8DB9D9] text-[#1E425E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#64748B] hover:text-[#243447]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Proposed</span>
            <GitPullRequest className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{proposedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Awaiting Operator Review</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">{acceptedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Movement Authorized</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>In Transit</span>
            <Truck className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#1E425E]">{inTransitCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">En Route to Sector</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Modified</span>
            <GitPullRequest className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">{modifiedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Adjusted Proposal</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{rejectedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Released to Stock</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Allocation ID / Need / District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PROPOSED">PROPOSED (Pending Review)</option>
            <option value="ACCEPTED">ACCEPTED (Authorized / In Transit)</option>
            <option value="MODIFIED">MODIFIED</option>
            <option value="REJECTED">REJECTED (Stock Released)</option>
          </select>

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
            Showing <strong className="text-[#243447]">{itemsToDisplay.length}</strong> allocations
          </span>
        </div>
      </div>

      {/* ALLOCATIONS TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading allocations...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No allocations match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Allocation ID</th>
                <th className="p-2.5">Need Requisition</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">Resource Type</th>
                <th className="p-2.5">Allocated Quantity</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Created At</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((alloc) => {
                const totalQty = alloc.total_quantity_allocated ||
                  (alloc.items ? alloc.items.reduce((acc, i) => acc + (i.quantity_allocated || 0), 0) : 0);
                const unit = alloc.unit || (alloc.items && alloc.items[0]?.unit) || 'units';

                return (
                  <tr key={alloc.id} className="hover:bg-[#F4F8FC]">
                    <td className="p-2.5 font-bold text-[#243447]">#{alloc.id.slice(0, 8)}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => navigate(`/needs`)}
                        className="text-[#35698F] hover:underline font-semibold"
                      >
                        #{alloc.need_id ? alloc.need_id.slice(0, 8) : 'n-1042'}
                      </button>
                    </td>
                    <td className="p-2.5 font-bold text-[#243447]">{alloc.district_name || 'Kota'}</td>
                    <td className="p-2.5 font-semibold text-[#1E425E]">{alloc.resource_type || 'DRINKING_WATER'}</td>
                    <td className="p-2.5 font-bold text-[#243447] text-sm">
                      {totalQty.toLocaleString()} {unit}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(alloc.status)}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-[#64748B]">
                      {new Date(alloc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2.5 flex items-center space-x-1.5">
                      {alloc.status === 'PROPOSED' && canAuthorize ? (
                        <button
                          onClick={() => setReviewAllocation(alloc)}
                          className="px-2.5 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Zap className="w-3 h-3 text-[#FFE082]" />
                          REVIEW PROPOSAL
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedAllocation(alloc)}
                          className="px-2.5 py-1 bg-[#64748B] hover:bg-[#475569] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-[#FFE082]" />
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E3EC] rounded shadow-2xl w-full max-w-2xl font-mono text-xs overflow-hidden">
            <div className="p-4 bg-[#F4F8FC] text-[#243447] flex items-center justify-between border-b border-[#D9E3EC]">
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-5 h-5 text-[#35698F]" />
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  PROPOSED ALLOCATION REVIEW — #{reviewAllocation.id.slice(0, 8)}
                </h3>
              </div>
              <button onClick={() => setReviewAllocation(null)} className="text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-2">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Associated Requisition</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[#243447]">
                  <div>Need ID: <strong className="text-[#1E425E]">#{reviewAllocation.need_id ? reviewAllocation.need_id.slice(0, 8) : 'n-1042'}</strong></div>
                  <div>District: <strong>{reviewAllocation.district_name || 'Kota'}</strong></div>
                  <div>Resource: <strong className="text-[#1E425E]">{reviewAllocation.resource_type || 'DRINKING_WATER'}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1 flex items-center justify-between">
                  <span>PROPOSED MULTI-AGENCY RESOURCE SPLIT</span>
                  <span className="text-[10px] text-[#D97706] font-bold bg-[#FFF8E1] px-2 py-0.5 rounded border border-[#FFE082]">
                    RESERVED IN STOCK
                  </span>
                </h4>

                <div className="border border-[#D9E3EC] rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F4F8FC] text-[#64748B] uppercase text-[10px]">
                        <th className="p-2.5">Agency</th>
                        <th className="p-2.5">Quantity Allocated</th>
                        <th className="p-2.5">Proximity Distance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E3EC]">
                      {reviewAllocation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F4F8FC]">
                          <td className="p-2.5 font-bold text-[#243447] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#35698F]" />
                            {item.agency_name}
                          </td>
                          <td className="p-2.5 font-bold text-[#1E425E]">
                            {item.quantity_allocated.toLocaleString()} {item.unit || reviewAllocation.unit}
                          </td>
                          <td className="p-2.5 text-[#64748B] font-semibold">{item.distance_km} km</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {confirmAction && (
                <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs space-y-2">
                  <p className="font-bold">
                    Confirm Action: {confirmAction === 'AUTHORIZE' ? 'ACCEPT & DISPATCH ALLOCATION' : 'REJECT & RELEASE STOCK'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {confirmAction === 'AUTHORIZE'
                      ? 'This will transition status to ACCEPTED and mark stock IN_TRANSIT.'
                      : 'This will transition status to REJECTED and return reserved stock to AVAILABLE.'}
                  </p>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => confirmAction === 'AUTHORIZE' ? handleAuthorize(reviewAllocation.id) : handleReject(reviewAllocation.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-[#35698F] text-white font-bold rounded text-xs"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-3 py-1 bg-[#64748B] text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!confirmAction && canAuthorize && (
                <div className="pt-2 border-t border-[#D9E3EC] flex space-x-2 justify-end">
                  <button
                    onClick={() => setConfirmAction('AUTHORIZE')}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded font-bold flex items-center gap-1 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    ACCEPT ALLOCATION
                  </button>
                  <button
                    onClick={() => setConfirmAction('REJECT')}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded font-bold flex items-center gap-1 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    REJECT ALLOCATION
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* READ-ONLY INSPECTION SLIDE-OVER */}
      {selectedAllocation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end font-mono text-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#F4F8FC] text-[#243447] flex items-center justify-between border-b border-[#D9E3EC]">
              <h3 className="text-sm font-bold uppercase">Allocation Inspection #{selectedAllocation.id.slice(0, 8)}</h3>
              <button onClick={() => setSelectedAllocation(null)} className="text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div>District: <strong>{selectedAllocation.district_name || 'Kota'}</strong></div>
              <div>Resource: <strong className="text-[#1E425E]">{selectedAllocation.resource_type}</strong></div>
              <div>Status: <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(selectedAllocation.status)}`}>{selectedAllocation.status}</span></div>
            </div>
            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-end">
              <button onClick={() => setSelectedAllocation(null)} className="px-4 py-1.5 bg-[#64748B] text-white rounded font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
