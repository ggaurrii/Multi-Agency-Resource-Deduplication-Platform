import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { Layers, Building2, Zap, Shield, Filter } from 'lucide-react';

export default function ResourcePool() {
  const navigate = useNavigate();
  const [pooledData, setPooledData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPooled = async () => {
      setLoading(true);
      const data = await sahayogApi.getPooledResources();
      setPooledData(data || []);
      setLoading(false);
    };
    fetchPooled();
  }, []);

  // Demo fallback pooled breakdown
  const mockPooled = [
    {
      district_name: 'Kota',
      resource_type: 'DRINKING_WATER',
      total_available_quantity: 15000,
      unit: 'liters',
      agency_breakdown: [
        { agency_name: 'NDRF 6th Bn', quantity: 6000 },
        { agency_name: 'Indian Army 61 Bn', quantity: 5000 },
        { agency_name: 'SDRF Rajasthan', quantity: 3000 },
        { agency_name: 'Sahayata NGO', quantity: 1000 },
      ]
    },
    {
      district_name: 'Kota',
      resource_type: 'BOAT',
      total_available_quantity: 18,
      unit: 'units',
      agency_breakdown: [
        { agency_name: 'NDRF 6th Bn', quantity: 10 },
        { agency_name: 'Indian Army 61 Bn', quantity: 5 },
        { agency_name: 'SDRF Rajasthan', quantity: 3 },
      ]
    },
    {
      district_name: 'Bundi',
      resource_type: 'FOOD_PACKET',
      total_available_quantity: 12000,
      unit: 'packets',
      agency_breakdown: [
        { agency_name: 'Sahayata NGO Federation', quantity: 8000 },
        { agency_name: 'State Authority Warehouse', quantity: 4000 },
      ]
    },
    {
      district_name: 'Baran',
      resource_type: 'AMBULANCE',
      total_available_quantity: 8,
      unit: 'units',
      agency_breakdown: [
        { agency_name: 'Army Medical Corps', quantity: 5 },
        { agency_name: 'District Health Authority', quantity: 3 },
      ]
    }
  ];

  const itemsToDisplay = pooledData.length > 0 ? pooledData : mockPooled;

  return (
    <MainLayout title="Deduplicated Resource Pool">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold font-mono uppercase tracking-wide">
              Unified Resource Pooling & Deduplication
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated cross-agency relief inventory grouped by District and Resource Type (FR-DED-01 / SDD §4.1)
          </p>
        </div>
        <button
          onClick={() => navigate('/matching')}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-mono font-bold flex items-center gap-2 shadow-sm"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Find Matching Needs</span>
        </button>
      </div>

      {/* Grid of Pooled Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itemsToDisplay.map((pool, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{pool.district_name || 'Hadoti Sector'}</span>
                <h3 className="text-base font-black text-white">{pool.resource_type}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Available</span>
                <p className="text-xl font-black text-emerald-400">
                  {pool.total_available_quantity.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{pool.unit}</span>
                </p>
              </div>
            </div>

            {/* Agency Breakdown Table */}
            <div className="p-4 bg-slate-50">
              <h4 className="text-xs font-bold font-mono text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                Cross-Agency Deduplicated Contributions:
              </h4>
              <div className="space-y-2">
                {pool.agency_breakdown.map((agency, aIdx) => {
                  const pct = Math.round((agency.quantity / pool.total_available_quantity) * 100);
                  return (
                    <div key={aIdx} className="bg-white border border-slate-200 rounded p-2.5 text-xs font-mono">
                      <div className="flex justify-between font-semibold text-slate-900 mb-1">
                        <span>{agency.agency_name}</span>
                        <span className="text-blue-900">{agency.quantity.toLocaleString()} {pool.unit} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-700 h-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => navigate('/matching')}
                className="text-xs font-mono text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
              >
                <span>Allocate From This Pool →</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
