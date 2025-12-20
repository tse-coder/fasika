import { apiPost } from "./http";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
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
