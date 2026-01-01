import { User } from "@/types/user.types";
import { apiPost, apiPatch } from "./http";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Login with email and password
 * Returns JWT access token
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  console.log("[API] login - start");
  try {
    const res = await apiPost<LoginResponse>("/api/auth/login", data);
    console.log("[API] login - success");
    return res;
  } catch (err) {
    console.error("[API] login - error", err);
    throw err;
  }
};

/**
 * Change user's own password (validates current password via login check)
 * Uses existing admin endpoint but validates current password first
 */
export const changePassword = async (data: ChangePasswordRequest & { userId: string; userEmail: string }): Promise<void> => {
  console.log("[API] changePassword - start");
  try {
    // First validate current password by attempting login
    await login({ email: data.userEmail, password: data.currentPassword });
    
    // If login succeeds, use admin reset password endpoint
    const { resetUserPassword } = await import("./admin.api");
    await resetUserPassword(data.userId, { newPassword: data.newPassword });
    
    console.log("[API] changePassword - success");
  } catch (err: any) {
    console.error("[API] changePassword - error", err);
    
    // Handle specific errors
    if (err?.response?.status === 401) {
      throw new Error("Current password is incorrect");
    } else if (err?.message) {
      throw err;
    } else {
      throw new Error("Failed to change password");
    }
  }
};
