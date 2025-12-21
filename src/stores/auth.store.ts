import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { login as loginAPI } from "@/api/auth.api";
import { setAuthToken } from "@/api/http";
import { login } from "@/mock/auth.mock";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
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

          // Decode token to get user info
          // const decoded = decodeToken(token); 
          // if (!decoded) { 
          //   return false;
          // }

          // Set token in axios headers
          setAuthToken(token);

          // For now, we'll use email as name until we can fetch full user profile
          // In a real app, you might want to fetch user details after login
          set({
            isAuthenticated: true,
            token,
            user: {
              id: response.sub,
              email,
              name: response.name, // Temporary: use email prefix as name
              role: response.role,
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
