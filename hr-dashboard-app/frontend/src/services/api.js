import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Requête API:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log('📥 Réponse API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse:', error.response?.status, error.response?.data);
    
    // Si token expiré, rediriger vers login
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour extraire les données paginées
const extractData = (response) => {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  if (data && data.data && Array.isArray(data.data)) return data.data;
  for (const key in data) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  return [];
};

// Services d'authentification
export const authService = {
  login: (credentials) => api.post('/token/', credentials),
  refresh: (refreshToken) => api.post('/token/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/users/me/'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Services métier
export const employeeService = {
  getAll: async () => {
    console.log('🔍 Appel employeeService.getAll()');
    try {
      const response = await api.get('/employees/');
      const data = extractData(response);
      console.log('✅ Employés extraits:', data.length);
      return { ...response, data };
    } catch (error) {
      console.error('❌ Erreur employeeService.getAll:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.put(`/employees/${id}/`, data),
  patch: (id, data) => api.patch(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
  getStats: () => api.get('/employees/stats/'),
};

export const formationService = {
  getAll: async (params) => {
    console.log('🔍 Appel formationService.getAll()');
    try {
      const response = await api.get('/formations/', { params });
      const data = extractData(response);
      console.log('✅ Formations extraites:', data.length);
      return { ...response, data };
    } catch (error) {
      console.error('❌ Erreur formationService.getAll:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/formations/${id}/`),
  create: (data) => api.post('/formations/', data),
  update: (id, data) => api.put(`/formations/${id}/`, data),
  delete: (id) => api.delete(`/formations/${id}/`),
};

export const depenseService = {
  getAll: async (params) => {
    console.log('🔍 Appel depenseService.getAll()');
    try {
      const response = await api.get('/depenses/', { params });
      const data = extractData(response);
      console.log('✅ Dépenses extraites:', data.length);
      return { ...response, data };
    } catch (error) {
      console.error('❌ Erreur depenseService.getAll:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/depenses/${id}/`),
  create: (data) => api.post('/depenses/', data),
  update: (id, data) => api.put(`/depenses/${id}/`, data),
  delete: (id) => api.delete(`/depenses/${id}/`),
};

export default api;
