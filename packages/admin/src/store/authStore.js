import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const ALLOWED_ROLES = ['head_admin', 'user_admin', 'analyst'];

export const useAdminAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (!ALLOWED_ROLES.includes(data.user.role)) {
          throw new Error('Access denied. Admin accounts only.');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      hydrate: () => {
        const { token } = get();
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
    }),
    {
      name: 'unilo-admin-auth',
      onRehydrateStorage: () => (state) => state?.hydrate(),
    }
  )
);
