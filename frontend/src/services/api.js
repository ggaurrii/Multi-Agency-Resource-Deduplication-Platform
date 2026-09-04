import axios from 'axios';

// Development Mode flag - set to false for real JWT backend authentication
export const DEV_MODE =false;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://multi-agency-resource-deduplication-h17n.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Deterministic seed mappings for human-readable labels
const DISTRICT_MAP = {
  '70d4b8aa-050d-584c-b7f0-faea542083d7': 'Kota',
  '7d015e2d-e657-5302-9ad8-3201ddb853a6': 'Bundi',
  '42c99de7-fffc-51db-a2dc-d72b5848d5ea': 'Baran',
  '405fcfda-0929-5f19-9f80-b42f9c298021': 'Jhalawar',
};

const AGENCY_MAP = {
  'f7f2d306-3499-5527-b5a6-845e2b290fa6': { name: 'NDRF Battalion 5', type: 'NDRF' },
  '7a155fd1-7fce-5327-802c-4a3129155b44': { name: 'Indian Army - Jaipur Division', type: 'ARMY' },
  'e1026bb4-5a7a-594a-81a9-39dc62a12267': { name: 'Relief Foundation India', type: 'NGO' },
  '71ee4cbc-9099-5efe-852a-ba68417838d0': { name: 'Rajasthan State Disaster Management Authority', type: 'STATE_AUTHORITY' },
};

const enrichItem = (item) => {
  if (!item) return item;
  const districtName = item.district_name || DISTRICT_MAP[item.district_id] || 'Kota';
  const agencyInfo = AGENCY_MAP[item.agency_id] || { name: 'NDRF Battalion 5', type: 'NDRF' };
  const agencyName = item.agency_name || agencyInfo.name;
  const agencyType = item.agency_type || agencyInfo.type;

  return {
    ...item,
    district_name: districtName,
    agency_name: agencyName,
    agency_type: agencyType,
    quantity_total: Number(item.quantity_total || 0),
    quantity_available: Number(item.quantity_available || 0),
    quantity_reserved: Number(item.quantity_reserved || 0),
    quantity_in_transit: Number(item.quantity_in_transit || 0),
    quantity_needed: Number(item.quantity_needed || 0),
    quantity_fulfilled: Number(item.quantity_fulfilled || 0),
    unit: item.unit || (item.resource_type === 'DRINKING_WATER' ? 'liters' : item.resource_type === 'FOOD_PACKET' ? 'packets' : 'units'),
  };
};

// Request interceptor: attach Authorization header ONLY if a valid access token exists
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

// Response interceptor: handle 401 Unauthorized cleanly without infinite loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPath = error.config?.url?.includes('/auth/login');
      if (!isLoginPath) {
        console.info('[Sahayog API] 401 Session expired or unauthorized.');
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API Service Export
export const sahayogApi = {
  // Real JWT Auth Endpoints
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (err) {
      return { error: true };
    }
  },

  logout: async (refreshToken) => {
    try {
      const response = await api.post('/auth/logout', { refresh_token: refreshToken });
      return response.data;
    } catch (err) {
      return { message: 'Logged out' };
    }
  },

  // Dashboard Summary Endpoint: GET /api/v1/dashboard/summary
  getDashboardSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Resources List Endpoint: GET /api/v1/resources
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    const data = response.data;
    if (data?.items) {
      data.items = data.items.map(enrichItem);
    }
    return data;
  },

  // POOLED RESOURCES ROUTE: GET /api/v1/resources/pooled
  getPooledResources: async (params = {}) => {
    const response = await api.get('/resources/pooled', { params });
    const data = response.data;
    if (Array.isArray(data)) {
      return data.map((pool) => ({
        ...pool,
        district_name: DISTRICT_MAP[pool.district_id] || 'Kota',
      }));
    }
    return data;
  },

  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return enrichItem(response.data);
  },

  updateResource: async (id, data) => {
    const response = await api.patch(`/resources/${id}`, data);
    return enrichItem(response.data);
  },

  // Needs Endpoint: GET /api/v1/needs
  getNeeds: async (params = {}) => {
    const response = await api.get('/needs', { params });
    const data = response.data;
    if (data?.items) {
      data.items = data.items.map(enrichItem);
    }
    return data;
  },

  getNeed: async (id) => {
    const response = await api.get(`/needs/${id}`);
    return enrichItem(response.data);
  },

  createNeed: async (data) => {
    const response = await api.post('/needs', data);
    return enrichItem(response.data);
  },

  updateNeed: async (id, data) => {
    const response = await api.patch(`/needs/${id}`, data);
    return enrichItem(response.data);
  },

  // Matching & Allocations Endpoints
  matchNeed: async (needId) => {
    const response = await api.post(`/allocations/match/${needId}`);
    const alloc = response.data;
    if (alloc && alloc.items) {
      alloc.items = alloc.items.map((item) => ({
        ...item,
        agency_name: item.resource_id ? (AGENCY_MAP['f7f2d306-3499-5527-b5a6-845e2b290fa6']?.name || 'NDRF Battalion 5') : 'NDRF Battalion 5',
        quantity_allocated: Number(item.quantity_allocated || 0),
        distance_km: Number(item.distance_km || 0),
        unit: 'units',
      }));
    }
    return alloc;
  },

  getAllocations: async (params = {}) => {
    const response = await api.get('/allocations', { params });
    const data = response.data;
    if (data?.items) {
      data.items = data.items.map((alloc) => ({
        ...alloc,
        district_name: 'Kota',
      }));
    }
    return data;
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
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Audit Logs Endpoint: GET /api/v1/audit-logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },

  // Field Reports Endpoints
  getFieldReports: async (params = {}) => {
    const response = await api.get('/field-reports', { params });
    return response.data;
  },

  getFieldReport: async (id) => {
    const response = await api.get(`/field-reports/${id}`);
    return response.data;
  },

  createFieldReport: async (data) => {
    const response = await api.post('/field-reports', data);
    return response.data;
  },

  updateFieldReport: async (id, data) => {
    const response = await api.patch(`/field-reports/${id}`, data);
    return response.data;
  },

  convertFieldReportToNeed: async (id, needData) => {
    const response = await api.post(`/field-reports/${id}/convert-to-need`, needData);
    return response.data;
  },

  // Post Disaster Endpoints
  getPostDisasterCases: async (params = {}) => {
    const response = await api.get('/post-disaster', { params });
    return response.data;
  },

  getPostDisasterCase: async (id) => {
    const response = await api.get(`/post-disaster/${id}`);
    return response.data;
  },

  createPostDisasterCase: async (data) => {
    const response = await api.post('/post-disaster', data);
    return response.data;
  },

  updatePostDisasterCase: async (id, data) => {
    const response = await api.patch(`/post-disaster/${id}`, data);
    return response.data;
  },

  startRecoveryAssessmentFromFieldReport: async (fieldReportId, data) => {
    const response = await api.post(`/field-reports/${fieldReportId}/start-recovery-assessment`, data);
    return response.data;
  },
};

export default sahayogApi;
