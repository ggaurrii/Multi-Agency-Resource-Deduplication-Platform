import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import ResourcePool from './pages/ResourcePool';
import Needs from './pages/Needs';
import Matching from './pages/Matching';
import Allocations from './pages/Allocations';
import Agencies from './pages/Agencies';
import DisasterMap from './pages/DisasterMap';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/pool" element={<ResourcePool />} />
          <Route path="/resource-pool" element={<ResourcePool />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/allocations" element={<Allocations />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/map" element={<DisasterMap />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
