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
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canViewAuditLogs, getRoleDisplayName } from '../../utils/permissions';

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
  { name: 'Audit Logs', path: '/audit-logs', icon: History, requiresAuditAccess: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const roleDisplay = getRoleDisplayName(user);

  const visibleNavItems = navItems.filter((item) => {
    if (item.requiresAuditAccess) {
      return canViewAuditLogs(user);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white text-[#243447] flex flex-col justify-between border-r border-[#D9E3EC] shrink-0 font-sans">
      <div>
        {/* Brand Header */}
        <div className="p-4 bg-[#F4F8FC] border-b border-[#D9E3EC]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#B8D8F0] text-[#1E425E] rounded border border-[#8DB9D9]">
              <Shield className="w-5 h-5 text-[#1E425E]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-[#243447] font-mono">
                SAHAYOG
              </h1>
              <p className="text-[11px] text-[#64748B] font-medium tracking-tight">
                Disaster Relief Operations
              </p>
            </div>
          </div>
          <div className="mt-2.5 px-2 py-1 bg-[#DCECF8] border border-[#8DB9D9] rounded text-[10px] font-mono text-[#1E425E] flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
              JWT AUTH
            </span>
            <span className="font-bold text-[#255273]">{roleDisplay}</span>
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
                      ? 'bg-[#DCECF8] text-[#1E425E] border-l-3 border-[#35698F] font-bold shadow-xs'
                      : 'text-[#243447] hover:bg-[#F4F8FC] hover:text-[#1E425E]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#64748B]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 bg-[#F4F8FC] border-t border-[#D9E3EC]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-[#243447] truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#64748B] truncate">{user?.agency_name || 'Command Center'}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DCECF8] text-[#1E425E] rounded border border-[#8DB9D9]">
              {roleDisplay}
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-[#64748B] hover:text-[#C62828] hover:bg-[#F4F8FC] rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
