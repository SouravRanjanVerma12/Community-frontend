import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BASE = 'http://localhost:3000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${BASE}/auth/login`, { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.message ?? 'Login failed.', isLoading: false });
          return false;
        }
      },

      register: async (name, email, password, username) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${BASE}/auth/register`, { name, email, password, username });
          return await get().login(email, password);
        } catch (err) {
          set({ error: err.response?.data?.message ?? 'Registration failed.', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        set({ user: null, accessToken: null, refreshToken: null });
        if (refreshToken) {
          axios.post(`${BASE}/auth/logout`, { refreshToken }).catch(() => {});
        }
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const { data } = await axios.get(`${BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          set({ user: data.user });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      updateFollowing: (followingArray) => {
        set((state) => ({ user: { ...state.user, following: followingArray } }));
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
