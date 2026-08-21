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
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const data = await sahayogApi.getNeeds();
        const items = data?.items || [];
        setNeedsList(items);

        if (items.length > 0) {
          if (needIdFromUrl) {
            const found = items.find((n) => n.id === needIdFromUrl) || items[0];
            setSelectedNeedId(found.id);
            setSelectedNeed(found);
          } else {
            setSelectedNeedId(items[0].id);
            setSelectedNeed(items[0]);
          }
        } else {
          setSelectedNeedId('');
          setSelectedNeed(null);
        }
      } catch (err) {
        console.error('Error fetching real needs for matching:', err);
        setErrorMessage('Failed to load requisitions from backend API. Please ensure you are authenticated.');
      }
    };
    fetchNeeds();
  }, [needIdFromUrl]);

  const handleSelectNeed = (id) => {
    setSelectedNeedId(id);
    const found = needsList.find((n) => n.id === id);
    setSelectedNeed(found || null);
    setMatchingResult(null);
    setErrorMessage(null);
  };

  const runMatchingEngine = async () => {
    if (!selectedNeed) return;
    setMatchingLoading(true);
    setErrorMessage(null);
    setMatchingResult(null);

    try {
      const res = await sahayogApi.matchNeed(selectedNeed.id);
      if (res && res.items) {
        setMatchingResult(res);
      } else {
        setErrorMessage('No matching resources were allocated by the engine.');
      }
    } catch (err) {
      console.error('Backend matching engine error:', err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : detail?.error?.message || err.message || 'Matching engine execution failed.';
      setErrorMessage(msg);
    } finally {
      setMatchingLoading(false);
    }
  };

  const remainingNeeded = selectedNeed ? Number(selectedNeed.quantity_needed || 0) - Number(selectedNeed.quantity_fulfilled || 0) : 0;
  
  const matchedQty = matchingResult?.items?.reduce(
    (sum, item) => sum + Number(item.quantity_allocated || 0),
    0
  ) || 0;

  const unmatchedQty = Math.max(0, remainingNeeded - matchedQty);

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

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0" />
            <span>
              <strong>MATCHING FAILED</strong> — {errorMessage}
            </span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#C62828] underline font-bold text-[10px] uppercase"
          >
            Dismiss
          </button>
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
            {needsList.length === 0 ? (
              <option value="">No requisitions available</option>
            ) : (
              needsList.map((n) => (
                <option key={n.id} value={n.id}>
                  #{n.id.slice(0, 8)} — {n.district_name || 'Kota'} ({n.resource_type}) — Priority: {n.priority}
                </option>
              ))
            )}
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
                <strong>{Number(selectedNeed.quantity_needed || 0).toLocaleString()} {selectedNeed.unit}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Fulfilled Stock</span>
                <strong className="text-[#2E7D32]">{Number(selectedNeed.quantity_fulfilled || 0).toLocaleString()} {selectedNeed.unit}</strong>
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
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[#243447]">
                  MATCHING ALLOCATION PROPOSAL (#{matchingResult.id?.slice(0, 8) || 'PROPOSED'})
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold rounded">
                  MATCHED: {matchedQty.toLocaleString()} {selectedNeed?.unit || 'units'}
                </span>
                {unmatchedQty > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] font-bold rounded">
                    UNMATCHED DEFICIT: {unmatchedQty.toLocaleString()} {selectedNeed?.unit || 'units'}
                  </span>
                )}
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold rounded">
                STATUS: {matchingResult.status || 'PROPOSED'}
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                  <th className="p-2.5">Item ID</th>
                  <th className="p-2.5">Resource ID</th>
                  <th className="p-2.5">Allocated Quantity</th>
                  <th className="p-2.5">Proximity Distance</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3EC]">
                {matchingResult.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F8FC]">
                    <td className="p-2.5 font-bold text-[#243447]">
                      #{item.id ? String(item.id).slice(0, 8) : 'N/A'}
                    </td>
                    <td className="p-2.5 font-bold text-[#1E425E] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#35698F] shrink-0" />
                      #{item.resource_id ? String(item.resource_id).slice(0, 8) : 'N/A'}
                    </td>
                    <td className="p-2.5 font-bold text-[#2E7D32]">
                      {Number(item.quantity_allocated || 0).toLocaleString()} {selectedNeed?.unit || 'units'}
                    </td>
                    <td className="p-2.5 text-[#243447] font-semibold">
                      {Number(item.distance_km || 0).toFixed(1)} km
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

          {/* ALLOCATION ACTION CTA */}
          <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-[#243447] text-xs uppercase">Allocation Proposal Created</h4>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                The greedy engine has allocated resources and transitioned inventory stock state to RESERVED.
              </p>
            </div>

            <button
              onClick={() => navigate('/allocations')}
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Check className="w-4 h-4 text-white" />
              <span>VIEW ALLOCATIONS BOARD</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
