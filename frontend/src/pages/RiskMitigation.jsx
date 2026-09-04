import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import {
  ShieldAlert,
  AlertOctagon,
  ArrowUpRight,
  MapPin,
  Activity,
  Compass,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Users,
  Shield,
  Layers
} from 'lucide-react';
import {
  districtRiskProfiles,
  disasterAlerts,
  riskZones
} from '../data/disasterMockData';

export default function RiskMitigation() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('dist-kota');

  const activeProfile = districtRiskProfiles.find((d) => d.id === selectedDistrict) || districtRiskProfiles[0];

  const getRiskBadge = (level) => {
    switch (level) {
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

  return (
    <MainLayout title="PRE-DISASTER RISK INTELLIGENCE & DECISION SUPPORT">
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#D9E3EC] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#35698F]" />
            <h1 className="text-base font-bold tracking-wide uppercase font-mono text-[#243447]">
              Pre-Disaster Risk Mitigation & Early Warning Engine
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#DCECF8] text-[#1E425E] rounded border border-[#8DB9D9]">
              DECISION SUPPORT
            </span>
          </div>

        </div>

        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] border border-[#255273] rounded text-xs font-bold text-white shadow-2xs transition-colors"
          >
            <Compass className="w-4 h-4 text-[#FFE082]" />
            <span>View Risk Map</span>
          </button>
        </div>
      </div>



      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
        {/* DISTRICT RISK RANKING LIST (1 COL) */}
        <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs flex flex-col">
          <div className="p-3 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
            <h2 className="font-bold text-[#243447] text-xs uppercase tracking-wide">
              District Risk Priority Ranking
            </h2>
            <span className="text-[10px] text-[#64748B]">Sorted by Risk Score</span>
          </div>

          <div className="p-3 space-y-2 flex-1 overflow-y-auto">
            {districtRiskProfiles.map((dist) => {
              const isSelected = dist.id === selectedDistrict;
              return (
                <div
                  key={dist.id}
                  onClick={() => setSelectedDistrict(dist.id)}
                  className={`p-3 rounded border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#DCECF8] border-[#35698F] shadow-xs'
                      : 'bg-white border-[#D9E3EC] hover:bg-[#F4F8FC]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#35698F]" />
                        <span className="font-bold text-[#243447] text-xs">{dist.location}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">{dist.mainHazard}</span>
                    </div>

                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 text-[9px] rounded ${getRiskBadge(dist.riskLevel)}`}>
                        {dist.riskLevel}
                      </span>
                      <div className="mt-1 font-bold text-[#243447] text-sm">
                        {dist.riskScore}<span className="text-[10px] text-[#64748B]">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#D9E3EC]">
                    <span>Exposed Population: <strong className="text-[#243447]">{dist.affectedPopulation.toLocaleString()}</strong></span>
                    <span className="text-[#35698F] font-bold flex items-center gap-0.5">
                      Inspect Breakdown <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED RISK INTELLIGENCE & ADVISORY PANEL (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          {/* PROFILE SUMMARY CARD */}
          <div className="bg-white border border-[#D9E3EC] rounded p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E3EC] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase">SELECTED SECTOR ASSESSMENT</span>
                <h2 className="text-base font-bold text-[#243447]">{activeProfile.location}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs rounded ${getRiskBadge(activeProfile.riskLevel)}`}>
                  {activeProfile.riskLevel} RISK PROFILE
                </span>
                <div className="px-3 py-1 bg-[#243447] text-white rounded font-bold text-sm">
                  SCORE: {activeProfile.riskScore}/100
                </div>
              </div>
            </div>

            {/* FACTOR SCORING MODEL BREAKDOWN */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#243447] uppercase">
                Transparent Multi-Factor Risk Calculation Engine:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 text-center space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Hazard Severity</span>
                  <span className="text-xl font-bold text-[#C62828]">{activeProfile.factors.hazardSeverity}</span>
                  <span className="text-[9px] text-[#64748B] block">Water level & rainfall</span>
                </div>

                <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 text-center space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Population Exposure</span>
                  <span className="text-xl font-bold text-[#D97706]">{activeProfile.factors.populationExposure}</span>
                  <span className="text-[9px] text-[#64748B] block">Density & low-lying shelters</span>
                </div>

                <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 text-center space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Infrastructure Exposure</span>
                  <span className="text-xl font-bold text-[#35698F]">{activeProfile.factors.infrastructureRisk}</span>
                  <span className="text-[9px] text-[#64748B] block">Power grid & bridge vulnerability</span>
                </div>

                <div className="bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3 text-center space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Time-to-Impact</span>
                  <span className="text-xl font-bold text-[#C62828]">{activeProfile.factors.timeToImpact}</span>
                  <span className="text-[9px] text-[#64748B] block">Hydrographic surge velocity</span>
                </div>
              </div>
            </div>

            {/* VULNERABILITY INDICATORS */}
            <div className="space-y-1 bg-[#F4F8FC] border border-[#D9E3EC] rounded p-3">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Sector Vulnerability Analysis:</span>
              <p className="text-xs text-[#243447] font-semibold">{activeProfile.vulnerability}</p>
            </div>

            {/* EARLY WARNING & DECISION SUPPORT ACTION CARD */}
            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded p-4 space-y-2 text-[#854D0E]">
              <div className="flex items-center space-x-2 text-[#D97706]">
                <Zap className="w-4 h-4 fill-current" />
                <h3 className="font-bold uppercase text-xs">EARLY WARNING & RECOMMENDED DECISION ACTION</h3>
              </div>
              <p className="text-xs font-bold text-[#243447] leading-relaxed">
                {activeProfile.recommendedAction}
              </p>
              <div className="pt-2 border-t border-[#FFE082]/60 flex justify-end">
                <button
                  onClick={() => navigate('/matching')}
                  className="px-3.5 py-1.5 bg-[#35698F] hover:bg-[#255273] text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-[#FFE082]" />
                  <span>Execute Resource Pre-Positioning</span>
                </button>
              </div>
            </div>
          </div>

          {/* EARLY WARNING ADVISORIES TABLE */}
          <div className="bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden">
            <div className="p-3 bg-[#F4F8FC] border-b border-[#D9E3EC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-bold text-[#243447] text-xs uppercase">
                  Active Pre-Disaster Early Warnings & Bulletins
                </h3>
              </div>
            </div>

            <div className="divide-y divide-[#D9E3EC]">
              {disasterAlerts.map((alt) => (
                <div key={alt.id} className="p-3 hover:bg-[#F4F8FC] transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#243447] text-xs">{alt.title}</span>
                    <span className="px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] font-bold text-[9px] rounded uppercase">
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">{alt.location} • {alt.timestamp}</p>
                  <div className="text-[10px] text-[#255273] font-semibold bg-[#DCECF8]/60 p-1.5 rounded mt-1">
                    Action: {alt.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
