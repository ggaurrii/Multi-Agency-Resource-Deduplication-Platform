import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children, title, unreadAlertsCount }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F8FC] font-sans antialiased text-[#243447]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} unreadAlertsCount={unreadAlertsCount} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F4F8FC]">
          <div className="max-w-7xl mx-auto space-y-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
