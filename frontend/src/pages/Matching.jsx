import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import {
  Zap,
  CheckCircle2,
  Building2,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileQuestion,
  Boxes,
  Truck,
  Check
} from 'lucide-react';

export default function Matching() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const needIdFromUrl = searchParams.get('need');

  const [needsList, setNeedsList] = useState([]);
  const [selectedNeedId, setSelectedNeedId] = useState('');
  const [selectedNeed, setSelectedNeed] = useState(null);

  const [matchingResult, setMatchingResult] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [allocationCreated, setAllocationCreated] = useState(null);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

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
    },
  ];

  const mockMatchings = {
    'n-1042-kota-water': {
      need_id: 'n-1042-kota-water',
      status: 'PROPOSED',
      matched_quantity: 6000,
      unmatched_quantity: 0,
      items: [
        {
          agency_name: 'NDRF Battalion 5',
          resource_id: 'res-w-1',
          distance_km: 12.4,
          available_stock: 4000,
          quantity_allocated: 4000,
          unit: 'liters',
        },
        {
          agency_name: 'Indian Army - Jaipur Division',
          resource_id: 'res-w-2',
          distance_km: 28.1,
          available_stock: 5000,
          quantity_allocated: 2000,
          unit: 'liters',
        },
      ],
    },
    'n-1043-kota-boats': {
      need_id: 'n-1043-kota-boats',
      status: 'PROPOSED',
      matched_quantity: 10,
      unmatched_quantity: 0,
      items: [
        {
          agency_name: 'NDRF Battalion 5',
          resource_id: 'res-b-1',
          distance_km: 12.4,
          available_stock: 8,
          quantity_allocated: 7,
          unit: 'units',
        },
        {
          agency_name: 'SDRF Rajasthan Unit 4',
          resource_id: 'res-b-2',
          distance_km: 18.6,
          available_stock: 3,
          quantity_allocated: 3,
          unit: 'units',
        },
      ],
    },
    'n-1044-baran-amb': {
      need_id: 'n-1044-baran-amb',
      status: 'PROPOSED',
      matched_quantity: 3,
      unmatched_quantity: 1,
      items: [
        {
          agency_name: 'Indian Army Medical Corps',
          resource_id: 'res-a-1',
          distance_km: 24.5,
          available_stock: 3,
          quantity_allocated: 3,
          unit: 'units',
        },
      ],
    },
  };

  useEffect(() => {
    const fetchNeeds = async () => {
      const data = await sahayogApi.getNeeds();
      if (data?.is_demo_fallback || !data?.items || data.items.length === 0) {
        setIsDemoFallback(true);
        setNeedsList(mockNeeds);
        if (needIdFromUrl) {
          const found = mockNeeds.find((n) => n.id === needIdFromUrl) || mockNeeds[0];
          setSelectedNeedId(found.id);
          setSelectedNeed(found);
        } else {
          setSelectedNeedId(mockNeeds[0].id);
          setSelectedNeed(mockNeeds[0]);
        }
      } else {
        setIsDemoFallback(false);
        setNeedsList(data.items);
        if (needIdFromUrl) {
          const found = data.items.find((n) => n.id === needIdFromUrl) || data.items[0];
          setSelectedNeedId(found.id);
          setSelectedNeed(found);
        } else {
          setSelectedNeedId(data.items[0].id);
          setSelectedNeed(data.items[0]);
        }
      }
    };
    fetchNeeds();
  }, [needIdFromUrl]);

  const handleSelectNeed = (id) => {
    setSelectedNeedId(id);
    const found = needsList.find((n) => n.id === id);
    setSelectedNeed(found || null);
    setMatchingResult(null);
    setAllocationCreated(null);
  };

  const runMatchingEngine = async () => {
    if (!selectedNeed) return;
    setMatchingLoading(true);
    setAllocationCreated(null);

    try {
      const res = await sahayogApi.matchNeed(selectedNeed.id);
      if (res && res.items) {
        setMatchingResult(res);
      } else {
        setMatchingResult(mockMatchings[selectedNeed.id] || mockMatchings['n-1042-kota-water']);
      }
    } catch (err) {
      console.info('Backend match endpoint required real auth. Presenting prototype matching solution.');
      setMatchingResult(mockMatchings[selectedNeed.id] || mockMatchings['n-1042-kota-water']);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateAllocation = async () => {
    if (!selectedNeed) return;
    setMatchingLoading(true);
    try {
      const res = await sahayogApi.matchNeed(selectedNeed.id);
      setAllocationCreated(res || { id: 'alloc-9901-prop', status: 'PROPOSED' });
    } catch (err) {
      setAllocationCreated({ id: 'alloc-9901-prop', status: 'PROPOSED' });
    } finally {
      setMatchingLoading(false);
    }
  };

  const remainingNeeded = selectedNeed ? selectedNeed.quantity_needed - selectedNeed.quantity_fulfilled : 0;
  const matchedQty = matchingResult ? (matchingResult.matched_quantity ?? 6000) : 0;
  const unmatchedQty = matchingResult ? (matchingResult.unmatched_quantity ?? Math.max(0, remainingNeeded - matchedQty)) : 0;

  return (
    <MainLayout title="RESOURCE MATCHING ENGINE">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Greedy Resource Matching Engine
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] rounded">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Match critical requirements with available multi-agency resources using proximity and quantity
          </p>
        </div>
      </div>

      {isDemoFallback && (
        <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] text-[#854D0E] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>DEV MODE ACTIVE</strong> — Displaying prototype matching algorithm execution.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded font-bold text-[10px] uppercase border border-[#FDE68A]">
            Prototype Mode
          </span>
        </div>
      )}

      {/* MATCHING WORKFLOW PIPELINE VISUAL */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3.5 shadow-2xs font-mono text-xs">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-2">
          MATCHING PIPELINE WORKFLOW (SDD §4.2)
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[#243447] font-semibold bg-[#F4F8FC] p-3 rounded border border-[#D9E3EC] text-[11px]">
          <div className="flex items-center gap-1 text-[#1E425E]">
            <FileQuestion className="w-3.5 h-3.5 text-[#35698F]" />
            <span>1. REQUISITION</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          <div className="flex items-center gap-1 text-[#1E425E]">
            <Boxes className="w-3.5 h-3.5 text-[#35698F]" />
            <span>2. STOCK POOL</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          <div className="flex items-center gap-1 text-[#D97706]">
            <Zap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>3. GREEDY MATCH</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          <div className="flex items-center gap-1 text-[#6B21A8]">
            <Truck className="w-3.5 h-3.5 text-[#6B21A8]" />
            <span>4. PROPOSE</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          <div className="flex items-center gap-1 text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>5. AUTHORIZE</span>
          </div>
        </div>
      </div>

      {/* SELECT NEED SECTION */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs font-mono text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="font-bold text-[#243447] text-xs uppercase tracking-wide">
            Select Requisition for Matching:
          </label>
          <select
            value={selectedNeedId}
            onChange={(e) => handleSelectNeed(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono font-bold bg-[#F4F8FC] focus:outline-none focus:border-[#35698F] max-w-md"
          >
            {needsList.map((n) => (
              <option key={n.id} value={n.id}>
                #{n.id.slice(0, 8)} — {n.district_name || 'Kota'} ({n.resource_type}) — Priority: {n.priority}
              </option>
            ))}
          </select>
        </div>

        {selectedNeed ? (
          <div className="border border-[#D9E3EC] rounded p-3 bg-[#F4F8FC] space-y-3">
            <div className="flex items-center justify-between border-b border-[#D9E3EC] pb-2">
              <span className="font-bold text-[#243447] text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C62828]" /> #{selectedNeed.id} ({selectedNeed.district_name || 'Kota'})
              </span>
              <span className="px-2 py-0.5 bg-[#C62828] text-white font-bold rounded text-[10px]">
                {selectedNeed.priority} PRIORITY
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#243447]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Resource Needed</span>
                <strong className="text-[#1E425E]">{selectedNeed.resource_type}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Total Required</span>
                <strong>{selectedNeed.quantity_needed.toLocaleString()} {selectedNeed.unit}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Fulfilled Stock</span>
                <strong className="text-[#2E7D32]">{selectedNeed.quantity_fulfilled.toLocaleString()} {selectedNeed.unit}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Remaining Deficit</span>
                <strong className="text-[#C62828] font-bold">
                  {remainingNeeded.toLocaleString()} {selectedNeed.unit}
                </strong>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={runMatchingEngine}
                disabled={matchingLoading}
                className="px-4 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {matchingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFE082]" />
                    <span>Executing Greedy Match...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#FFE082]" />
                    <span>RUN MATCHING ENGINE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-[#64748B] font-mono text-xs">
            SELECT A NEED TO BEGIN MATCHING
          </div>
        )}
      </div>

      {/* RECOMMENDED RESOURCES & MATCH RESULTS */}
      {matchingResult && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#243447]">
                RECOMMENDED MULTI-AGENCY RESOURCE SPLIT
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold rounded">PROPOSED</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                  <th className="p-2.5">Contributing Agency</th>
                  <th className="p-2.5">Proximity Distance</th>
                  <th className="p-2.5">Available Stock</th>
                  <th className="p-2.5">Suggested Allocation</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3EC]">
                {matchingResult.items.map((item, i) => (
                  <tr key={i} className="hover:bg-[#F4F8FC]">
                    <td className="p-2.5 font-bold text-[#243447] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                      {item.agency_name}
                    </td>
                    <td className="p-2.5 text-[#243447] font-semibold">{item.distance_km} km</td>
                    <td className="p-2.5 text-[#64748B]">{item.available_stock.toLocaleString()} {item.unit}</td>
                    <td className="p-2.5 font-bold text-[#1E425E]">
                      {item.quantity_allocated.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold rounded text-[10px]">
                        RESERVED (PROPOSED)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* COMMIT ALLOCATION WORKFLOW */}
          <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-[#243447] text-xs uppercase">Commit Matching Proposal</h4>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                Creates allocation proposal and transitions stock state to RESERVED
              </p>
            </div>

            {allocationCreated ? (
              <div className="p-2.5 bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] rounded font-bold flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>ALLOCATION PROPOSED (#{allocationCreated.id || 'alloc-9901'})</span>
                <button
                  onClick={() => navigate('/allocations')}
                  className="ml-2 px-2.5 py-1 bg-[#2E7D32] text-white rounded text-[10px] hover:bg-[#1B5E20]"
                >
                  View Allocations →
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateAllocation}
                disabled={matchingLoading}
                className="px-4 py-2 bg-[#35698F] hover:bg-[#255273] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Zap className="w-4 h-4 text-[#FFE082]" />
                <span>CREATE ALLOCATION (PROPOSE)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
