import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, Bell, Clock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, unreadAlertsCount = 0 }) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-white px-6 flex items-center justify-between shrink-0 shadow-md">
      {/* Title section */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold tracking-wide uppercase font-mono text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          {title}
        </h2>
        {/* Operational Status Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-rose-950/80 border border-rose-800/80 rounded-full text-xs text-rose-200 font-mono tracking-tight shadow-inner">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>STATUS: HIGH ALERT — HADOTI REGION FLOOD RELIEF</span>
        </div>
      </div>

      {/* Right control elements */}
      <div className="flex items-center space-x-6 text-xs text-slate-300 font-mono">
        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeStr || 'LIVE UTC/IST'}</span>
        </div>

        {/* Notifications Icon Pill */}
        <div className="relative cursor-pointer p-1.5 hover:bg-slate-800 rounded transition-colors" title="Alerts Center">
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full border border-slate-900">
              {unreadAlertsCount}
            </span>
          )}
        </div>

        {/* Agency Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded text-slate-200 border border-slate-700">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{user?.agency_name || 'SDOC Command'}</span>
        </div>
      </div>
    </header>
  );
}
