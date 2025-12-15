import { create } from "zustand";
import { persist } from "zustand/middleware";

// Hardcoded demo credentials
const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (username: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (
          username === DEMO_CREDENTIALS.username &&
          password === DEMO_CREDENTIALS.password
        ) {
          set({
            isAuthenticated: true,
            user: { username },
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        });
      },

      checkAuth: () => {
        const state = useAuth.getState();
        return state.isAuthenticated;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
