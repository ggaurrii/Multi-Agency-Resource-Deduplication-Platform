import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { Boxes, Filter, Search, Plus, Building2, MapPin } from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const data = await sahayogApi.getResources({
        resource_type: filterType || undefined,
      });
      setResources(data.items || []);
      setLoading(false);
    };
    fetchResources();
  }, [filterType]);

  // Demo resource items if backend items empty
  const displayItems = resources.length > 0 ? resources : [
    { id: '1', resource_type: 'BOAT', quantity_total: 25, quantity_available: 18, quantity_reserved: 4, quantity_in_transit: 3, unit: 'units', status: 'AVAILABLE', agency_name: 'NDRF 6th Bn', district_name: 'Kota' },
    { id: '2', resource_type: 'DRINKING_WATER', quantity_total: 50000, quantity_available: 35000, quantity_reserved: 10000, quantity_in_transit: 5000, unit: 'liters', status: 'AVAILABLE', agency_name: 'State Disaster Reserve', district_name: 'Kota' },
    { id: '3', resource_type: 'AMBULANCE', quantity_total: 12, quantity_available: 8, quantity_reserved: 2, quantity_in_transit: 2, unit: 'units', status: 'AVAILABLE', agency_name: 'Army Medical Corps', district_name: 'Baran' },
    { id: '4', resource_type: 'FOOD_PACKET', quantity_total: 20000, quantity_available: 15000, quantity_reserved: 30000, quantity_in_transit: 2000, unit: 'packets', status: 'AVAILABLE', agency_name: 'Sahayata NGO Federation', district_name: 'Bundi' },
    { id: '5', resource_type: 'GENERATOR', quantity_total: 18, quantity_available: 14, quantity_reserved: 2, quantity_in_transit: 2, unit: 'units', status: 'AVAILABLE', agency_name: 'SDRF Base Command', district_name: 'Jhalawar' },
  ];

  return (
    <MainLayout title="Resource Inventory">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
            Multi-Agency Resource Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Physical relief equipment and consumables held across participating agencies
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Register New Resource</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs font-mono w-full border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600"
            >
              <option value="">All Resource Types</option>
              <option value="BOAT">Rescue Boats</option>
              <option value="AMBULANCE">Ambulances</option>
              <option value="GENERATOR">Power Generators</option>
              <option value="FOOD_PACKET">Food Packets</option>
              <option value="DRINKING_WATER">Drinking Water</option>
            </select>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900">{displayItems.length}</span> items
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <th className="p-3">Resource Type</th>
              <th className="p-3">Agency</th>
              <th className="p-3">District</th>
              <th className="p-3">Total Owned</th>
              <th className="p-3">Available</th>
              <th className="p-3">Reserved</th>
              <th className="p-3">In Transit</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-blue-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  {item.resource_type}
                </td>
                <td className="p-3 text-slate-800">{item.agency_name || 'NDRF / SDRF'}</td>
                <td className="p-3 text-slate-800">{item.district_name || 'Kota'}</td>
                <td className="p-3 font-bold">{item.quantity_total.toLocaleString()} {item.unit}</td>
                <td className="p-3 text-emerald-700 font-bold">{item.quantity_available.toLocaleString()} {item.unit}</td>
                <td className="p-3 text-purple-700 font-bold">{item.quantity_reserved.toLocaleString()} {item.unit}</td>
                <td className="p-3 text-blue-700 font-bold">{item.quantity_in_transit.toLocaleString()} {item.unit}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
