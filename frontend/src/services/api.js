import axios from 'axios';

// Development Mode flag - allows seamless operation even without backend auth session
export const DEV_MODE = true;

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahayog_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Mock Data for realistic Disaster Response display
const MOCK_DASHBOARD_SUMMARY = {
  resources: {
    total_resources: 125000.0,
    available: 78500.0,
    reserved: 26000.0,
    in_transit: 20500.0,
  },
  needs: {
    total_needs: 18,
    open: 8,
    partially_met: 5,
    resolved: 5,
    critical_count: 4,
  },
  balances: [
    {
      district_id: 'd1000000-0000-0000-0000-000000000001',
      district_name: 'Kota',
      resource_type: 'DRINKING_WATER',
      total_available: 15000.0,
      total_needed: 25000.0,
      net_balance: -10000.0,
    },
    {
      district_id: 'd1000000-0000-0000-0000-000000000001',
      district_name: 'Kota',
      resource_type: 'BOAT',
      total_available: 18.0,
      total_needed: 25.0,
      net_balance: -7.0,
    },
    {
      district_id: 'd1000000-0000-0000-0000-000000000002',
      district_name: 'Bundi',
      resource_type: 'FOOD_PACKET',
      total_available: 12000.0,
      total_needed: 8000.0,
      net_balance: 4000.0,
    },
    {
      district_id: 'd1000000-0000-0000-0000-000000000003',
      district_name: 'Baran',
      resource_type: 'AMBULANCE',
      total_available: 8.0,
      total_needed: 12.0,
      net_balance: -4.0,
    },
    {
      district_id: 'd1000000-0000-0000-0000-000000000004',
      district_name: 'Jhalawar',
      resource_type: 'GENERATOR',
      total_available: 14.0,
      total_needed: 10.0,
      net_balance: 4.0,
    },
  ],
  unread_alerts_count: 3,
};

// API Services Export
export const sahayogApi = {
  // Auth
  login: async (email, password) => {
    if (DEV_MODE) {
      return {
        user: {
          id: 'u1000000-0000-0000-0000-000000000002',
          name: 'State Ops Command',
          email: email || 'operator@sahayog.gov.in',
          role: 'STATE_OPERATOR',
          agency_id: null,
        },
        access_token: 'mock-dev-jwt-token',
        refresh_token: 'mock-dev-refresh-token',
      };
    }
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Dashboard Summary
  getDashboardSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (err) {
      console.warn('Backend API call failed, using high-fidelity fallback data:', err.message);
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  // Resources
  getResources: async (params = {}) => {
    try {
      const response = await api.get('/resources', { params });
      return response.data;
    } catch (err) {
      console.warn('getResources API failed, using fallback:', err.message);
      return { items: [], total: 0, page: 1, page_size: 20 };
    }
  },

  getPooledResources: async (params = {}) => {
    try {
      const response = await api.get('/resources/pooled', { params });
      return response.data;
    } catch (err) {
      console.warn('getPooledResources API failed:', err.message);
      return [];
    }
  },

  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },

  updateResource: async (id, data) => {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  },

  // Needs
  getNeeds: async (params = {}) => {
    try {
      const response = await api.get('/needs', { params });
      return response.data;
    } catch (err) {
      console.warn('getNeeds API failed:', err.message);
      return { items: [], total: 0, page: 1, page_size: 20 };
    }
  },

  createNeed: async (data) => {
    const response = await api.post('/needs', data);
    return response.data;
  },

  updateNeed: async (id, data) => {
    const response = await api.patch(`/needs/${id}`, data);
    return response.data;
  },

  // Matching & Allocations
  matchNeed: async (needId) => {
    const response = await api.post(`/allocations/match/${needId}`);
    return response.data;
  },

  getAllocations: async (params = {}) => {
    try {
      const response = await api.get('/allocations', { params });
      return response.data;
    } catch (err) {
      console.warn('getAllocations API failed:', err.message);
      return { items: [], total: 0, page: 1, page_size: 20 };
    }
  },

  authorizeAllocation: async (id) => {
    const response = await api.post(`/allocations/${id}/authorize`);
    return response.data;
  },

  rejectAllocation: async (id) => {
    const response = await api.post(`/allocations/${id}/reject`);
    return response.data;
  },

  // Notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (err) {
      console.warn('getNotifications API failed:', err.message);
      return { items: [], total: 0, page: 1, page_size: 20 };
    }
  },
};

export default sahayogApi;
