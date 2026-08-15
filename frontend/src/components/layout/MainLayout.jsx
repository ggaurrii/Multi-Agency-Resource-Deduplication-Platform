import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children, title, unreadAlertsCount }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} unreadAlertsCount={unreadAlertsCount} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
