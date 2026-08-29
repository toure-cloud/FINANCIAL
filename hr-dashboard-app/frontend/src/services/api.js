import axios from 'axios';

// URL relative → proxy Vite
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ============================================================
// INTERCEPTEURS
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Requête API:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 Réponse API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      '❌ Erreur réponse:',
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Évite une boucle si on est déjà sur /login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// EXTRACTION DES DONNÉES (listes / pagination DRF)
// ============================================================
/**
 * Extrait un tableau depuis différentes formes de réponse API.
 * - [ ... ]
 * - { results: [ ... ] }          (pagination DRF)
 * - { data: [ ... ] }
 * - { employees: [ ... ] } etc.
 * - { count, next, previous, results }
 */
const extractData = (response) => {
  const raw = response?.data;

  // Log pour debug (à retirer en prod si besoin)
  console.log('🔎 RAW response.data:', raw);

  if (raw == null) return [];

  // Cas 1 : tableau direct
  if (Array.isArray(raw)) {
    return raw;
  }

  // Cas 2 : objet
  if (typeof raw === 'object') {
    // Pagination standard DRF
    if (Array.isArray(raw.results)) {
      return raw.results;
    }
    // Variante { data: [...] }
    if (Array.isArray(raw.data)) {
      return raw.data;
    }
    // Cherche la première propriété qui est un tableau
    for (const key of Object.keys(raw)) {
      if (Array.isArray(raw[key])) {
        console.log(`🔎 Tableau trouvé sous la clé "${key}"`);
        return raw[key];
      }
    }
  }

  console.warn('⚠️ Impossible d’extraire un tableau, retour []');
  return [];
};

// ============================================================
// AUTH
// ============================================================
export const authService = {
  login: (credentials) => api.post('/token/', credentials),
  refresh: (refreshToken) =>
    api.post('/token/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/users/me/'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ============================================================
// EMPLOYÉS
// ============================================================
export const employeeService = {
  getAll: async (params) => {
    console.log('🔍 Appel employeeService.getAll()');
    const response = await api.get('/employees/', { params });
    const data = extractData(response);
    console.log('✅ Employés extraits:', data.length, data);
    // On renvoie un objet compatible axios + data déjà extraite
    return { ...response, data };
  },

  getById: (id) => api.get(`/employees/${id}/`),

  create: (payload) => {
    // Ne pas envoyer id / created_at / updated_at (générés côté backend)
    const {
      id,
      created_at,
      updated_at,
      full_name,
      monthly_cost,
      created_by,
      ...cleanData
    } = payload;
    console.log('📝 Création employé:', cleanData);
    return api.post('/employees/', cleanData);
  },

  update: (id, payload) => {
    const {
      id: _id,
      created_at,
      updated_at,
      full_name,
      monthly_cost,
      created_by,
      ...cleanData
    } = payload;
    console.log(`📝 Mise à jour employé ${id}:`, cleanData);
    return api.put(`/employees/${id}/`, cleanData);
  },

  patch: (id, payload) => {
    const { id: _id, ...cleanData } = payload;
    return api.patch(`/employees/${id}/`, cleanData);
  },

  delete: (id) => api.delete(`/employees/${id}/`),

  getStats: () => api.get('/employees/stats/'),
};

// ============================================================
// FORMATIONS
// ============================================================
export const formationService = {
  getAll: async (params) => {
    console.log('🔍 Appel formationService.getAll()');
    const response = await api.get('/formations/', { params });
    const data = extractData(response);
    console.log('✅ Formations extraites:', data.length, data);
    return { ...response, data };
  },

  getById: (id) => api.get(`/formations/${id}/`),

  create: (payload) => {
    const { id, created_at, updated_at, total_cost, employee_name, ...cleanData } =
      payload;
    return api.post('/formations/', cleanData);
  },

  update: (id, payload) => {
    const {
      id: _id,
      created_at,
      updated_at,
      total_cost,
      employee_name,
      ...cleanData
    } = payload;
    return api.put(`/formations/${id}/`, cleanData);
  },

  delete: (id) => api.delete(`/formations/${id}/`),
};

// ============================================================
// DÉPENSES
// ============================================================
export const depenseService = {
  getAll: async (params) => {
    console.log('🔍 Appel depenseService.getAll()');
    const response = await api.get('/depenses/', { params });
    const data = extractData(response);
    console.log('✅ Dépenses extraites:', data.length, data);
    return { ...response, data };
  },

  getById: (id) => api.get(`/depenses/${id}/`),

  create: (payload) => {
    const {
      id,
      created_at,
      updated_at,
      employee_name,
      categorie_display,
      ...cleanData
    } = payload;
    console.log('📝 Création dépense:', cleanData);
    return api.post('/depenses/', cleanData);
  },

  update: (id, payload) => {
    const {
      id: _id,
      created_at,
      updated_at,
      employee_name,
      categorie_display,
      ...cleanData
    } = payload;
    return api.put(`/depenses/${id}/`, cleanData);
  },

  delete: (id) => api.delete(`/depenses/${id}/`),
};

export default api;