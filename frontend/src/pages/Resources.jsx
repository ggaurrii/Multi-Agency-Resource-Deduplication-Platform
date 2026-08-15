import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  Boxes,
  Filter,
  Search,
  Plus,
  Building2,
  MapPin,
  X,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle2,
  Eye
} from 'lucide-react';

export default function Resources() {
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
    {
      id: 'r-1004-bundi-food',
      resource_type: 'FOOD_PACKET',
      agency_name: 'Relief Foundation India',
      agency_type: 'NGO',
      district_name: 'Bundi',
      quantity_total: 20000,
      quantity_available: 15000,
      quantity_reserved: 3000,
      quantity_in_transit: 2000,
      unit: 'packets',
      status: 'AVAILABLE',
      location: 'SRID=4326;POINT(75.6499 25.4305)',
      created_at: '2026-08-15T12:00:00Z',
    },
    {
      id: 'r-1005-jhalawar-gen',
      resource_type: 'GENERATOR',
      agency_name: 'NDRF Battalion 5',
      agency_type: 'NDRF',
      district_name: 'Jhalawar',
      quantity_total: 18,
      quantity_available: 14,
      quantity_reserved: 2,
      quantity_in_transit: 2,
      unit: 'units',
      status: 'AVAILABLE',
      location: 'SRID=4326;POINT(76.1660 24.5974)',
      created_at: '2026-08-15T08:00:00Z',
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
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-slate-900 uppercase tracking-wide">
            Multi-Agency Resource Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Physical relief equipment and consumables held across participating agencies
          </p>
        </div>
        <button className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Register New Resource</span>
        </button>
      </div>

      {/* DEV MODE Authorization Notification Banner */}
      {isDemoFallback && (
        <div className="p-3 bg-amber-950/80 border border-amber-800/80 text-amber-200 rounded-md text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEVELOPMENT AUTHORIZATION REQUIRED</strong> — Live backend database synchronization requires a valid JWT login session. Displaying prototype inventory metrics.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-900 text-amber-300 rounded font-bold text-[10px] uppercase">
            Prototype Data
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by type, agency, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs font-mono w-full border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50"
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
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500">Loading resources...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500">
            No resources match your filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <th className="p-3">Resource Type</th>
                <th className="p-3">Agency</th>
                <th className="p-3">District</th>
                <th className="p-3">Total</th>
                <th className="p-3">Available</th>
                <th className="p-3">Reserved</th>
                <th className="p-3">In Transit</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsToDisplay.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-blue-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600 shrink-0" />
                    {item.resource_type}
                  </td>
                  <td className="p-3 text-slate-800">{item.agency_name || 'NDRF Battalion 5'}</td>
                  <td className="p-3 text-slate-800 font-semibold">{item.district_name || 'Kota'}</td>
                  <td className="p-3 font-bold">{item.quantity_total.toLocaleString()} {item.unit}</td>
                  <td className="p-3 text-emerald-700 font-bold">{item.quantity_available.toLocaleString()} {item.unit}</td>
                  <td className="p-3 text-purple-700 font-bold">{item.quantity_reserved.toLocaleString()} {item.unit}</td>
                  <td className="p-3 text-blue-700 font-bold">{item.quantity_in_transit.toLocaleString()} {item.unit}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedResource(item)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  Administrative Ownership
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>Agency: <strong className="text-slate-900">{selectedResource.agency_name || 'NDRF Battalion 5'}</strong></div>
                  <div>District: <strong className="text-slate-900">{selectedResource.district_name || 'Kota'}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
                  Quantity Sub-Fields (Partial Allocation)
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Stock Owned:</span>
                    <strong className="text-slate-900">{selectedResource.quantity_total.toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Available Stock:</span>
                    <strong className="font-bold">{selectedResource.quantity_available.toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-purple-700">
                    <span>Reserved Stock (Proposed):</span>
                    <strong className="font-bold">{selectedResource.quantity_reserved.toLocaleString()} {selectedResource.unit}</strong>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>In Transit (Authorized):</span>
                    <strong className="font-bold">{selectedResource.quantity_in_transit.toLocaleString()} {selectedResource.unit}</strong>
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
