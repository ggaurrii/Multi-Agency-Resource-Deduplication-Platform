import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { Layers, Building2, Zap, ShieldAlert, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function ResourcePool() {
  const navigate = useNavigate();
  const [pooledData, setPooledData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

  useEffect(() => {
    const fetchPooled = async () => {
      setLoading(true);
      const data = await sahayogApi.getPooledResources();
      if (!data || data.length === 0) {
        setIsDemoFallback(true);
        setPooledData([]);
      } else {
        setIsDemoFallback(false);
        setPooledData(data);
      }
      setLoading(false);
    };
    fetchPooled();
  }, []);

  // Demo fallback pooled breakdown representing Hadoti flood response
  const mockPooled = [
    {
      district_name: 'Kota',
      resource_type: 'DRINKING_WATER',
      total_available_quantity: 15000,
      demand: 25000,
      unit: 'liters',
      agency_breakdown: [
        { agency_name: 'NDRF Battalion 5', quantity: 6000 },
        { agency_name: 'Indian Army - Jaipur Division', quantity: 5000 },
        { agency_name: 'SDRF Rajasthan Unit 4', quantity: 3000 },
        { agency_name: 'Relief Foundation India (NGO)', quantity: 1000 },
      ]
    },
    {
      district_name: 'Kota',
      resource_type: 'BOAT',
      total_available_quantity: 18,
      demand: 25,
      unit: 'units',
      agency_breakdown: [
        { agency_name: 'NDRF Battalion 5', quantity: 10 },
        { agency_name: 'Indian Army - Jaipur Division', quantity: 5 },
        { agency_name: 'SDRF Rajasthan Unit 4', quantity: 3 },
      ]
    },
    {
      district_name: 'Bundi',
      resource_type: 'FOOD_PACKET',
      total_available_quantity: 12000,
      demand: 8000,
      unit: 'packets',
      agency_breakdown: [
        { agency_name: 'Relief Foundation India (NGO)', quantity: 8000 },
        { agency_name: 'State Disaster Management Authority', quantity: 4000 },
      ]
    },
    {
      district_name: 'Baran',
      resource_type: 'AMBULANCE',
      total_available_quantity: 8,
      demand: 12,
      unit: 'units',
      agency_breakdown: [
        { agency_name: 'Indian Army Medical Corps', quantity: 5 },
        { agency_name: 'District Health Authority', quantity: 3 },
      ]
    },
    {
      district_name: 'Jhalawar',
      resource_type: 'GENERATOR',
      total_available_quantity: 14,
      demand: 10,
      unit: 'units',
      agency_breakdown: [
        { agency_name: 'NDRF Battalion 5', quantity: 8 },
        { agency_name: 'SDRF Rajasthan Unit 4', quantity: 6 },
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
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Launch Matching Engine</span>
        </button>
      </div>

      {/* DEV MODE Authorization Notification Banner */}
      {isDemoFallback && (
        <div className="p-3 bg-amber-950/80 border border-amber-800/80 text-amber-200 rounded-md text-xs font-mono flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>DEVELOPMENT AUTHORIZATION REQUIRED</strong> — Endpoint <code className="bg-amber-900 px-1 py-0.5 rounded text-amber-200">GET /api/v1/pooled</code> requires an authenticated JWT session for live PostGIS DB aggregation. Displaying prototype deduplication pool.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-amber-900 text-amber-300 rounded font-bold text-[10px] uppercase">
            Prototype Data
          </span>
        </div>
      )}

      {/* Grid of Deduplicated Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itemsToDisplay.map((pool, idx) => {
          const demand = pool.demand || (pool.total_available_quantity * 1.25);
          const netBalance = pool.total_available_quantity - demand;
          const isDeficit = netBalance < 0;

          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Card Header */}
              <div>
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                      {pool.district_name || 'Kota Sector'}
                    </span>
                    <h3 className="text-base font-black text-white">{pool.resource_type}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Pooled Stock</span>
                    <p className="text-xl font-black text-emerald-400">
                      {pool.total_available_quantity.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{pool.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Net Balance & Demand Summary */}
                <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">Demand: <strong className="text-slate-900">{demand.toLocaleString()} {pool.unit}</strong></span>
                  </div>
                  <div>
                    {isDeficit ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-extrabold rounded text-[11px] flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" /> DEFICIT: {netBalance.toLocaleString()} {pool.unit}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold rounded text-[11px] flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> SURPLUS: +{netBalance.toLocaleString()} {pool.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Agency Breakdown List */}
                <div className="p-4 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold font-mono text-slate-700 uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    Cross-Agency Deduplicated Contributions:
                  </h4>
                  <div className="space-y-2">
                    {pool.agency_breakdown.map((agency, aIdx) => {
                      const pct = pool.total_available_quantity > 0
                        ? Math.round((agency.quantity / pool.total_available_quantity) * 100)
                        : 0;
                      return (
                        <div key={aIdx} className="bg-white border border-slate-200 rounded p-2.5 text-xs font-mono">
                          <div className="flex justify-between font-semibold text-slate-900 mb-1">
                            <span>{agency.agency_name}</span>
                            <span className="text-blue-900 font-bold">{agency.quantity.toLocaleString()} {pool.unit} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-700 h-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-500">
                  {pool.agency_breakdown.length} Agencies Pooled
                </span>
                <button
                  onClick={() => navigate(`/matching?district=${encodeURIComponent(pool.district_name || 'Kota')}&type=${encodeURIComponent(pool.resource_type)}`)}
                  className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>FIND MATCHING NEEDS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
