import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  FileQuestion,
  GitMerge,
  Truck,
  Building2,
  Map,
  Bell,
  History,
  Shield,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Resources', path: '/resources', icon: Boxes },
  { name: 'Resource Pool', path: '/pool', icon: Layers },
  { name: 'Needs', path: '/needs', icon: FileQuestion },
  { name: 'Matching Engine', path: '/matching', icon: GitMerge },
  { name: 'Allocations', path: '/allocations', icon: Truck },
  { name: 'Agencies', path: '/agencies', icon: Building2 },
  { name: 'Disaster Map', path: '/map', icon: Map },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Audit Logs', path: '/audit-logs', icon: History },
];

export default function Sidebar() {
  const { user, devMode, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/80 text-blue-300 rounded border border-blue-700/50 shadow-inner">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white font-mono flex items-center gap-2">
                SAHAYOG
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                Multi-Agency Relief Coordination
              </p>
            </div>
          </div>
          {devMode && (
            <div className="mt-2.5 px-2 py-0.5 bg-amber-950/80 border border-amber-800/60 rounded text-[10px] font-mono text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                DEV AUTH MODE
              </span>
              <span className="text-amber-400 font-bold">STATE_OPERATOR</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-900/70 text-white border-l-4 border-amber-400 font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.agency_name || 'SDOC Command'}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-950 text-blue-300 rounded border border-blue-800">
              {user?.role || 'STATE_OPERATOR'}
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
