import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT Bearer token to requests
apiClient.interceptors.request.use(
  (config) => {
    const sessionStr = localStorage.getItem('ijspast_session_v2');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      } catch (e) {
        console.error('Failed to parse session token from storage:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler to extract server message
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'API Request failed';
    return Promise.reject(new Error(message));
  }
);
