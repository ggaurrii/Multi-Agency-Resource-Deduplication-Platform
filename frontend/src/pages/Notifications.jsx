import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import sahayogApi from '../services/api';
import { Bell, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      const data = await sahayogApi.getNotifications();
      setNotifications(data.items || []);
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const mockNotifs = [
    { id: '1', type: 'SHORTAGE_ALERT', severity: 'CRITICAL', message: 'Critical water shortage reported in Kota Sector 4 (Deficit: 4,500 L)', created_at: '2026-08-15T22:30:00Z' },
    { id: '2', type: 'FORECAST_ALERT', severity: 'HIGH', message: 'Baran sector predicted to deplete ambulance stock in < 6.0 hours', created_at: '2026-08-15T21:15:00Z' },
    { id: '3', type: 'DUPLICATE_DEPLOYMENT', severity: 'MEDIUM', message: 'Potential double allocation avoided for NDRF Boat Unit #B-12', created_at: '2026-08-15T20:00:00Z' },
  ];

  const itemsToDisplay = notifications.length > 0 ? notifications : mockNotifs;

  return (
    <MainLayout title="System Alerts & Notifications">
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
        <h1 className="text-lg font-bold font-mono text-slate-900 uppercase">
          Command Notification Log
        </h1>
        <p className="text-xs text-slate-500">
          Automated alert triggers for critical shortages, depletion forecasting, and deployment warnings
        </p>
      </div>

      <div className="space-y-3">
        {itemsToDisplay.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex items-start space-x-3 font-mono">
            <div className={`p-2 rounded ${item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.type}</span>
                <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-700 mt-1">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
