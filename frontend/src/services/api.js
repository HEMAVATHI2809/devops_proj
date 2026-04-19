import axios from 'axios';

/**
 * Resolve API base URL for dev, Docker, and nginx reverse-proxy setups.
 * - Relative env like "/api" → same origin as the SPA (browser hits nginx → backend).
 * - Absolute env → use as-is.
 * - No env → same-origin "/api" in browser, localhost fallback for SSR/tests.
 */
const resolveApiBaseUrl = () => {
  const env = process.env.REACT_APP_API_URL;
  if (env) {
    if (env.startsWith('/')) {
      return typeof window !== 'undefined' ? `${window.location.origin}${env}` : `http://localhost:5000${env}`;
    }
    return env;
  }
  return typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();
console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor — do NOT redirect on 401 for login/signup (wrong password returns 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthAttempt =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
