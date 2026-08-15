import axios from 'axios';

// Development Mode flag - allows seamless frontend operation without requiring backend auth login
export const DEV_MODE = true;

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request interceptor: attach Authorization header ONLY if a real valid token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahayog_access_token');
    if (token && token !== 'mock-dev-jwt-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Mock Data for realistic Command Center display when auth is required
const MOCK_DASHBOARD_SUMMARY = {
  is_demo_fallback: true,
  auth_status: 'HTTP_403_FORBIDDEN',
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

// Centralized API Service Export
export const sahayogApi = {
  // Auth
  login: async (email, password) => {
    if (DEV_MODE) {
      return {
        user: {
          id: 'u1000000-0000-0000-0000-000000000002',
          name: 'State Ops Command Officer',
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

  // Dashboard Summary Endpoint: GET /api/v1/dashboard/summary
  getDashboardSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        console.info(`[Sahayog API] GET /dashboard/summary returned ${status} (Backend Authorization Required). Using dev fallback.`);
      } else {
        console.warn(`[Sahayog API] GET /dashboard/summary request error:`, err.message);
      }
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  // Resources List Endpoint: GET /api/v1/
  getResources: async (params = {}) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET / (Resources) returned ${err.response?.status || 'Network Error'}.`);
      return { items: [], total: 0, page: 1, page_size: 20, is_demo_fallback: true };
    }
  },

  // DISCOVERED POOLED RESOURCES ROUTE: GET /api/v1/pooled
  // (In resources.py: @router.get("/pooled") mounted under prefix="/api/v1")
  getPooledResources: async (params = {}) => {
    try {
      const response = await api.get('/pooled', { params });
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET /pooled returned ${err.response?.status || 'Network Error'}.`);
      return [];
    }
  },

  createResource: async (data) => {
    const response = await api.post('/', data);
    return response.data;
  },

  updateResource: async (id, data) => {
    const response = await api.patch(`/${id}`, data);
    return response.data;
  },

  // Needs Endpoint: GET /api/v1/needs
  getNeeds: async (params = {}) => {
    try {
      const response = await api.get('/needs', { params });
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET /needs returned ${err.response?.status || 'Network Error'}.`);
      return { items: [], total: 0, page: 1, page_size: 20, is_demo_fallback: true };
    }
  },

  getNeed: async (id) => {
    try {
      const response = await api.get(`/needs/${id}`);
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET /needs/${id} returned ${err.response?.status || 'Network Error'}.`);
      return null;
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

  // Matching & Allocations Endpoints
  matchNeed: async (needId) => {
    const response = await api.post(`/allocations/match/${needId}`);
    return response.data;
  },

  getAllocations: async (params = {}) => {
    try {
      const response = await api.get('/allocations', { params });
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET /allocations returned ${err.response?.status || 'Network Error'}.`);
      return { items: [], total: 0, page: 1, page_size: 20, is_demo_fallback: true };
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

  // Notifications Endpoint: GET /api/v1/notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (err) {
      console.info(`[Sahayog API] GET /notifications returned ${err.response?.status || 'Network Error'}.`);
      return { items: [], total: 0, page: 1, page_size: 20, is_demo_fallback: true };
    }
  },
};

export default sahayogApi;
