import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (payload) => {
        const { data } = await api.post('/auth/register', payload);
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
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
    }),
    {
      name: 'unilo-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.hydrate(),
    }
  )
);
