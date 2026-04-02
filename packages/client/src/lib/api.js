import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000, // ← increased to 20s to survive Render.com cold starts (can take 10-15s)
});

// ── Request interceptor — attach auth token if present ────────────────────────
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('unilo-auth');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // corrupted storage — ignore
  }
  return config;
});

// ── Response interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('unilo-auth');
      window.location.href = '/login';
    }

    // Surface a clean error message for UI error states
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Server may be waking up.' : null) ||
      err.message ||
      'Something went wrong';

    err.displayMessage = message;
    return Promise.reject(err);
  }
);

export default api;
