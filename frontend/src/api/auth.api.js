import api from './axios';

/**
 * Auth API functions
 * Maps to backend: /api/v1/auth/*
 */
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  updateProfile: (data) => api.put('/auth/profile', data),
};
