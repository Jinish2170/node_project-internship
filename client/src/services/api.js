import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Notices API
export const noticesAPI = {
  getAll: (params = {}) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (noticeData) => api.post('/notices', noticeData),
  update: (id, noticeData) => api.put(`/notices/${id}`, noticeData),
  delete: (id) => api.delete(`/notices/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  unregister: (id) => api.delete(`/events/${id}/register`),
};

// Materials API
export const materialsAPI = {
  getAll: (params = {}) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  upload: (materialData) => {
    const formData = new FormData();
    Object.keys(materialData).forEach(key => {
      if (materialData[key] !== null && materialData[key] !== undefined) {
        formData.append(key, materialData[key]);
      }
    });
    return api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, materialData) => api.put(`/materials/${id}`, materialData),
  delete: (id) => api.delete(`/materials/${id}`),
  download: (id) => {
    return api.get(`/materials/${id}/download`, {
      responseType: 'blob',
    });
  },
  getStats: () => api.get('/materials/stats/overview'),
};

// Resumes API
export const resumesAPI = {
  getAll: (params = {}) => api.get('/resumes', { params }),
  getById: (id) => api.get(`/resumes/${id}`),
  getMy: () => api.get('/resumes/my/list'),
  upload: (resumeData) => {
    const formData = new FormData();
    Object.keys(resumeData).forEach(key => {
      if (resumeData[key] !== null && resumeData[key] !== undefined) {
        if (key === 'skills' && Array.isArray(resumeData[key])) {
          formData.append(key, resumeData[key].join(','));
        } else {
          formData.append(key, resumeData[key]);
        }
      }
    });
    return api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, resumeData) => api.put(`/resumes/${id}`, resumeData),
  updateVisibility: (id, isPublic) => api.put(`/resumes/${id}/visibility`, { isPublic }),
  delete: (id) => api.delete(`/resumes/${id}`),
  download: (id) => {
    return api.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
  },
};

// Utility functions for file downloads
export const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
