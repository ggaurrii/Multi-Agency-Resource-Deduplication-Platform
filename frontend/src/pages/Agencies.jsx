import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Building2, Shield, Phone, Mail, MapPin, Boxes, CheckCircle2 } from 'lucide-react';

const agencies = [
  {
    name: 'NDRF 6th Battalion',
    type: 'NDRF',
    headquarters: 'Kota Sector HQ',
    contact: '+91 744 2450191',
    email: 'kota.ndrf@gov.in',
    resources_contributed: 35,
    active_allocations: 4,
    status: 'ACTIVE_DEPLOYMENT',
  },
  {
    name: 'Indian Army 61st Armoured Bn',
    type: 'ARMY',
    headquarters: 'Kota Military Station',
    contact: '+91 744 2451000',
    email: 'hadoti.army@nic.in',
    resources_contributed: 28,
    active_allocations: 3,
    status: 'ACTIVE_DEPLOYMENT',
  },
  {
    name: 'SDRF Rajasthan Unit 4',
    type: 'SDRF',
    headquarters: 'Jaipur / Bundi Forward Post',
    contact: '+91 141 2700300',
    email: 'sdrf.hadoti@rajasthan.gov.in',
    resources_contributed: 20,
    active_allocations: 2,
    status: 'READY_STANDBY',
  },
  {
    name: 'Sahayata NGO Relief Federation',
    type: 'NGO',
    headquarters: 'Bundi Operations Base',
    contact: '+91 98290 12345',
    email: 'relief@sahayata-ngo.org',
    resources_contributed: 15,
    active_allocations: 2,
    status: 'ACTIVE_DEPLOYMENT',
  },
  {
    name: 'State Disaster Management Authority',
    type: 'STATE_AUTHORITY',
    headquarters: 'State Control Room, Jaipur',
    contact: '+91 141 2227200',
    email: 'sdoc@rajasthan.gov.in',
    resources_contributed: 50,
    active_allocations: 8,
    status: 'COMMAND_CENTER',
  },
];

export default function Agencies() {
  return (
    <MainLayout title="Participating Relief Agencies">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
        <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
          Multi-Agency Relief Force Directory
        </h1>
        <p className="text-xs text-slate-500">
          Participating defense, state authority, and accredited non-governmental agencies
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-md shadow-sm p-5 space-y-3 font-mono">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-900 text-amber-400 rounded">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{agency.name}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-300">
                    {agency.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-2.5">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{agency.headquarters}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{agency.contact}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{agency.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 text-[10px]">Contributed:</span>
                <p className="font-bold text-slate-900">{agency.resources_contributed} Items</p>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-slate-500 text-[10px]">Active Match:</span>
                <p className="font-bold text-blue-900">{agency.active_allocations} Allocations</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
