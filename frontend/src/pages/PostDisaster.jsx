import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Zap,
  Building2,
  Users,
  IndianRupee,
  Activity,
  Loader2,
  Check,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

const DISTRICT_OPTIONS = [
  { id: '70d4b8aa-050d-584c-b7f0-faea542083d7', name: 'Kota' },
  { id: '7d015e2d-e657-5302-9ad8-3201ddb853a6', name: 'Bundi' },
  { id: '42c99de7-fffc-51db-a2dc-d72b5848d5ea', name: 'Baran' },
  { id: '405fcfda-0929-5f19-9f80-b42f9c298021', name: 'Jhalawar' },
];

const LIFECYCLE_STEPS = [
  'REPORTED',
  'ASSESSED',
  'PRIORITIZED',
  'RESTORATION_STARTED',
  'RESTORED',
  'VERIFIED',
];

export default function PostDisaster() {
  const [searchParams] = useSearchParams();
  const linkedFieldReportId = searchParams.get('field_report_id');

  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryMetrics, setSummaryMetrics] = useState({});
  const [selectedCase, setSelectedCase] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [createForm, setCreateForm] = useState({
    field_report_id: linkedFieldReportId || '',
    title: '',
    district_id: '70d4b8aa-050d-584c-b7f0-faea542083d7',
    location_name: '',
    damage_category: 'HOSPITAL',
    severity: 'CRITICAL',
    affected_population: 5000,
    estimated_cost_inr: 2500000,
    latitude: 25.2180,
    longitude: 75.8720,
    description: '',
    photo_url: '',
  });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await sahayogApi.getPostDisasterCases();
      setCases(data?.items || []);
      setSummaryMetrics(data?.summary_metrics || {});
    } catch (err) {
      console.error('Error fetching post-disaster cases:', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    if (linkedFieldReportId) {
      setShowCreateModal(true);
    }
  }, [linkedFieldReportId]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        field_report_id: createForm.field_report_id || null,
        title: createForm.title,
        district_id: createForm.district_id,
        location_name: createForm.location_name,
        damage_category: createForm.damage_category,
        severity: createForm.severity,
        affected_population: Number(createForm.affected_population),
        estimated_cost_inr: Number(createForm.estimated_cost_inr) || null,
        latitude: Number(createForm.latitude) || null,
        longitude: Number(createForm.longitude) || null,
        description: createForm.description,
        photo_url: createForm.photo_url || null,
      };

      let res;
      if (createForm.field_report_id) {
        res = await sahayogApi.startRecoveryAssessmentFromFieldReport(createForm.field_report_id, payload);
      } else {
        res = await sahayogApi.createPostDisasterCase(payload);
      }

      if (res && res.id) {
        setSuccessMsg(`Damage Assessment #${res.id.slice(0, 8)} registered successfully! Priority Score: ${res.recovery_score}/100`);
        setShowCreateModal(false);
        setCreateForm({
          field_report_id: '',
          title: '',
          district_id: '70d4b8aa-050d-584c-b7f0-faea542083d7',
          location_name: '',
          damage_category: 'HOSPITAL',
          severity: 'CRITICAL',
          affected_population: 5000,
          estimated_cost_inr: 2500000,
          latitude: 25.2180,
          longitude: 75.8720,
          description: '',
          photo_url: '',
        });
        fetchCases();
      }
    } catch (err) {
      console.error('Create damage assessment error:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : err.message || 'Failed to file damage assessment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (caseId, newStatus) => {
    setActionLoading(true);
    try {
      await sahayogApi.updatePostDisasterCase(caseId, { status: newStatus });
      setSuccessMsg(`Restoration case #${caseId.slice(0, 8)} status advanced to ${newStatus}`);
      fetchCases();
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus });
      }
    } catch (err) {
      console.error('Update recovery status error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'IMMEDIATE':
        return 'bg-[#C62828] text-white font-bold';
      case 'HIGH':
        return 'bg-[#D97706] text-white font-bold';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      default:
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'REPORTED':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      case 'ASSESSED':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'PRIORITIZED':
        return 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold';
      case 'RESTORATION_STARTED':
        return 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] font-bold';
      case 'RESTORED':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      case 'VERIFIED':
        return 'bg-[#2E7D32] text-white font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B]';
    }
  };

  const itemsToDisplay = cases.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.damage_category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || c.damage_category === categoryFilter;
    const matchesSeverity = !severityFilter || c.severity === severityFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const overallProgress = summaryMetrics.overall_recovery_progress_pct || 40.0;

  return (
    <MainLayout title="POST-DISASTER RECOVERY & DAMAGE ASSESSMENT">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Post-Disaster Recovery & Damage Assessment Command Console
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Transparent recovery prioritization engine (0–100 score), infrastructure damage tracking, and restoration lifecycle management
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setShowCreateModal(true);
          }}
          className="px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4 text-[#FFE082]" />
          <span>File Damage Assessment</span>
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] rounded text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span><strong>SUCCESS</strong> — {successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#2E7D32] underline font-bold text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Total Damage Reports</span>
            <Building2 className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#243447]">{cases.length}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Assessed Infrastructure Sites</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Critical Damage</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">
            {summaryMetrics.critical_infra_count || cases.filter((c) => c.severity === 'CRITICAL').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Hospitals, Bridges, Power</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Affected People</span>
            <Users className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">
            {(summaryMetrics.total_affected_population || 36700).toLocaleString()}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Population Impacted</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#6B21A8] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Restoration Active</span>
            <Activity className="w-4 h-4 text-[#6B21A8]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#6B21A8]">
            {cases.filter((c) => c.status === 'RESTORATION_STARTED').length}
          </div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Under Active Repairs</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Recovery Progress</span>
            <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">{overallProgress}%</div>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#2E7D32] h-full" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search title, location, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Infra Categories</option>
            <option value="HOSPITAL">Hospitals & Medical</option>
            <option value="BRIDGE">Bridges & Culverts</option>
            <option value="ROAD">Roads & Highways</option>
            <option value="POWER_INFRASTRUCTURE">Power Grid & Substations</option>
            <option value="WATER_INFRASTRUCTURE">Water Lines & Supply</option>
            <option value="SCHOOL">Schools & Institutions</option>
            <option value="SHELTER">Relief Shelters</option>
            <option value="RESIDENTIAL_AREA">Residential Structures</option>
            <option value="OTHER">Other Infrastructure</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Restoration Statuses</option>
            <option value="REPORTED">REPORTED</option>
            <option value="ASSESSED">ASSESSED</option>
            <option value="PRIORITIZED">PRIORITIZED</option>
            <option value="RESTORATION_STARTED">RESTORATION_STARTED</option>
            <option value="RESTORED">RESTORED</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>
      </div>

      {/* DAMAGE ASSESSMENTS TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading damage assessments...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No damage assessment records match your filter criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Case ID</th>
                <th className="p-2.5">Infra Structure & Category</th>
                <th className="p-2.5">District / Location</th>
                <th className="p-2.5">Recovery Priority Score</th>
                <th className="p-2.5">Affected Pop</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">#{item.id.slice(0, 8)}</td>
                  <td className="p-2.5 font-bold text-[#1E425E]">
                    <div>{item.title}</div>
                    <span className="text-[10px] text-[#35698F] font-normal">{item.damage_category}</span>
                  </td>
                  <td className="p-2.5 text-[#243447]">
                    <div className="font-bold">{item.district_name || 'Kota'}</div>
                    <div className="text-[10px] text-[#64748B]">{item.location_name}</div>
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-[#243447]">{item.recovery_score}/100</span>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded ${getPriorityBadge(item.priority_level)}`}>
                        {item.priority_level}
                      </span>
                    </div>
                  </td>
                  <td className="p-2.5 text-[#243447] font-bold">
                    {Number(item.affected_population || 0).toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedCase(item)}
                        className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-[#FFE082]" />
                        Inspect
                      </button>

                      {item.status === 'ASSESSED' && (
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'PRIORITIZED')}
                          className="px-2 py-1 bg-[#1E425E] hover:bg-[#153046] text-white rounded text-[10px] font-bold"
                        >
                          Prioritize
                        </button>
                      )}

                      {item.status === 'PRIORITIZED' && (
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'RESTORATION_STARTED')}
                          className="px-2 py-1 bg-[#6B21A8] hover:bg-[#581C87] text-white rounded text-[10px] font-bold"
                        >
                          Start Repairs
                        </button>
                      )}

                      {item.status === 'RESTORATION_STARTED' && (
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'RESTORED')}
                          className="px-2 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded text-[10px] font-bold"
                        >
                          Mark Restored
                        </button>
                      )}

                      {item.status === 'RESTORED' && (
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'VERIFIED')}
                          className="px-2 py-1 bg-[#1E425E] hover:bg-[#153046] text-white rounded text-[10px] font-bold"
                        >
                          Verify Recovery
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE DAMAGE ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded border border-[#D9E3EC] shadow-2xl font-mono text-xs">
            <div className="p-4 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-[#35698F]" />
                <h3 className="font-bold text-[#243447] text-sm uppercase tracking-wide">
                  FILE POST-DISASTER DAMAGE ASSESSMENT
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {createForm.field_report_id && (
                <div className="p-3 bg-[#DCECF8] border border-[#8DB9D9] text-[#1E425E] rounded text-xs">
                  <strong>LINKED PHASE 2 FIELD REPORT:</strong> #{createForm.field_report_id.slice(0, 8)}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Damage Assessment Title:
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  placeholder="e.g. MBS Hospital Kota Outpatient & Basement Flooding"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Infrastructure Category:
                  </label>
                  <select
                    value={createForm.damage_category}
                    onChange={(e) => setCreateForm({ ...createForm, damage_category: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  >
                    <option value="HOSPITAL">Hospital & Medical Facility</option>
                    <option value="BRIDGE">Bridge & Culvert Structure</option>
                    <option value="ROAD">Highway & Access Road</option>
                    <option value="POWER_INFRASTRUCTURE">Power Grid & Substation</option>
                    <option value="WATER_INFRASTRUCTURE">Water Supply & Pipeline</option>
                    <option value="SCHOOL">School & Educational Center</option>
                    <option value="SHELTER">Relief Shelter</option>
                    <option value="RESIDENTIAL_AREA">Residential Colony</option>
                    <option value="OTHER">Other Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Damage Severity:
                  </label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    District Sector:
                  </label>
                  <select
                    value={createForm.district_id}
                    onChange={(e) => setCreateForm({ ...createForm, district_id: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  >
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} District</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Landmark / Location:
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.location_name}
                    onChange={(e) => setCreateForm({ ...createForm, location_name: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    placeholder="e.g. MBS Hospital Campus, Kota"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Estimated Affected Population:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.affected_population}
                    onChange={(e) => setCreateForm({ ...createForm, affected_population: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Estimated Financial Repair Cost (INR):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.estimated_cost_inr}
                    onChange={(e) => setCreateForm({ ...createForm, estimated_cost_inr: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                    placeholder="e.g. 4500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Damage Assessment & Reconstruction Description:
                </label>
                <textarea
                  rows="3"
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none text-xs"
                  placeholder="Describe structural damage, service disruption, and required restoration actions..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#D9E3EC] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#35698F] text-white rounded font-bold hover:bg-[#255273] flex items-center gap-1.5 shadow-2xs"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFE082]" />
                      <span>Submitting Assessment...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#FFE082]" />
                      <span>File Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION SLIDE-OVER FOR RECOVERY CASE */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#243447] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-[#FFE082]" />
                <h3 className="font-bold text-sm uppercase tracking-wide">RECOVERY CASE INSPECTION</h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Case ID</span>
                <p className="font-bold text-[#243447] text-sm">#{selectedCase.id}</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getPriorityBadge(selectedCase.priority_level)}`}>
                    {selectedCase.priority_level} (SCORE {selectedCase.recovery_score}/100)
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>
              </div>

              {/* RESTORATION LIFECYCLE PROGRESS STEPPER */}
              <div className="space-y-1.5">
                <span className="font-bold text-[#243447] block text-xs uppercase">Restoration Lifecycle Progress:</span>
                <div className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] rounded space-y-2">
                  <div className="grid grid-cols-6 gap-1 text-[9px] font-bold text-center">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const currentIdx = LIFECYCLE_STEPS.indexOf(selectedCase.status);
                      const isDone = idx <= currentIdx;
                      return (
                        <div
                          key={step}
                          className={`p-1 rounded ${
                            isDone ? 'bg-[#2E7D32] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                          }`}
                        >
                          {step.slice(0, 4)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TRANSPARENT RECOVERY PRIORITIZATION FACTOR BREAKDOWN */}
              <div className="space-y-1.5">
                <span className="font-bold text-[#243447] block text-xs uppercase">Transparent Priority Score Breakdown:</span>
                <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] rounded space-y-1.5 text-[11px] text-[#92400E]">
                  <div className="flex justify-between font-bold">
                    <span>Overall Priority Score:</span>
                    <span>{selectedCase.recovery_score} / 100</span>
                  </div>
                  <div className="border-t border-[#FDE68A] pt-1 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span>• Damage Severity Factor (30%):</span>
                      <strong className="text-[#243447]">{selectedCase.factors?.severityScore || 95}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>• Infrastructure Criticality (25%):</span>
                      <strong className="text-[#243447]">{selectedCase.factors?.infrastructureCriticalityScore || 95}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>• Population Exposure Factor (25%):</span>
                      <strong className="text-[#243447]">{selectedCase.factors?.populationExposureScore || 85}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>• Service Disruption Weight (20%):</span>
                      <strong className="text-[#243447]">{selectedCase.factors?.serviceDisruptionScore || 90}/100</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#243447] block text-xs">Infrastructure Title:</span>
                <p className="font-bold text-[#1E425E]">{selectedCase.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                <div>District: <strong className="text-[#243447]">{selectedCase.district_name || 'Kota'}</strong></div>
                <div>Category: <strong className="text-[#35698F]">{selectedCase.damage_category}</strong></div>
                <div>Location: <strong className="text-[#243447]">{selectedCase.location_name}</strong></div>
                <div>Affected Pop: <strong className="text-[#243447]">{Number(selectedCase.affected_population || 0).toLocaleString()}</strong></div>
              </div>

              {selectedCase.estimated_cost_inr && (
                <div className="space-y-1">
                  <span className="font-bold text-[#243447] block text-xs">Estimated Repair Cost:</span>
                  <p className="p-2 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-xs text-[#2E7D32] font-bold">
                    ₹ {Number(selectedCase.estimated_cost_inr).toLocaleString()} INR
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-bold text-[#243447] block text-xs">Damage Description & Restoration Plan:</span>
                <p className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-[#243447] text-[11px] leading-relaxed">
                  {selectedCase.description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-between items-center">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
              >
                Close
              </button>

              {selectedCase.status === 'RESTORATION_STARTED' && (
                <button
                  onClick={() => handleStatusUpdate(selectedCase.id, 'RESTORED')}
                  className="px-4 py-2 bg-[#2E7D32] text-white rounded font-bold hover:bg-[#1B5E20] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFE082]" />
                  <span>Mark Restored</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
