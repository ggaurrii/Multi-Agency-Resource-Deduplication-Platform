import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canViewAuditLogs } from './utils/permissions';

import Login from './pages/Login';
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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-white text-xs">
        AUTHENTICATING SESSION...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, checkPermission }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (checkPermission && !checkPermission(user)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Operational Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/pool" element={<ProtectedRoute><ResourcePool /></ProtectedRoute>} />
          <Route path="/resource-pool" element={<ProtectedRoute><ResourcePool /></ProtectedRoute>} />
          <Route path="/needs" element={<ProtectedRoute><Needs /></ProtectedRoute>} />
          <Route path="/matching" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
          <Route path="/allocations" element={<ProtectedRoute><Allocations /></ProtectedRoute>} />
          <Route path="/agencies" element={<ProtectedRoute><Agencies /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><DisasterMap /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<RoleProtectedRoute checkPermission={canViewAuditLogs}><AuditLogs /></RoleProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
