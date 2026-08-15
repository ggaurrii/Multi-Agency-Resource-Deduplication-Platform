import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { FileQuestion, AlertOctagon, Plus, Filter, Zap } from 'lucide-react';

export default function Needs() {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    const fetchNeeds = async () => {
      setLoading(true);
      const data = await sahayogApi.getNeeds({
        priority: priorityFilter || undefined,
      });
      setNeeds(data.items || []);
      setLoading(false);
    };
    fetchNeeds();
  }, [priorityFilter]);

  const mockNeeds = [
    { id: 'n-101', district_name: 'Kota', resource_type: 'DRINKING_WATER', quantity_needed: 10000, quantity_fulfilled: 2500, unit: 'liters', priority: 'CRITICAL', deadline: '2026-08-15T23:30:00Z', status: 'PARTIALLY_MET' },
    { id: 'n-102', district_name: 'Kota', resource_type: 'BOAT', quantity_needed: 15, quantity_fulfilled: 5, unit: 'units', priority: 'CRITICAL', deadline: '2026-08-15T23:45:00Z', status: 'PARTIALLY_MET' },
    { id: 'n-103', district_name: 'Baran', resource_type: 'AMBULANCE', quantity_needed: 6, quantity_fulfilled: 2, unit: 'units', priority: 'HIGH', deadline: '2026-08-16T03:00:00Z', status: 'OPEN' },
    { id: 'n-104', district_name: 'Bundi', resource_type: 'FOOD_PACKET', quantity_needed: 5000, quantity_fulfilled: 5000, unit: 'packets', priority: 'MEDIUM', deadline: '2026-08-16T12:00:00Z', status: 'RESOLVED' },
  ];

  const itemsToDisplay = needs.length > 0 ? needs : mockNeeds;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white';
      case 'HIGH':
        return 'bg-amber-600 text-white';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <MainLayout title="District Requisitions / Needs">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
            District Relief Needs & Requisitions
          </h1>
          <p className="text-xs text-slate-500">
            Auto-prioritized disaster demand requests derived from critical deadlines (FR-PRI-01)
          </p>
        </div>
        <button className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>File New Requisition</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL (≤ 2 hours)</option>
            <option value="HIGH">HIGH (≤ 6 hours)</option>
            <option value="MEDIUM">MEDIUM (≤ 24 hours)</option>
            <option value="LOW">LOW (&gt; 24 hours)</option>
          </select>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900">{itemsToDisplay.length}</span> requisitions
        </div>
      </div>

      {/* Needs Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <th className="p-3">Need ID</th>
              <th className="p-3">District</th>
              <th className="p-3">Resource Requested</th>
              <th className="p-3">Required</th>
              <th className="p-3">Fulfilled</th>
              <th className="p-3">Remaining</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
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
                  <td className="p-3 font-bold">{item.quantity_needed.toLocaleString()}</td>
                  <td className="p-3 text-emerald-700">{item.quantity_fulfilled.toLocaleString()}</td>
                  <td className="p-3 text-rose-700 font-bold">{remaining.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{item.status}</td>
                  <td className="p-3">
                    {item.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => navigate('/matching')}
                        className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        Match Stock
                      </button>
                    ) : (
                      <span className="text-slate-400">Fulfilled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
