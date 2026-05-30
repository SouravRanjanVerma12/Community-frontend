import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark' | 'system'
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: 'theme-pref',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
