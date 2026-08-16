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
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide text-[#243447]">
              Unified Resource Pooling & Deduplication
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Aggregated cross-agency relief inventory grouped by District and Resource Type
          </p>
        </div>
        <button
          onClick={() => navigate('/matching')}
          className="px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Zap className="w-4 h-4 text-[#FFE082]" />
          <span>Match Engine</span>
        </button>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying prototype deduplication pool.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype Data
          </span>
        </div>
      )}

      {/* Grid of Deduplicated Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {itemsToDisplay.map((pool, idx) => {
          const demand = pool.demand || (pool.total_available_quantity * 1.25);
          const netBalance = pool.total_available_quantity - demand;
          const isDeficit = netBalance < 0;

          return (
            <div key={idx} className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden flex flex-col justify-between">
              {/* Card Header */}
              <div>
                <div className="bg-[#F4F8FC] border-b border-[#D9E3EC] px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#35698F] uppercase tracking-widest">
                      {pool.district_name || 'Kota Sector'}
                    </span>
                    <h3 className="text-sm font-bold text-[#243447]">{pool.resource_type}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase">Pooled Stock</span>
                    <p className="text-lg font-bold text-[#2E7D32]">
                      {pool.total_available_quantity.toLocaleString()} <span className="text-xs text-[#64748B] font-normal">{pool.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Net Balance & Demand Summary */}
                <div className="px-4 py-2 bg-white border-b border-[#D9E3EC] flex items-center justify-between text-xs">
                  <div className="text-[#64748B]">
                    Demand: <strong className="text-[#243447]">{demand.toLocaleString()} {pool.unit}</strong>
                  </div>
                  <div>
                    {isDeficit ? (
                      <span className="px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] font-bold rounded text-[10px] flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> DEFICIT: {netBalance.toLocaleString()} {pool.unit}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold rounded text-[10px] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> SURPLUS: +{netBalance.toLocaleString()} {pool.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Agency Breakdown List */}
                <div className="p-3 bg-[#F4F8FC] space-y-2">
                  <h4 className="text-[11px] font-bold text-[#243447] uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#35698F]" />
                    Cross-Agency Contributions:
                  </h4>
                  <div className="space-y-1.5">
                    {pool.agency_breakdown.map((agency, aIdx) => {
                      const pct = pool.total_available_quantity > 0
                        ? Math.round((agency.quantity / pool.total_available_quantity) * 100)
                        : 0;
                      return (
                        <div key={aIdx} className="bg-white border border-[#D9E3EC] rounded p-2 text-xs">
                          <div className="flex justify-between font-semibold text-[#243447] mb-1 text-[11px]">
                            <span>{agency.agency_name}</span>
                            <span className="text-[#35698F] font-bold">{agency.quantity.toLocaleString()} {pool.unit} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-[#F4F8FC] h-1.5 rounded overflow-hidden border border-[#D9E3EC]">
                            <div className="bg-[#35698F] h-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-4 py-2.5 bg-white border-t border-[#D9E3EC] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  {pool.agency_breakdown.length} Agencies Pooled
                </span>
                <button
                  onClick={() => navigate(`/matching?district=${encodeURIComponent(pool.district_name || 'Kota')}&type=${encodeURIComponent(pool.resource_type)}`)}
                  className="px-2.5 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>MATCH NEEDS</span>
                  <ArrowRight className="w-3 h-3 text-[#FFE082]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
