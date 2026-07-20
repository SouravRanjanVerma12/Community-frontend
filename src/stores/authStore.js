import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_URL } from '../config';
import api from '../api/axiosInstance';
import { getCachedFcmToken, clearCachedFcmToken } from '../firebase/messaging';
import { openLinkedinPopup } from '../api/linkedinPopup';

const BASE = `${API_URL}/api`;

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

      loginWithLinkedin: async () => {
        set({ isLoading: true, error: null });
        try {
          const payload = await openLinkedinPopup(API_URL);
          set({
            user: payload.user,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            isLoading: false,
          });
          return true;
        } catch (err) {
          if (err.message === 'Popup closed by user') {
            set({ isLoading: false });
            return false;
          }
          set({ error: err.response?.data?.message ?? err.message ?? 'LinkedIn sign-in failed.', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        const fcmToken = getCachedFcmToken();
        if (fcmToken) {
          // Must fire before clearing accessToken below — the endpoint requires auth.
          api.delete('/users/fcm-token', { data: { token: fcmToken } }).catch(() => {});
          clearCachedFcmToken();
        }
        set({ user: null, accessToken: null, refreshToken: null });
        if (refreshToken) {
          axios.post(`${BASE}/auth/logout`, { refreshToken }).catch(() => {});
        }
      },

      // Uses the shared `api` instance (not raw axios) so an expired access
      // token transparently refreshes via the response interceptor instead
      // of immediately logging the user out.
      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const { data } = await api.get('/users/profile');
          set({ user: data.user });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      updateFollowing: (followingArray) => {
        set((state) => ({ user: { ...state.user, following: followingArray } }));
      },

      setUser: (user) => set({ user }),
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
