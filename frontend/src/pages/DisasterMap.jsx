import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
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
  ArrowRight
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DisasterMap() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Kota');

  // Layer Toggles
  const [showNeeds, setShowNeeds] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showAllocations, setShowAllocations] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');

  const districtCentroids = {
    Kota: { lat: 25.2138, lng: 75.8648, status: 'CRITICAL', criticalNeeds: 4, openNeeds: 8, available: 35000, inTransit: 10000, allocations: 4, topShortage: 'DRINKING_WATER (-10,000 L)' },
    Bundi: { lat: 25.4305, lng: 75.6499, status: 'HIGH ALERT', criticalNeeds: 0, openNeeds: 4, available: 22000, inTransit: 4000, allocations: 2, topShortage: 'FOOD_PACKET (Surplus +4,000)' },
    Baran: { lat: 25.1012, lng: 76.5132, status: 'HIGH ALERT', criticalNeeds: 1, openNeeds: 3, available: 12000, inTransit: 3000, allocations: 2, topShortage: 'AMBULANCE (-4 units)' },
    Jhalawar: { lat: 24.5974, lng: 76.1660, status: 'STABLE / SURPLUS', criticalNeeds: 0, openNeeds: 1, available: 18000, inTransit: 2000, allocations: 1, topShortage: 'GENERATOR (Surplus +4)' },
  };

  const mapNeeds = [
    {
      id: 'n-1042-kota-water',
      district: 'Kota',
      resource_type: 'DRINKING_WATER',
      needed: 10000,
      fulfilled: 4000,
      unit: 'liters',
      priority: 'CRITICAL',
      status: 'OPEN',
      lat: 25.2138,
      lng: 75.8648,
    },
    {
      id: 'n-1043-kota-boats',
      district: 'Kota',
      resource_type: 'BOAT',
      needed: 15,
      fulfilled: 5,
      unit: 'units',
      priority: 'CRITICAL',
      status: 'PARTIALLY_MET',
      lat: 25.2250,
      lng: 75.8400,
    },
    {
      id: 'n-1044-baran-amb',
      district: 'Baran',
      resource_type: 'AMBULANCE',
      needed: 6,
      fulfilled: 2,
      unit: 'units',
      priority: 'HIGH',
      status: 'OPEN',
      lat: 25.1012,
      lng: 76.5132,
    },
    {
      id: 'n-1045-bundi-food',
      district: 'Bundi',
      resource_type: 'FOOD_PACKET',
      needed: 5000,
      fulfilled: 5000,
      unit: 'packets',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      lat: 25.4305,
      lng: 75.6499,
    },
  ];

  const mapResources = [
    {
      id: 'res-ndrf-kota',
      agency: 'NDRF Battalion 5',
      district: 'Kota',
      resource_type: 'DRINKING_WATER',
      total: 30000,
      available: 18000,
      reserved: 7000,
      in_transit: 5000,
      unit: 'liters',
      lat: 25.1950,
      lng: 75.8300,
    },
    {
      id: 'res-army-kota',
      agency: 'Indian Army - Jaipur Division',
      district: 'Kota',
      resource_type: 'BOAT',
      total: 15,
      available: 10,
      reserved: 3,
      in_transit: 2,
      unit: 'units',
      lat: 25.2400,
      lng: 75.8800,
    },
    {
      id: 'res-ngo-bundi',
      agency: 'Relief Foundation India (NGO)',
      district: 'Bundi',
      resource_type: 'FOOD_PACKET',
      total: 15000,
      available: 10000,
      reserved: 3000,
      in_transit: 2000,
      unit: 'packets',
      lat: 25.4100,
      lng: 75.6300,
    },
    {
      id: 'res-army-baran',
      agency: 'Indian Army Medical Corps',
      district: 'Baran',
      resource_type: 'AMBULANCE',
      total: 10,
      available: 6,
      reserved: 2,
      in_transit: 2,
      unit: 'units',
      lat: 25.0900,
      lng: 76.4900,
    },
  ];

  const mapAllocations = [
    {
      id: 'alloc-9901',
      from: [25.1950, 75.8300],
      to: [25.2138, 75.8648],
      resource_type: 'DRINKING_WATER',
      quantity: 4000,
      unit: 'liters',
      agency: 'NDRF Battalion 5',
      status: 'IN_TRANSIT',
    },
    {
      id: 'alloc-9902',
      from: [25.2400, 75.8800],
      to: [25.2250, 75.8400],
      resource_type: 'BOAT',
      quantity: 7,
      unit: 'units',
      agency: 'Indian Army',
      status: 'IN_TRANSIT',
    },
  ];

  const filteredNeeds = mapNeeds.filter((n) => {
    const matchesPriority = !priorityFilter || n.priority === priorityFilter;
    const matchesDistrict = !districtFilter || n.district === districtFilter;
    const matchesType = !resourceTypeFilter || n.resource_type === resourceTypeFilter;
    return matchesPriority && matchesDistrict && matchesType;
  });

  const activeDistrictInfo = districtCentroids[selectedDistrict] || districtCentroids['Kota'];

  return (
    <MainLayout title="GIS DISASTER MAP">
      {/* Header Controls */}
      <div className="bg-white border border-[#D9E3EC] rounded p-3 shadow-2xs font-mono text-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D9E3EC] pb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold uppercase tracking-wide text-[#243447]">
              GIS Operational Control Map (Hadoti Sector)
            </h1>
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center space-x-3 bg-[#F4F8FC] p-1.5 rounded border border-[#D9E3EC]">
            <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447]">
              <input
                type="checkbox"
                checked={showNeeds}
                onChange={(e) => setShowNeeds(e.target.checked)}
                className="accent-[#C62828]"
              />
              <span className="text-[#C62828]">● Requisitions</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447]">
              <input
                type="checkbox"
                checked={showResources}
                onChange={(e) => setShowResources(e.target.checked)}
                className="accent-[#2E7D32]"
              />
              <span className="text-[#2E7D32]">● Stock Depots</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-[#243447]">
              <input
                type="checkbox"
                checked={showAllocations}
                onChange={(e) => setShowAllocations(e.target.checked)}
                className="accent-[#35698F]"
              />
              <span className="text-[#35698F]">● Dispatch Routes</span>
            </label>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All District Sectors</option>
            <option value="Kota">Kota Sector</option>
            <option value="Bundi">Bundi Sector</option>
            <option value="Baran">Baran Sector</option>
            <option value="Jhalawar">Jhalawar Sector</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Priority Levels</option>
            <option value="CRITICAL">CRITICAL (≤ 2h)</option>
            <option value="HIGH">HIGH (≤ 6h)</option>
            <option value="MEDIUM">MEDIUM (≤ 24h)</option>
          </select>

          <select
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#D9E3EC] rounded text-xs font-mono bg-white"
          >
            <option value="">All Resource Types</option>
            <option value="DRINKING_WATER">Drinking Water</option>
            <option value="BOAT">Rescue Boats</option>
            <option value="AMBULANCE">Ambulances</option>
            <option value="FOOD_PACKET">Food Packets</option>
          </select>
        </div>
      </div>

      {/* MAP & SIDE INSPECTION PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[580px]">
        {/* LEAFLET MAP CONTAINER (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#D9E3EC] rounded overflow-hidden shadow-2xs relative">
          <MapContainer
            center={[25.2138, 75.8648]}
            zoom={9}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* District Centroid Markers */}
            {Object.entries(districtCentroids).map(([name, data]) => (
              <Marker
                key={name}
                position={[data.lat, data.lng]}
                eventHandlers={{
                  click: () => setSelectedDistrict(name),
                }}
              >
                <Popup className="font-mono text-xs">
                  <div className="space-y-1">
                    <strong className="text-[#243447] font-bold text-sm block">{name} Sector Command</strong>
                    <div className="text-[11px] text-[#64748B]">
                      Status: <span className="font-bold text-[#C62828]">{data.status}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">Open Requisitions: <strong>{data.openNeeds}</strong></div>
                    <div className="text-[11px] text-[#2E7D32] font-bold">Pooled Stock: {data.available.toLocaleString()} units</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Need Requisition Circle Markers */}
            {showNeeds &&
              filteredNeeds.map((need) => (
                <CircleMarker
                  key={need.id}
                  center={[need.lat, need.lng]}
                  radius={10}
                  pathOptions={{
                    color: need.priority === 'CRITICAL' ? '#C62828' : '#D97706',
                    fillColor: need.priority === 'CRITICAL' ? '#C62828' : '#D97706',
                    fillOpacity: 0.8,
                  }}
                >
                  <Popup className="font-mono text-xs">
                    <div>
                      <strong className="text-[#C62828] block">#{need.id} ({need.priority})</strong>
                      <div>Item: <strong>{need.resource_type}</strong></div>
                      <div>Deficit: <strong className="text-[#C62828]">{(need.needed - need.fulfilled).toLocaleString()} {need.unit}</strong></div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            {/* Stock Depot Markers */}
            {showResources &&
              mapResources.map((res) => (
                <CircleMarker
                  key={res.id}
                  center={[res.lat, res.lng]}
                  radius={8}
                  pathOptions={{
                    color: '#2E7D32',
                    fillColor: '#2E7D32',
                    fillOpacity: 0.8,
                  }}
                >
                  <Popup className="font-mono text-xs">
                    <div>
                      <strong className="text-[#2E7D32] block">{res.agency}</strong>
                      <div>Item: {res.resource_type}</div>
                      <div>Available: <strong className="text-[#2E7D32]">{res.available.toLocaleString()} {res.unit}</strong></div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            {/* Allocation Dispatch Movement Lines */}
            {showAllocations &&
              mapAllocations.map((alloc) => (
                <Polyline
                  key={alloc.id}
                  positions={[alloc.from, alloc.to]}
                  pathOptions={{ color: '#35698F', weight: 3, dashArray: '6, 6' }}
                >
                  <Popup className="font-mono text-xs">
                    <div>
                      <strong className="text-[#35698F] block">DISPATCH ROUTE #{alloc.id}</strong>
                      <div>Agency: {alloc.agency}</div>
                      <div>Moving: {alloc.quantity.toLocaleString()} {alloc.unit}</div>
                    </div>
                  </Popup>
                </Polyline>
              ))}
          </MapContainer>
        </div>

        {/* SIDE DISTRICT OPERATIONAL BOARD (1 Col) */}
        <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs p-4 font-mono text-xs flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="border-b border-[#D9E3EC] pb-2">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Selected Operational Sector</span>
              <h2 className="text-base font-bold text-[#243447] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-[#C62828]" /> {selectedDistrict} Sector Command
              </h2>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[10px] font-bold rounded">
                {activeDistrictInfo.status}
              </span>
            </div>

            {/* Sector Stats */}
            <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Critical Requisitions:</span>
                <strong className="text-[#C62828] font-bold">{activeDistrictInfo.criticalNeeds}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total Open Needs:</span>
                <strong className="text-[#243447] font-bold">{activeDistrictInfo.openNeeds}</strong>
              </div>
              <div className="flex justify-between text-[#2E7D32]">
                <span>Available Pooled Stock:</span>
                <strong className="font-bold">{activeDistrictInfo.available.toLocaleString()} units</strong>
              </div>
              <div className="flex justify-between text-[#35698F]">
                <span>In Transit Dispatch:</span>
                <strong className="font-bold">{activeDistrictInfo.inTransit.toLocaleString()} units</strong>
              </div>
            </div>

            <div className="border border-[#FFCDD2] bg-[#FFEBEE]/50 rounded p-3 space-y-1">
              <span className="text-[10px] text-[#C62828] font-bold uppercase flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> SECTOR TOP SHORTAGE:
              </span>
              <p className="font-bold text-[#243447] text-xs">{activeDistrictInfo.topShortage}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9E3EC] space-y-2">
            <button
              onClick={() => navigate(`/matching?district=${encodeURIComponent(selectedDistrict)}`)}
              className="w-full py-2 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-4 h-4 text-[#FFE082]" />
              <span>RUN MATCH FOR {selectedDistrict.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
