import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
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
  MapPin,
  Clock,
  FileText,
  Camera,
  Loader2,
  Check,
  ArrowRight
} from 'lucide-react';
import { activeIncidents as mockIncidents } from '../data/disasterMockData';

const DISTRICT_OPTIONS = [
  { id: '70d4b8aa-050d-584c-b7f0-faea542083d7', name: 'Kota' },
  { id: '7d015e2d-e657-5302-9ad8-3201ddb853a6', name: 'Bundi' },
  { id: '42c99de7-fffc-51db-a2dc-d72b5848d5ea', name: 'Baran' },
  { id: '405fcfda-0929-5f19-9f80-b42f9c298021', name: 'Jhalawar' },
];

export default function FieldReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingReport, setConvertingReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State for New Report
  const [createForm, setCreateForm] = useState({
    title: '',
    disaster_type: 'FLOOD',
    severity: 'HIGH',
    district_id: '70d4b8aa-050d-584c-b7f0-faea542083d7',
    location_name: '',
    latitude: 25.2138,
    longitude: 75.8648,
    description: '',
    photo_url: '',
  });

  // Form State for Convert to Need Requisition
  const [convertForm, setConvertForm] = useState({
    resource_type: 'BOAT',
    quantity_needed: 10,
    deadline: '',
  });

  const getDefaultDeadline = () => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await sahayogApi.getFieldReports();
      setReports(data?.items || []);
    } catch (err) {
      console.error('Error fetching live field reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: createForm.title,
        disaster_type: createForm.disaster_type,
        severity: createForm.severity,
        district_id: createForm.district_id,
        location_name: createForm.location_name,
        latitude: Number(createForm.latitude) || null,
        longitude: Number(createForm.longitude) || null,
        description: createForm.description,
        photo_url: createForm.photo_url || null,
      };

      const res = await sahayogApi.createFieldReport(payload);
      if (res && res.id) {
        setSuccessMsg(`Field Report #${res.id.slice(0, 8)} submitted successfully!`);
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          disaster_type: 'FLOOD',
          severity: 'HIGH',
          district_id: '70d4b8aa-050d-584c-b7f0-faea542083d7',
          location_name: '',
          latitude: 25.2138,
          longitude: 75.8648,
          description: '',
          photo_url: '',
        });
        fetchReports();
      }
    } catch (err) {
      console.error('Create report error:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : err.message || 'Failed to file report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    setActionLoading(true);
    try {
      await sahayogApi.updateFieldReport(reportId, { status: newStatus });
      setSuccessMsg(`Incident #${reportId.slice(0, 8)} status updated to ${newStatus}`);
      fetchReports();
    } catch (err) {
      console.error('Update report error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToNeedSubmit = async (e) => {
    e.preventDefault();
    if (!convertingReport) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const deadlineDate = new Date(convertForm.deadline);
      const payload = {
        resource_type: convertForm.resource_type,
        quantity_needed: Number(convertForm.quantity_needed),
        deadline: deadlineDate.toISOString(),
      };

      const res = await sahayogApi.convertFieldReportToNeed(convertingReport.id, payload);
      if (res) {
        setSuccessMsg(`Generated Requisition for Incident #${convertingReport.id.slice(0, 8)}! Flowing to Match Engine.`);
        setShowConvertModal(false);
        setConvertingReport(null);
        fetchReports();
        // Redirect to Needs or Match Engine
        setTimeout(() => navigate('/needs'), 1200);
      }
    } catch (err) {
      console.error('Convert report error:', err);
      const detail = err.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : err.message || 'Failed to convert report.');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
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
      case 'SUBMITTED':
        return 'bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold';
      case 'VERIFIED':
        return 'bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] font-bold';
      case 'RESPONDED':
        return 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE] font-bold';
      case 'RESOLVED':
        return 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-bold';
      default:
        return 'bg-[#F4F8FC] text-[#64748B]';
    }
  };

  const itemsToDisplay = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.disaster_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = !severityFilter || r.severity === severityFilter;
    const matchesType = !typeFilter || r.disaster_type === typeFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const criticalCount = reports.filter((r) => r.severity === 'CRITICAL').length;
  const unverifiedCount = reports.filter((r) => r.status === 'SUBMITTED').length;
  const respondedCount = reports.filter((r) => r.status === 'RESPONDED' || r.status === 'RESOLVED').length;

  return (
    <MainLayout title="FIELD INCIDENT REPORTING & RESPONSE">
      {/* Header Banner */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 text-[#243447] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold font-mono uppercase tracking-wide">
              Ground Incident Field Reporting Console
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Real-time distress incident reporting, field verification, and immediate requisition generation
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
          <span>File Ground Incident Report</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#35698F] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Total Reports</span>
            <Activity className="w-4 h-4 text-[#35698F]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#243447]">{reports.length}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Filed by Ground Responders</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#C62828] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Critical Emergencies</span>
            <AlertOctagon className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#C62828]">{criticalCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Immediate Action Required</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#D97706] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Unverified Reports</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#D97706]">{unverifiedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Awaiting Field Audit</p>
        </div>

        <div className="bg-white border border-[#D9E3EC] border-t-3 border-t-[#2E7D32] rounded p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] font-bold uppercase text-[11px]">
            <span>Responded / Converted</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#2E7D32]">{respondedCount}</div>
          <p className="text-[10px] text-[#64748B] mt-0.5">Linked to Resource Workflow</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search title, location, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono w-full border border-[#D9E3EC] rounded focus:outline-none focus:border-[#35698F] bg-[#F4F8FC]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Disaster Types</option>
            <option value="FLOOD">Flood Inundation</option>
            <option value="LANDSLIDE">Landslide / Debris</option>
            <option value="INFRASTRUCTURE_DAMAGE">Infra Damage</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
            <option value="OTHER">Other Disaster</option>
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
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="RESPONDED">RESPONDED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* FIELD REPORTS OPERATIONAL TABLE */}
      <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading field incident reports...</div>
        ) : itemsToDisplay.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            No incident reports match your filter criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FC] border-b border-[#D9E3EC] text-[#64748B] uppercase text-[10px]">
                <th className="p-2.5">Incident ID</th>
                <th className="p-2.5">Title & Disaster Type</th>
                <th className="p-2.5">District / Landmark</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Time Reported</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E3EC]">
              {itemsToDisplay.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F8FC]">
                  <td className="p-2.5 font-bold text-[#243447]">#{item.id.slice(0, 8)}</td>
                  <td className="p-2.5 font-bold text-[#1E425E]">
                    <div>{item.title}</div>
                    <span className="text-[10px] text-[#35698F] font-normal">{item.disaster_type}</span>
                  </td>
                  <td className="p-2.5 text-[#243447]">
                    <div className="font-bold">{item.district_name || 'Kota'}</div>
                    <div className="text-[10px] text-[#64748B]">{item.location_name}</div>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#64748B]">
                    {new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-2 py-1 bg-[#35698F] hover:bg-[#255273] text-white rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-[#FFE082]" />
                        Inspect
                      </button>

                      {item.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'VERIFIED')}
                          className="px-2 py-1 bg-[#1E425E] hover:bg-[#153046] text-white rounded text-[10px] font-bold"
                        >
                          Verify
                        </button>
                      )}

                      {!item.linked_need_id ? (
                        <button
                          onClick={() => {
                            setConvertingReport(item);
                            setConvertForm({
                              resource_type: item.disaster_type === 'FLOOD' ? 'BOAT' : item.disaster_type === 'MEDICAL_EMERGENCY' ? 'AMBULANCE' : 'FOOD_PACKET',
                              quantity_needed: 10,
                              deadline: getDefaultDeadline(),
                            });
                            setShowConvertModal(true);
                          }}
                          className="px-2 py-1 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-[#FFE082]" />
                          Gen Requisition
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/needs')}
                          className="px-2 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded text-[10px] font-bold"
                        >
                          View Need
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

      {/* CREATE INCIDENT REPORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded border border-[#D9E3EC] shadow-2xl font-mono text-xs">
            <div className="p-4 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#35698F]" />
                <h3 className="font-bold text-[#243447] text-sm uppercase tracking-wide">
                  FILE GROUND INCIDENT REPORT
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-[#64748B] hover:text-[#243447]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Incident Title:
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  placeholder="e.g. Chambal River Embankment Overflow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Disaster Category:
                  </label>
                  <select
                    value={createForm.disaster_type}
                    onChange={(e) => setCreateForm({ ...createForm, disaster_type: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  >
                    <option value="FLOOD">Flood Inundation</option>
                    <option value="LANDSLIDE">Landslide / Debris</option>
                    <option value="INFRASTRUCTURE_DAMAGE">Infra Damage</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                    <option value="OTHER">Other Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Severity Level:
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
                    placeholder="e.g. Kota Old Bridge Sector 4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    GPS Latitude:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.latitude}
                    onChange={(e) => setCreateForm({ ...createForm, latitude: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    GPS Longitude:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.longitude}
                    onChange={(e) => setCreateForm({ ...createForm, longitude: e.target.value })}
                    className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Incident Description & Ground Situation:
                </label>
                <textarea
                  rows="3"
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none text-xs"
                  placeholder="Describe ground situation, submerged area, casualties, and required relief..."
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Photographic Evidence Preview URL / Image Link:
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B]" />
                  <input
                    type="text"
                    value={createForm.photo_url}
                    onChange={(e) => setCreateForm({ ...createForm, photo_url: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none text-xs"
                    placeholder="https://example.com/disaster_photo.jpg (Optional)"
                  />
                </div>
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
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#FFE082]" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT INCIDENT TO REQUISITION MODAL */}
      {showConvertModal && convertingReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded border border-[#D9E3EC] shadow-2xl font-mono text-xs">
            <div className="p-4 bg-[#243447] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#FFE082]" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  GENERATE REQUISITION FROM INCIDENT #{convertingReport.id.slice(0, 8)}
                </h3>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvertToNeedSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] rounded space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Source Ground Incident</span>
                <p className="font-bold text-[#243447] text-xs">{convertingReport.title}</p>
                <p className="text-[10px] text-[#64748B]">{convertingReport.location_name} ({convertingReport.severity} SEVERITY)</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Required Resource Type:
                </label>
                <select
                  value={convertForm.resource_type}
                  onChange={(e) => setConvertForm({ ...convertForm, resource_type: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                  required
                >
                  <option value="BOAT">Rescue Boat (units)</option>
                  <option value="AMBULANCE">Ambulance (units)</option>
                  <option value="GENERATOR">Power Generator (units)</option>
                  <option value="FOOD_PACKET">Food Packet (packets)</option>
                  <option value="DRINKING_WATER">Drinking Water (liters)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Required Quantity:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={convertForm.quantity_needed}
                  onChange={(e) => setConvertForm({ ...convertForm, quantity_needed: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                  Target Fulfillment Deadline:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={convertForm.deadline}
                  onChange={(e) => setConvertForm({ ...convertForm, deadline: e.target.value })}
                  className="w-full p-2 border border-[#D9E3EC] rounded bg-[#F4F8FC] font-bold focus:border-[#35698F] focus:outline-none"
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  * Auto-calculates Priority (CRITICAL ≤ 2h, HIGH ≤ 6h, etc.) for Match Engine processing.
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9E3EC] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#C62828] text-white rounded font-bold hover:bg-[#B71C1C] flex items-center gap-1.5 shadow-2xs"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFE082]" />
                      <span>Generating Requisition...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#FFE082]" />
                      <span>Generate Need & Launch Flow</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION SLIDE-OVER FOR FIELD REPORT */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#243447] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#FFE082]" />
                <h3 className="font-bold text-sm uppercase tracking-wide">FIELD REPORT INSPECTION</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Report ID</span>
                <p className="font-bold text-[#243447] text-sm">#{selectedReport.id}</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getSeverityBadge(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${getStatusBadge(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#243447] block text-xs">Incident Title:</span>
                <p className="font-bold text-[#1E425E]">{selectedReport.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                <div>District: <strong className="text-[#243447]">{selectedReport.district_name || 'Kota'}</strong></div>
                <div>Disaster: <strong className="text-[#35698F]">{selectedReport.disaster_type}</strong></div>
                <div>Location: <strong className="text-[#243447]">{selectedReport.location_name}</strong></div>
                <div>Reporter: <strong className="text-[#243447]">{selectedReport.reporter_name || 'Field Officer'}</strong></div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#243447] block text-xs">Ground Situation Description:</span>
                <p className="p-3 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-[#243447] text-[11px] leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.latitude && selectedReport.longitude && (
                <div className="space-y-1">
                  <span className="font-bold text-[#243447] block text-xs">GPS Coordinates:</span>
                  <p className="p-2 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-[10px] text-[#64748B] font-mono">
                    Lat: {selectedReport.latitude}, Lng: {selectedReport.longitude}
                  </p>
                </div>
              )}

              {selectedReport.linked_need_id && (
                <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] rounded space-y-1">
                  <strong className="text-[10px] uppercase font-bold block">LINKED NEED REQUISITION:</strong>
                  <p className="font-bold text-xs">Need #{selectedReport.linked_need_id.slice(0, 8)}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-between items-center">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
              >
                Close
              </button>
              {!selectedReport.linked_need_id && (
                <button
                  onClick={() => {
                    const item = selectedReport;
                    setSelectedReport(null);
                    setConvertingReport(item);
                    setConvertForm({
                      resource_type: item.disaster_type === 'FLOOD' ? 'BOAT' : item.disaster_type === 'MEDICAL_EMERGENCY' ? 'AMBULANCE' : 'FOOD_PACKET',
                      quantity_needed: 10,
                      deadline: getDefaultDeadline(),
                    });
                    setShowConvertModal(true);
                  }}
                  className="px-4 py-2 bg-[#C62828] text-white rounded font-bold hover:bg-[#B71C1C] flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-[#FFE082]" />
                  <span>Gen Requisition</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
