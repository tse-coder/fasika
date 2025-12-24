import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken } from "@/api/http";
// import { mockLogin } from "@/mock/api";
import { useBranchStore } from "./branch.store";
import { login } from "@/api/auth.api";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
    branch?: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  updateUser: (data: { name?: string; email?: string }) => void;
}

// Decode JWT token to get user info (simple base64 decode, not verifying signature)
const decodeToken = (
  token: string
): { sub: string; role: "ADMIN" | "USER" } | null => {
  try {
    const payload = token.split(".")[2];// index will be changed to 1 later for the real api
    const decoded = JSON.parse(atob(payload));
    return { sub: decoded.sub, role: decoded.role };
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,

      login: async (email: string, password: string) => {
        try {
          const response = await login({ email, password });
          const token = response.access_token;
          const user = response.user

          setAuthToken(token);
          useBranchStore.getState().setFromUser(user.branch);

          set({
            isAuthenticated: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              branch: user.branch,
            },
          });
          return true;
        } catch (err: any) {
          console.error("Login error:", err);
          return false;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        });
      },

      checkAuth: () => {
        const state = get();
        if (state.token && state.isAuthenticated) {
          // Set token in axios headers in case it was lost
          setAuthToken(state.token);
          return true;
        }
        return false;
      },

      updateUser: (data: { name?: string; email?: string }) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...data },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      // Persist token and user, and derive isAuthenticated from them
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore auth state on rehydrate
        if (state?.token && state?.user) {
          setAuthToken(state.token);
          state.isAuthenticated = true;
        } else {
          setAuthToken(null);
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      },
    }
  )
);
