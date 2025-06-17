import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'zen' | 'neon-blue' | 'neon-pink' | 'neon-green' | 'neon-purple' | 'neon-orange' | 'neon-yellow' | 'neon-cyan' | 'neon-red';

interface ThemeState {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'neon-blue',
      isDarkMode: true,
      setTheme: (theme) => set({ theme }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'theme-storage',
    }
  )
);