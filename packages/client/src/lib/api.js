import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('unilo-auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('unilo-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
