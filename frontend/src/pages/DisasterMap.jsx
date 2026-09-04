import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle } from 'react-leaflet';
import L from 'leaflet';
import MainLayout from '../components/layout/MainLayout';
import {
  MapPin,
  Layers,
  Zap,
  Boxes,
  Truck,
  Building2,
  AlertOctagon,
  Eye,
  ArrowRight,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Home,
  CheckCircle2,
  Compass,
  X
} from 'lucide-react';
import {
  riskZones,
  activeIncidents,
  blockedRoutes,
  emergencyShelters,
  criticalInfrastructure,
  districtRiskProfiles
} from '../data/disasterMockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DisasterMap() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Kota');
  const [selectedItem, setSelectedItem] = useState(null);

  // Multi-Layer Control Switches
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showDamageSites, setShowDamageSites] = useState(true);
  const [showBlockedRoutes, setShowBlockedRoutes] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showInfra, setShowInfra] = useState(true);

  // Filters
  const [districtFilter, setDistrictFilter] = useState('');

  const districtCentroids = {
    Kota: { lat: 25.2138, lng: 75.8648, riskScore: 88, status: 'CRITICAL' },
    Bundi: { lat: 25.4305, lng: 75.6499, riskScore: 62, status: 'MEDIUM' },
    Baran: { lat: 25.1012, lng: 76.5132, riskScore: 74, status: 'HIGH' },
    Jhalawar: { lat: 24.5974, lng: 76.1660, riskScore: 48, status: 'LOW' },
  };

  const getRiskColor = (score) => {
    if (score >= 80) return '#C62828';
    if (score >= 60) return '#D97706';
    if (score >= 40) return '#CA8A04';
    return '#2E7D32';
  };

  const filteredRiskZones = riskZones.filter(
    (rz) => !districtFilter || rz.district === districtFilter
  );

  const filteredIncidents = activeIncidents.filter(
    (inc) => !districtFilter || inc.location.includes(districtFilter)
  );

  return (
    <MainLayout title="GIS DISASTER MANAGEMENT COMMAND MAP">
      {/* MAP CONTROL BAR */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs font-mono text-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#D9E3EC] pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#35698F]" />
            <div>
              <h1 className="text-base font-bold uppercase tracking-wide text-[#243447]">
                GIS Situational Awareness Command Map
              </h1>
              <p className="text-[11px] text-[#64748B]">
                Interactive Hazard Layering, Active Incident Tracking & Blocked Route Navigation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="py-1 px-2.5 border border-[#D9E3EC] rounded text-xs font-mono bg-[#F4F8FC] font-bold"
            >
              <option value="">All Sectors (Hadoti Region)</option>
              <option value="Kota">Kota Sector</option>
              <option value="Bundi">Bundi Sector</option>
              <option value="Baran">Baran Sector</option>
              <option value="Jhalawar">Jhalawar Sector</option>
            </select>
          </div>
        </div>

        {/* MULTI-LAYER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 bg-[#F4F8FC] p-2 rounded border border-[#D9E3EC]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">Layer Controls:</span>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showRiskZones}
              onChange={(e) => setShowRiskZones(e.target.checked)}
              className="accent-[#C62828]"
            />
            <span className="text-[#C62828]">● Risk Zones Overlay</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="accent-[#D97706]"
            />
            <span className="text-[#D97706]">● Active Incidents</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showDamageSites}
              onChange={(e) => setShowDamageSites(e.target.checked)}
              className="accent-[#6B21A8]"
            />
            <span className="text-[#6B21A8]">● Recovery & Damage Sites</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showBlockedRoutes}
              onChange={(e) => setShowBlockedRoutes(e.target.checked)}
              className="accent-[#C62828]"
            />
            <span className="text-[#C62828]">╌ Blocked Routes</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showResources}
              onChange={(e) => setShowResources(e.target.checked)}
              className="accent-[#2E7D32]"
            />
            <span className="text-[#2E7D32]">● Stock Depots</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-[#35698F]"
            />
            <span className="text-[#35698F]">▲ Relief Shelters</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447] bg-white px-2 py-1 rounded border border-[#D9E3EC]">
            <input
              type="checkbox"
              checked={showInfra}
              onChange={(e) => setShowInfra(e.target.checked)}
              className="accent-[#6B21A8]"
            />
            <span className="text-[#6B21A8]">■ Critical Infra</span>
          </label>
        </div>
      </div>

      {/* MAIN MAP LAYOUT WITH INTEGRATED SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-mono">
        {/* LEAFLET MAP CANVAS (3 COLS) */}
        <div className="lg:col-span-3 bg-white border border-[#D9E3EC] rounded overflow-hidden shadow-2xs relative h-[650px]">
          <MapContainer
            center={[25.2138, 75.8648]}
            zoom={9}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 1. RISK ZONES OVERLAY (SEMI-TRANSPARENT POLYGONS/CIRCLES) */}
            {showRiskZones &&
              filteredRiskZones.map((rz) => (
                <Circle
                  key={rz.id}
                  center={rz.center}
                  radius={rz.radius}
                  pathOptions={{
                    color: getRiskColor(rz.riskScore),
                    fillColor: getRiskColor(rz.riskScore),
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'RISK_ZONE', data: rz }),
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#243447] text-xs uppercase border-b border-[#D9E3EC] pb-1">
                        ⚠️ RISK ZONE: {rz.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Hazard: <strong className="text-[#243447]">{rz.hazardType}</strong>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Risk Score: <strong className="text-[#C62828]">{rz.riskScore}/100</strong>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Population Exposure: <strong>{rz.populationExposure.toLocaleString()} residents</strong>
                      </div>
                      <div className="pt-1 text-[10px] text-[#255273] font-bold">
                        Action: {rz.recommendedAction}
                      </div>
                    </div>
                  </Popup>
                </Circle>
              ))}

            {/* 2. ACTIVE INCIDENTS LAYER MARKERS */}
            {showIncidents &&
              filteredIncidents.map((inc) => (
                <CircleMarker
                  key={inc.id}
                  center={inc.coordinates}
                  radius={9}
                  pathOptions={{
                    color: '#C62828',
                    fillColor: '#FF8A80',
                    fillOpacity: 0.9,
                    weight: 2.5,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'INCIDENT', data: inc }),
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#C62828] text-xs uppercase border-b border-[#D9E3EC] pb-1">
                        🚨 INCIDENT: {inc.title}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Location: <strong className="text-[#243447]">{inc.location}</strong>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Status: <strong className="text-[#D97706]">{inc.responseStatus}</strong> ({inc.timeReported})
                      </div>
                      <p className="text-[10px] text-[#243447] pt-1">{inc.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            {/* 3. BLOCKED ROUTES LAYER (POLYLINES) */}
            {showBlockedRoutes &&
              blockedRoutes.map((br) => (
                <Polyline
                  key={br.id}
                  positions={br.coordinates}
                  pathOptions={{
                    color: '#C62828',
                    weight: 5,
                    dashArray: '10, 10',
                    opacity: 0.85,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'BLOCKED_ROUTE', data: br }),
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#C62828] uppercase border-b border-[#D9E3EC] pb-1">
                        ⛔ BLOCKED ROUTE: {br.routeName}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Reason: <strong className="text-[#243447]">{br.reason}</strong>
                      </div>
                      <div className="text-[11px] text-[#2E7D32] font-bold">
                        Alternative Route: {br.alternativeRoute}
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* 4. EMERGENCY SHELTERS MARKERS */}
            {showShelters &&
              emergencyShelters.map((sh) => (
                <CircleMarker
                  key={sh.id}
                  center={sh.coordinates}
                  radius={7}
                  pathOptions={{
                    color: '#35698F',
                    fillColor: '#DCECF8',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'SHELTER', data: sh }),
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#35698F] uppercase border-b border-[#D9E3EC] pb-1">
                        🏠 RELIEF SHELTER: {sh.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Occupancy: <strong className="text-[#243447]">{sh.currentOccupancy} / {sh.capacity}</strong>
                      </div>
                      <div className="text-[10px] text-[#2E7D32] font-bold">
                        Facilities: {sh.facilities.join(', ')}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            {/* 5. CRITICAL INFRASTRUCTURE MARKERS */}
            {showInfra &&
              criticalInfrastructure.map((inf) => (
                <CircleMarker
                  key={inf.id}
                  center={inf.coordinates}
                  radius={6}
                  pathOptions={{
                    color: '#6B21A8',
                    fillColor: '#F3E8FF',
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#6B21A8] uppercase border-b border-[#D9E3EC] pb-1">
                        ⚡ INFRASTRUCTURE: {inf.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Status: <strong className="text-[#C62828]">{inf.status}</strong>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            {/* 6. DISTRICT CENTROIDS MARKERS */}
            {Object.entries(districtCentroids).map(([name, data]) => {
              if (districtFilter && name !== districtFilter) return null;
              return (
                <Marker
                  key={name}
                  position={[data.lat, data.lng]}
                  eventHandlers={{
                    click: () => setSelectedDistrict(name),
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1 space-y-1">
                      <div className="font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1">
                        {name} Sector Control
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Risk Score: <strong className="text-[#C62828]">{data.riskScore}/100</strong>
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Status: <strong>{data.status}</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* FLOATING MAP LEGEND OVERLAY */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-[#D9E3EC] rounded p-2.5 shadow-md font-mono text-[10px] space-y-1">
            <div className="font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1 mb-1">
              GIS Map Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C62828] opacity-60 inline-block"></span>
              <span>Critical Risk Area (Score ≥ 80)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D97706] opacity-60 inline-block"></span>
              <span>High Risk Area (Score 60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C62828] border border-white inline-block"></span>
              <span>Active Field Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-[#C62828] inline-block"></span>
              <span>Blocked Transportation Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#35698F] inline-block"></span>
              <span>Relief Shelter Depot</span>
            </div>
          </div>
        </div>

        {/* COMPACT MAP COMMAND SIDE PANEL (1 COL) */}
        <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs flex flex-col font-mono text-xs overflow-hidden h-[650px]">
          <div className="p-3 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#35698F]" />
              <h2 className="font-bold text-[#243447] text-xs uppercase tracking-wide">
                Map Command Panel
              </h2>
            </div>
            <span className="px-1.5 py-0.5 bg-[#DCECF8] text-[#1E425E] font-bold text-[10px] rounded">
              EOC Live
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-4 text-xs">
            {/* ACTIVE INCIDENTS PANEL SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D9E3EC] pb-1">
                <span className="font-bold text-[#C62828] uppercase text-[11px] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#C62828]" />
                  ACTIVE INCIDENTS ({filteredIncidents.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedItem({ type: 'INCIDENT', data: inc })}
                    className="p-2 bg-[#FFEBEE]/60 border border-[#FFCDD2] rounded cursor-pointer hover:bg-[#FFEBEE] transition-colors space-y-1"
                  >
                    <div className="flex justify-between items-start font-bold">
                      <span className="text-[#C62828] text-[11px]">{inc.title}</span>
                      <span className="text-[9px] bg-[#C62828] text-white px-1 rounded uppercase">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B]">{inc.location} • {inc.timeReported}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CRITICAL RISK ZONES SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D9E3EC] pb-1">
                <span className="font-bold text-[#D97706] uppercase text-[11px] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
                  HIGH RISK ZONES ({filteredRiskZones.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {filteredRiskZones.map((rz) => (
                  <div
                    key={rz.id}
                    onClick={() => setSelectedItem({ type: 'RISK_ZONE', data: rz })}
                    className="p-2 bg-[#FFF8E1]/60 border border-[#FFE082] rounded cursor-pointer hover:bg-[#FFF8E1] transition-colors space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#243447] text-[11px]">{rz.name}</span>
                      <span className="text-[10px] font-bold text-[#C62828]">{rz.riskScore}/100</span>
                    </div>
                    <p className="text-[10px] text-[#64748B]">{rz.hazardType} • {rz.populationExposure.toLocaleString()} exposed</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCKED ROUTES SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D9E3EC] pb-1">
                <span className="font-bold text-[#243447] uppercase text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C62828]" />
                  BLOCKED CORRIDORS ({blockedRoutes.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {blockedRoutes.map((br) => (
                  <div
                    key={br.id}
                    onClick={() => setSelectedItem({ type: 'BLOCKED_ROUTE', data: br })}
                    className="p-2 bg-[#F4F8FC] border border-[#D9E3EC] rounded cursor-pointer hover:bg-[#DCECF8] transition-colors space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#243447] text-[11px]">{br.routeName}</span>
                      <span className="text-[9px] bg-[#C62828] text-white px-1 rounded font-bold">BLOCKED</span>
                    </div>
                    <p className="text-[10px] text-[#64748B]">{br.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSPECTION SLIDE-OVER MODAL FOR MAP ELEMENTS */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-mono text-xs border-l border-[#D9E3EC]">
            <div className="p-4 bg-[#243447] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#FFE082]" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  {selectedItem.type.replace('_', ' ')} DETAILS
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {selectedItem.type === 'RISK_ZONE' && (
                <div className="space-y-3">
                  <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-1">
                    <span className="text-[10px] text-[#64748B] font-bold uppercase">Zone Name</span>
                    <p className="font-bold text-[#243447] text-sm">{selectedItem.data.name}</p>
                    <div className="flex space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-[#C62828] text-white font-bold text-[10px] rounded">
                        SCORE: {selectedItem.data.riskScore}/100
                      </span>
                      <span className="px-2 py-0.5 bg-[#FFF8E1] text-[#D97706] border border-[#FFE082] font-bold text-[10px] rounded">
                        {selectedItem.data.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#243447] uppercase border-b border-[#D9E3EC] pb-1">
                      Vulnerability & Exposure Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                      <div>District: <strong className="text-[#243447]">{selectedItem.data.district}</strong></div>
                      <div>Hazard: <strong className="text-[#C62828]">{selectedItem.data.hazardType}</strong></div>
                      <div>Population: <strong className="text-[#243447]">{selectedItem.data.populationExposure.toLocaleString()}</strong></div>
                      <div>Vulnerability: <strong className="text-[#D97706]">{selectedItem.data.vulnerability}</strong></div>
                    </div>
                  </div>

                  <div className="bg-[#FFF8E1] border border-[#FFE082] rounded p-3 text-[11px] text-[#854D0E] space-y-1">
                    <strong className="font-bold uppercase text-[10px] text-[#D97706] block">
                      RECOMMENDED ACTION:
                    </strong>
                    <span>{selectedItem.data.recommendedAction}</span>
                  </div>
                </div>
              )}

              {selectedItem.type === 'INCIDENT' && (
                <div className="space-y-3">
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded p-3 space-y-1">
                    <span className="text-[10px] text-[#C62828] font-bold uppercase">Active Field Incident</span>
                    <p className="font-bold text-[#243447] text-sm">{selectedItem.data.title}</p>
                    <div className="flex space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-[#C62828] text-white font-bold text-[10px] rounded uppercase">
                        {selectedItem.data.severity}
                      </span>
                      <span className="px-2 py-0.5 bg-[#DCECF8] text-[#1E425E] font-bold text-[10px] rounded uppercase">
                        {selectedItem.data.responseStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[#64748B]">
                    <span className="font-bold text-[#243447] block text-xs">Incident Description:</span>
                    <p className="p-2 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-[11px] text-[#243447]">
                      {selectedItem.data.description}
                    </p>
                  </div>

                  <div className="bg-[#DCECF8] border border-[#8DB9D9] rounded p-3 space-y-1">
                    <strong className="font-bold uppercase text-[10px] text-[#1E425E] block">
                      REQUIRED EMERGENCY RESOURCES:
                    </strong>
                    <span className="font-bold text-[#255273]">{selectedItem.data.requiredResources}</span>
                  </div>
                </div>
              )}

              {selectedItem.type === 'BLOCKED_ROUTE' && (
                <div className="space-y-3">
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded p-3 space-y-1">
                    <span className="text-[10px] text-[#C62828] font-bold uppercase">Corridor Obstruction</span>
                    <p className="font-bold text-[#243447] text-sm">{selectedItem.data.routeName}</p>
                    <span className="inline-block px-2 py-0.5 bg-[#C62828] text-white font-bold text-[10px] rounded">
                      STATUS: {selectedItem.data.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[#64748B]">
                    <span className="font-bold text-[#243447] block text-xs">Blockage Reason:</span>
                    <p className="p-2 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-[11px] text-[#243447]">
                      {selectedItem.data.reason}
                    </p>
                  </div>

                  <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded p-3 space-y-1 text-[#2E7D32]">
                    <strong className="font-bold uppercase text-[10px] block">
                      RECOMMENDED ALTERNATIVE ROUTE:
                    </strong>
                    <span className="font-bold">{selectedItem.data.alternativeRoute}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F4F8FC] border-t border-[#D9E3EC] flex justify-between items-center">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#64748B] text-white rounded font-bold hover:bg-[#475569]"
              >
                Close Inspection
              </button>
              <button
                onClick={() => navigate('/matching')}
                className="px-4 py-2 bg-[#35698F] text-white rounded font-bold hover:bg-[#255273] flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-[#FFE082]" />
                <span>Launch Match Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
