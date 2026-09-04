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
  ShieldAlert,
  Activity,
  Wrench,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canViewAuditLogs, getRoleDisplayName, getCommandHeader } from '../../utils/permissions';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Risk Intelligence', path: '/risk-mitigation', icon: ShieldAlert },
  { name: 'Field Reports', path: '/field-reports', icon: Activity },
  { name: 'Post-Disaster Recovery', path: '/post-disaster', icon: Wrench },
  { name: 'Disaster Map', path: '/map', icon: Map },
  { name: 'Needs & Requisitions', path: '/needs', icon: FileQuestion },
  { name: 'Resource Inventory', path: '/resources', icon: Boxes },
  { name: 'Resource Pool', path: '/pool', icon: Layers },
  { name: 'Match Engine', path: '/matching', icon: GitMerge },
  { name: 'Allocations Board', path: '/allocations', icon: Truck },
  { name: 'Agencies', path: '/agencies', icon: Building2 },
  { name: 'Disaster Alerts', path: '/notifications', icon: Bell },
  { name: 'Audit Logs', path: '/audit-logs', icon: History, requiresAuditAccess: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const roleDisplay = getRoleDisplayName(user);
  const commandHeader = getCommandHeader(user);

  const visibleNavItems = navItems.filter((item) => {
    if (item.requiresAuditAccess) {
      return canViewAuditLogs(user);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white text-[#243447] flex flex-col justify-between border-r border-[#D7E2EA] shrink-0 font-sans shadow-2xs">
      <div>
        {/* Brand Header */}
        <div className="p-4 bg-[#EEF5FA] border-b border-[#D7E2EA]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white text-[#2F6F95] rounded border border-[#D7E2EA] shadow-2xs">
              <Shield className="w-5 h-5 text-[#2F6F95]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-[#243447] font-mono">
                SAHAYOG
              </h1>
              <p className="text-[10px] text-[#2F6F95] font-bold tracking-tight uppercase">
                {commandHeader.title}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#DCECF7] text-[#2F6F95] border-l-3 border-[#2F6F95] font-bold shadow-2xs'
                      : 'text-[#5B6B7A] hover:bg-[#EEF5FA] hover:text-[#243447]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#5B6B7A]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 bg-[#EEF5FA] border-t border-[#D7E2EA]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-[#243447] truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#5B6B7A] truncate">{user?.agency_name || 'Command Center'}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-[#2F6F95] rounded border border-[#D7E2EA]">
              {roleDisplay}
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-[#5B6B7A] hover:text-[#C62828] hover:bg-white rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
