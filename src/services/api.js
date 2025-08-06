const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API request function without authentication (for public endpoints)
export const apiRequestPublic = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
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
      body: JSON.stringify(credentials)
    });
  },
  
  register: async (userData) => {
    return apiRequestPublic('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
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
      body: JSON.stringify(topicData)
    });
  },
  
  update: async (id, topicData) => {
    return apiRequest(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData)
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
      body: JSON.stringify(motivation)
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
      body: JSON.stringify(reportData)
    });
  },

  createWithFile: async (formData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/reports/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData
    });
  },
  
  update: async (id, reportData) => {
    return apiRequest(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
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
    
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/reports/${id}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
  },
  
  downloadFile: async (id) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/reports/${id}/download`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
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
    return apiRequest('/user/profile');
  },
  
  updateProfile: async (userData) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
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
      body: JSON.stringify(data)
    });
  },

  put: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
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
      body: JSON.stringify(data)
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