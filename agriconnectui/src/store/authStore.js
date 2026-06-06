import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },
    }),
    {
      name: "agriconnect-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
