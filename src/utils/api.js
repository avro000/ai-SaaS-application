import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexusai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // Don't intercept 401s from login or register endpoints
    if (
      error.response?.status === 401 && 
      !originalRequest.url.includes('/auth/login') && 
      !originalRequest.url.includes('/auth/register')
    ) {
      localStorage.removeItem('nexusai_token');
      localStorage.removeItem('nexusai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
