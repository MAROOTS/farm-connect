import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const newVal = !get().isDark
        set({ isDark: newVal })
        if (newVal) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initTheme: () => {
        if (get().isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    }),
    {
      name: 'agriconnect-theme',
      partialize: (state) => ({ isDark: state.isDark }),
    }
  )
)
