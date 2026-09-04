import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Bell, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, unreadAlertsCount = 0 }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="h-13 bg-white border-b border-[#D9E3EC] text-[#243447] px-5 flex items-center justify-between shrink-0 font-sans shadow-2xs">
      {/* Title section */}
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-bold tracking-wide uppercase font-mono text-[#243447] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#35698F]"></span>
          {title}
        </h2>
        {/* Operational Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#FFEBEE] border border-[#FFCDD2] rounded text-[11px] text-[#C62828] font-mono font-bold tracking-tight">
          <Radio className="w-3 h-3 text-[#C62828] animate-pulse" />
          <span>HADOTI FLOOD DISASTER RESPONSE — HIGH ALERT</span>
        </div>
      </div>

      {/* Right control elements */}
      <div className="flex items-center space-x-4 text-xs text-[#64748B] font-mono">
        {/* Notifications Icon Pill */}
        <div
          onClick={() => navigate('/notifications')}
          className="relative cursor-pointer px-2.5 py-1 bg-[#FFF8E1] border border-[#FFE082] rounded hover:bg-[#FFECB3] transition-colors flex items-center gap-1.5 text-[11px] text-[#D97706] font-bold"
          title="Open Operational Alerts Console"
        >
          <Bell className="w-3.5 h-3.5 text-[#D97706]" />
          <span className="hidden sm:inline">ALERTS</span>
          {unreadAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#C62828] text-white text-[10px] font-bold rounded">
              {unreadAlertsCount}
            </span>
          )}
        </div>

        {/* Agency Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#DCECF8] px-2.5 py-1 rounded text-[#1E425E] border border-[#8DB9D9] text-[11px] font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#35698F]" />
          <span>{user?.agency_name || 'Command Center'}</span>
        </div>
      </div>
    </header>
  );
}
