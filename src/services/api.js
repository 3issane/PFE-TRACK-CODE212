import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';


// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for public requests
const axiosPublicInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API request failed:', error);
    throw error;
  }
);

axiosPublicInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API request failed:', error);
    throw error;
  }
);

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const { method = 'GET', data, ...config } = options;
    return await axiosInstance({
      url: endpoint,
      method,
      data,
      ...config
    });
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API request function without authentication (for public endpoints)
export const apiRequestPublic = async (endpoint, options = {}) => {
  try {
    const { method = 'GET', data, ...config } = options;
    return await axiosPublicInstance({
      url: endpoint,
      method,
      data,
      ...config
    });
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  login: async (credentials) => {
    return apiRequestPublic('/auth/login', {
      method: 'POST',
      data: credentials
    });
  },
  
  register: async (userData) => {
    return apiRequestPublic('/auth/register', {
      method: 'POST',
      data: userData
    });
  }
};

// Topics API
const topicsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/topics?${queryString}` : '/topics';
    
    return apiRequest(endpoint);
  },
  
  getAvailable: async () => {
    return apiRequest('/topics/available');
  },
  
  getById: async (id) => {
    return apiRequest(`/topics/${id}`);
  },
  
  create: async (topicData) => {
    return apiRequest('/topics', {
      method: 'POST',
      data: topicData
    });
  },
  
  update: async (id, topicData) => {
    return apiRequest(`/topics/${id}`, {
      method: 'PUT',
      data: topicData
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/topics/${id}`, {
      method: 'DELETE'
    });
  },
  
  apply: async (id, motivation) => {
    return apiRequest(`/topics/${id}/apply`, {
      method: 'POST',
      data: motivation
    });
  },
  
  getMyApplications: async () => {
    return apiRequest('/topics/my-applications');
  }
};

// Reports API
const reportsAPI = {
  getMy: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    
    return apiRequest(endpoint);
  },
  
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports/all?${queryString}` : '/reports/all';
    
    return apiRequest(endpoint);
  },
  
  getById: async (id) => {
    return apiRequest(`/reports/${id}`);
  },
  
  create: async (reportData) => {
    return apiRequest('/reports', {
      method: 'POST',
      data: reportData
    });
  },

  createWithFile: async (formData) => {
    return axiosInstance({
      url: '/reports/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  update: async (id, reportData) => {
    return apiRequest(`/reports/${id}`, {
      method: 'PUT',
      data: reportData
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/reports/${id}`, {
      method: 'DELETE'
    });
  },
  
  uploadFile: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosInstance({
      url: `/reports/${id}/upload`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  downloadFile: async (id) => {
    return axiosInstance({
      url: `/reports/${id}/download`,
      method: 'GET',
      responseType: 'blob'
    });
  },
  
  submit: async (id) => {
    return apiRequest(`/reports/${id}/submit`, {
      method: 'POST'
    });
  }
};

// User API
const userAPI = {
  getProfile: async () => {
    return apiRequest('/users/me');
  },
  
  updateProfile: async (userData) => {
    return apiRequest('/users/me', {
      method: 'PUT',
      data: userData
    });
  }
};

// Grades API
const gradesAPI = {
  getGrades: async (semester = null) => {
    const endpoint = semester ? `/grades?semester=${semester}` : '/grades';
    return apiRequest(endpoint);
  },
  
  getGradeStats: async () => {
    return apiRequest('/grades/stats');
  },
  
  getTranscript: async () => {
    return apiRequest('/grades/transcript');
  },
  
  getUpcomingEvaluations: async () => {
    return apiRequest('/grades/evaluations/upcoming');
  }
};

// HTTP methods for general API usage
const api = {
  get: async (endpoint) => {
    return apiRequest(endpoint, { method: 'GET' });
  },

  post: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      data: data
    });
  },

  put: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      data: data
    });
  },

  delete: async (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  }
};

// Public API object for unauthenticated requests
const publicApi = {
  get: async (endpoint) => {
    return apiRequestPublic(endpoint, { method: 'GET' });
  },

  post: async (endpoint, data) => {
    return apiRequestPublic(endpoint, {
      method: 'POST',
      data: data
    });
  }
};

export default api;

export {
  authAPI,
  topicsAPI,
  reportsAPI,
  userAPI,
  gradesAPI,
  publicApi
};