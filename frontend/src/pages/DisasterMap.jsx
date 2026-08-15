import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Navigation, AlertTriangle, Shield, Eye } from 'lucide-react';

const districts = [
  { name: 'Kota', status: 'CRITICAL', color: 'bg-rose-600', text: 'Water Deficit: 4,500 L | Needs: 8', lat: '25.2138° N', lng: '75.8648° E' },
  { name: 'Bundi', status: 'HIGH ALERT', color: 'bg-amber-600', text: 'Food Surplus: +4,000 Pkt | Needs: 4', lat: '25.4415° N', lng: '75.6469° E' },
  { name: 'Baran', status: 'HIGH ALERT', color: 'bg-amber-600', text: 'Ambulance Deficit: -4 | Needs: 3', lat: '25.1011° N', lng: '76.5132° E' },
  { name: 'Jhalawar', status: 'STABLE', color: 'bg-emerald-600', text: 'Generators Surplus: +4 | Needs: 1', lat: '24.5969° N', lng: '76.1601° E' },
];

export default function DisasterMap() {
  return (
    <MainLayout title="Rajasthan Hadoti Sector Operational Map">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
            PostGIS Hadoti Sector GIS Command Map
          </h1>
          <p className="text-xs text-slate-500">
            Real-time sector severity heat levels and resource vector movements (Kota, Bundi, Baran, Jhalawar)
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-600"></span> Critical</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-600"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Stable</span>
        </div>
      </div>

      {/* Map Interactive Prototype Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-6 shadow-md text-white font-mono space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold text-slate-100">HADOTI BASIN GEOSPATIAL VECTOR OVERLAY</span>
          </div>
          <span className="text-xs text-slate-400">SRID: EPSG:4326 (WGS84)</span>
        </div>

        {/* Vector Grid Container */}
        <div className="h-96 bg-slate-950 border border-slate-800 rounded relative overflow-hidden flex items-center justify-center p-6">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Sector Polygon Representations */}
          <div className="relative w-full h-full flex items-center justify-around">
            {districts.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center group cursor-pointer">
                <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-md shadow-lg text-center space-y-1 hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-center space-x-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${d.color} animate-pulse`}></span>
                    <span className="text-xs font-bold text-white uppercase">{d.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{d.lat}, {d.lng}</p>
                  <div className="pt-1 text-[11px] font-bold text-amber-300 border-t border-slate-800">
                    {d.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-400 flex justify-between items-center">
          <span>📍 Spatial indexing: GeoAlchemy2 Geography Point & Polygon boundary tables</span>
          <span className="text-blue-400 font-bold">READY FOR LIVE TILE CONNECTIVITY</span>
        </div>
      </div>
    </MainLayout>
  );
}
