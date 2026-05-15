import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem("access_token", token);
        document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
        set({ user, token });
      },

      clearAuth: () => {
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "user_role=; path=/; max-age=0";
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
