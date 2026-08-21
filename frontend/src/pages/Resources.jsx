import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canEditResource } from '../utils/permissions';
import {
  Boxes,
  Search,
  Plus,
  Building2,
  X,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Lock,
  Loader2,
  AlertTriangle,
  Check
} from 'lucide-react';

const DISTRICT_OPTIONS = [
  { id: '70d4b8aa-050d-584c-b7f0-faea542083d7', name: 'Kota' },
  { id: '7d015e2d-e657-5302-9ad8-3201ddb853a6', name: 'Bundi' },
  { id: '42c99de7-fffc-51db-a2dc-d72b5848d5ea', name: 'Baran' },
  { id: '405fcfda-0929-5f19-9f80-b42f9c298021', name: 'Jhalawar' },
];

const AGENCY_OPTIONS = [
  { id: 'f7f2d306-3499-5527-b5a6-845e2b290fa6', name: 'NDRF Battalion 5' },
  { id: '7a155fd1-7fce-5327-802c-4a3129155b44', name: 'Indian Army - Jaipur Division' },
  { id: '53d20508-e28a-54d7-a6c9-e535001ae4f1', name: 'Relief Foundation India (NGO)' },
  { id: '71ee4cbc-9099-5efe-852a-ba68417838d0', name: 'Rajasthan State Disaster Management Authority' },
];

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterAgency, setFilterAgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Register Resource Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);

  const [createForm, setCreateForm] = useState({
    agency_id: user?.agency_id || 'f7f2d306-3499-5527-b5a6-845e2b290fa6',
    district_id: '70d4b8aa-050d-584c-b7f0-faea542083d7',
    resource_type: 'BOAT',
    quantity_total: 10,
    quantity_available: 10,
    unit: 'units',
    latitude: 25.2138,
    longitude: 75.8648,
    status: 'AVAILABLE',
  });

  const fetchResources = async () => {
    setLoading(true);
    const params = {};
    if (filterType) params.resource_type = filterType;
    if (filterStatus) params.status = filterStatus;

    const data = await sahayogApi.getResources(params);
    if (data?.is_demo_fallback) {
      setIsDemoFallback(true);
      setResources([]);
    } else {
      setIsDemoFallback(false);
      setResources(data?.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, filterStatus]);

  const handleCreateResourceSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const qtyTotal = Number(createForm.quantity_total);
      const qtyAvail = Number(createForm.quantity_available);

      if (qtyTotal <= 0) {
        setCreateError('Total quantity must be greater than 0.');
        setCreateLoading(false);
        return;
      }

      if (qtyAvail < 0 || qtyAvail > qtyTotal) {
        setCreateError('Available quantity cannot be negative or greater than total quantity.');
        setCreateLoading(false);
        return;
      }

      const payload = {
        agency_id: user?.agency_id || createForm.agency_id,
        district_id: createForm.district_id,
        resource_type: createForm.resource_type,
        quantity_total: qtyTotal,
        quantity_available: qtyAvail,
        unit: createForm.unit || 'units',
        status: createForm.status || 'AVAILABLE',
      };

      if (createForm.latitude !== '' && createForm.longitude !== '') {
        payload.latitude = Number(createForm.latitude);
        payload.longitude = Number(createForm.longitude);
      }

      const res = await sahayogApi.createResource(payload);
      if (res && res.id) {
        setCreateSuccess(`Resource #${res.id.slice(0, 8)} registered successfully!`);
        setShowCreateModal(false);
        fetchResources(); // Refresh live table
      }
    } catch (err) {
      console.error('Failed to create resource:', err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : detail?.error?.message || err.message || 'Failed to register resource.';
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // Realistic Rajasthan Flood Demo Stock
  const mockResources = [
    {
      id: 'r-1001-kota-boats',
      resource_type: 'BOAT',
      agency_name: 'NDRF Battalion 5',
      agency_type: 'NDRF',
      district_name: 'Kota',
      quantity_total: 25,
      quantity_available: 18,
      quantity_reserved: 4,
      quantity_in_transit: 3,
      unit: 'units',
      status: 'AVAILABLE',
      location: 'SRID=4326;POINT(75.8648 25.2138)',
      created_at: '2026-08-15T10:00:00Z',
    },
    {
      id: 'r-1002-kota-water',
      resource_type: 'DRINKING_WATER',
      agency_name: 'Rajasthan State Disaster Authority',
      agency_type: 'STATE_AUTHORITY',
      district_name: 'Kota',
      quantity_total: 50000,
      quantity_available: 35000,
      quantity_reserved: 10000,
      quantity_in_transit: 5000,
      unit: 'liters',
      status: 'AVAILABLE',
      location: 'SRID=4326;POINT(75.8500 25.2000)',
      created_at: '2026-08-15T11:30:00Z',
    },
    {
      id: 'r-1003-baran-ambulance',
      resource_type: 'AMBULANCE',
      agency_name: 'Indian Army - Jaipur Division',
      agency_type: 'ARMY',
      district_name: 'Baran',
      quantity_total: 12,
      quantity_available: 8,
      quantity_reserved: 2,
      quantity_in_transit: 2,
      unit: 'units',
      status: 'AVAILABLE',
      location: 'SRID=4326;POINT(76.5132 25.1012)',
      created_at: '2026-08-15T09:15:00Z',
    },
  ];

  const itemsToDisplay = (resources.length > 0 ? resources : mockResources).filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.agency_name && r.agency_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.district_name && r.district_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = !filterType || r.resource_type === filterType;
    const matchesDistrict = !filterDistrict || r.district_name === filterDistrict;
    const matchesAgency = !filterAgency || (r.agency_type && r.agency_type === filterAgency);
    const matchesStatus = !filterStatus || r.status === filterStatus;

    return matchesSearch && matchesType && matchesDistrict && matchesAgency && matchesStatus;
  });

  return (
    <MainLayout title="Resource Inventory">
      {/* Header */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <h1 className="text-base font-bold font-mono text-[#243447] uppercase tracking-wide">
            Multi-Agency Resource Inventory
          </h1>
          <p className="text-xs text-[#64748B]">
            Physical relief equipment and consumables held across participating agencies
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError(null);
            setShowCreateModal(true);
          }}
          className="px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Resource</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {createSuccess && (
        <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span><strong>SUCCESS</strong> — {createSuccess}</span>
          </div>
          <button
            onClick={() => setCreateSuccess(null)}
            className="text-[#2E7D32] underline font-bold text-[10px] uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DEV MODE Notification Banner */}
      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying prototype inventory metrics.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype Data
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by type, agency, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          {/* Resource Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="BOAT">Rescue Boats</option>
            <option value="AMBULANCE">Ambulances</option>
            <option value="GENERATOR">Power Generators</option>
            <option value="FOOD_PACKET">Food Packets</option>
            <option value="DRINKING_WATER">Drinking Water</option>
          </select>

          {/* District Filter */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="">All Districts</option>
            <option value="Kota">Kota</option>
            <option value="Bundi">Bundi</option>
            <option value="Baran">Baran</option>
            <option value="Jhalawar">Jhalawar</option>
          </select>

          {/* Agency Filter */}
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="">All Agency Types</option>
            <option value="NDRF">NDRF</option>
            <option value="ARMY">Army</option>
            <option value="SDRF">SDRF</option>
            <option value="NGO">NGO</option>
            <option value="STATE_AUTHORITY">State Authority</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Status Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1 px-2 border border-slate-300 rounded text-xs font-mono bg-white"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DEPLOYED">DEPLOYED</option>
              <option value="DAMAGED">DAMAGED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
          <span className="text-slate-500">
            Showing <strong className="text-slate-900">{itemsToDisplay.length}</strong> items
          </span>
        </div>
      </div>

      {/* Resource Inventory Table */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading resources...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No resources match your filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Resource Type</th>
                <th className="p-2.5">Agency</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">Total</th>
                <th className="p-2.5">Available</th>
                <th className="p-2.5">Reserved</th>
                <th className="p-2.5">In Transit</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#1E425E] flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                    {item.resource_type}
                  </td>
                  <td className="p-2.5 text-[#243447]">{item.agency_name || 'NDRF Battalion 5'}</td>
                  <td className="p-2.5 text-[#243447] font-semibold">{item.district_name || 'Kota'}</td>
                  <td className="p-2.5 font-bold text-[#243447]">{Number(item.quantity_total || 0).toLocaleString()} {item.unit}</td>
                  <td className="p-2.5 text-[#2E7D32] font-bold">{Number(item.quantity_available || 0).toLocaleString()} {item.unit}</td>
                  <td className="p-2.5 text-[#CA8A04] font-bold">{Number(item.quantity_reserved || 0).toLocaleString()} {item.unit}</td>
                  <td className="p-2.5 text-[#35698F] font-bold">{Number(item.quantity_in_transit || 0).toLocaleString()} {item.unit}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold rounded text-[10px]">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <button
                      onClick={() => setSelectedResource(item)}
                      className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-[#FFE082]" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* REGISTER RESOURCE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded border border-[#D9E3EC] shadow-2xl font-mono text-xs">
            <div className="p-4 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-[#35698F]" />
                <h3 className="font-bold text-[#243447] text-sm uppercase tracking-wide">
                  REGISTER NEW MULTI-AGENCY RESOURCE
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#64748B] hover:text-[#243447]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResourceSubmit} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Owning Agency:
                  </label>
                  <select
                    value={user?.agency_id || createForm.agency_id}
                    onChange={(e) => setCreateForm({ ...createForm, agency_id: e.target.value })}
                    disabled={!!user?.agency_id}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    required
                  >
                    {AGENCY_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Target District:
                  </label>
                  <select
                    value={createForm.district_id}
                    onChange={(e) => setCreateForm({ ...createForm, district_id: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    required
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} District
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Resource Type:
                  </label>
                  <select
                    value={createForm.resource_type}
                    onChange={(e) => {
                      const rType = e.target.value;
                      const unit = rType === 'DRINKING_WATER' ? 'liters' : rType === 'FOOD_PACKET' ? 'packets' : 'units';
                      setCreateForm({ ...createForm, resource_type: rType, unit });
                    }}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    required
                  >
                    <option value="BOAT">Rescue Boat</option>
                    <option value="AMBULANCE">Ambulance</option>
                    <option value="GENERATOR">Power Generator</option>
                    <option value="FOOD_PACKET">Food Packets</option>
                    <option value="DRINKING_WATER">Drinking Water</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Unit:
                  </label>
                  <input
                    type="text"
                    value={createForm.unit}
                    onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    placeholder="units / liters / packets"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Total Quantity Owned:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.quantity_total}
                    onChange={(e) => setCreateForm({ ...createForm, quantity_total: e.target.value, quantity_available: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Available Stock:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={createForm.quantity_total}
                    value={createForm.quantity_available}
                    onChange={(e) => setCreateForm({ ...createForm, quantity_available: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Latitude (PostGIS Point):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.latitude}
                    onChange={(e) => setCreateForm({ ...createForm, latitude: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    placeholder="e.g. 25.2138"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Longitude (PostGIS Point):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.longitude}
                    onChange={(e) => setCreateForm({ ...createForm, longitude: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    placeholder="e.g. 75.8648"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9E3EC] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#64748B] hover:bg-[#475569] text-white rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-[#35698F] hover:bg-[#255273] text-white rounded font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFE082]" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#FFE082]" />
                      <span>Register Stock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE DETAILS SLIDE-OVER PANEL */}
      {selectedResource && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-slate-200">
            {/* Slide-over Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Resource Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide-over Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Resource Identifier</span>
                <p className="font-bold text-slate-900 text-sm">#{selectedResource.id}</p>
                <span className="inline-block px-2 py-0.5 bg-blue-900 text-white font-bold rounded text-[10px]">
                  {selectedResource.resource_type}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Administrative Ownership & Access
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Agency: <strong className="text-slate-900">{selectedResource.agency_name || 'NDRF Battalion 5'}</strong></div>
                  <div>District: <strong className="text-slate-900">{selectedResource.district_name || 'Kota'}</strong></div>
                </div>
                <div className="pt-1">
                  {canEditResource(user, selectedResource) ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Full Management Access Authorized</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded font-bold flex items-center gap-1.5 text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Read-Only View (Belongs to {selectedResource.agency_name || 'another agency'})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Quantity Sub-Fields (Partial Allocation)
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Stock Owned:</span>
                    <strong className="text-slate-900">{Number(selectedResource.quantity_total || 0).toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Available Stock:</span>
                    <strong className="font-bold">{Number(selectedResource.quantity_available || 0).toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-purple-700">
                    <span>Reserved Stock (Proposed):</span>
                    <strong className="font-bold">{Number(selectedResource.quantity_reserved || 0).toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>In Transit (Authorized):</span>
                    <strong className="font-bold">{Number(selectedResource.quantity_in_transit || 0).toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                </div>
              </div>

              {selectedResource.location && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                    Geospatial Location (PostGIS Point)
                  </h4>
                  <p className="text-[11px] text-slate-600 font-mono bg-slate-100 p-2 rounded border border-slate-200">
                    {selectedResource.location}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Lifecycle Status
                </h4>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-xs">
                    {selectedResource.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Added: {new Date(selectedResource.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Slide-over Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
