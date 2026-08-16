import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sahayogApi from '../services/api';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('rajesh.kumar@sdma.rajasthan.gov.in');
  const [password, setPassword] = useState('StateOp@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoUsers = [
    { label: 'State Operator', email: 'rajesh.kumar@sdma.rajasthan.gov.in', pass: 'StateOp@123', role: 'STATE_OPERATOR' },
    { label: 'Super Admin', email: 'admin@sahayog.gov.in', pass: 'Admin@123', role: 'SUPER_ADMIN' },
    { label: 'NDRF Admin', email: 'anil.sharma@ndrf.gov.in', pass: 'NdrfAdmin@123', role: 'AGENCY_ADMIN' },
    { label: 'Army Admin', email: 'vikram.singh@army.mil.in', pass: 'ArmyAdmin@123', role: 'AGENCY_ADMIN' },
    { label: 'NGO Admin', email: 'priya.mehta@relieffoundation.org', pass: 'NgoAdmin@123', role: 'AGENCY_ADMIN' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await sahayogApi.login(email, password);
      if (data?.access_token && data?.user) {
        login(data.user, data.access_token, data.refresh_token);
        navigate('/');
      } else {
        setError('Authentication failed. Invalid server response.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : detail?.error?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (u) => {
    setEmail(u.email);
    setPassword(u.pass);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex flex-col justify-center items-center p-4 font-mono text-[#243447]">
      <div className="w-full max-w-md bg-white border border-[#D9E3EC] rounded shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#F4F8FC] border-b border-[#D9E3EC] text-center space-y-1.5 font-sans">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded bg-[#B8D8F0] border border-[#8DB9D9] text-[#1E425E] mb-1">
            <Shield className="w-6 h-6 text-[#1E425E]" />
          </div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-[#243447]">SAHAYOG</h1>
          <p className="text-xs text-[#64748B] font-medium">
            State Emergency Operations Center — Hadoti Disaster Relief
          </p>
          <span className="inline-block px-2.5 py-0.5 bg-[#DCECF8] text-[#1E425E] border border-[#8DB9D9] text-[10px] font-mono font-bold rounded">
            JWT AUTH ACTIVE
          </span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[#64748B] font-bold uppercase block text-[10px]">Official Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sahayog.gov.in"
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-xs text-[#243447] focus:outline-none focus:border-[#35698F] font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[#64748B] font-bold uppercase block text-[10px]">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F4F8FC] border border-[#D9E3EC] rounded text-xs text-[#243447] focus:outline-none focus:border-[#35698F] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#35698F] hover:bg-[#255273] font-bold text-white rounded flex items-center justify-center gap-2 text-xs shadow-2xs transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'ENTER COMMAND CENTER'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFE082]" />
            </button>
          </form>

          {/* Quick Select Demo Credentials */}
          <div className="pt-3 border-t border-[#D9E3EC] space-y-2">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Seeded Demo Accounts (Click to Select):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => selectDemoUser(u)}
                  className={`p-2 rounded border text-left flex flex-col transition-colors ${
                    email === u.email
                      ? 'bg-[#DCECF8] border-[#8DB9D9] text-[#1E425E] font-bold'
                      : 'bg-[#F4F8FC] border-[#D9E3EC] text-[#64748B] hover:text-[#243447]'
                  }`}
                >
                  <span className="text-[#243447] font-bold text-[10px] uppercase">{u.label}</span>
                  <span className="text-[9px] truncate text-[#64748B]">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#F4F8FC] border-t border-[#D9E3EC] text-center text-[10px] text-[#64748B]">
          SAHAYOG Multi-Agency Disaster Relief • State Emergency Operations Center
        </div>
      </div>
    </div>
  );
}
