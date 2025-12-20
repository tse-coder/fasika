import { Admin } from "@/types/admins.types";
import { apiGet, apiPost, apiDelete, apiPut } from "./http";

export interface CreateAdminRequest {
  username: string;
  password: string;
  role: "superadmin" | "admin";
}

/**
 * Create a new admin user
 */
export const createAdmin = async (data: CreateAdminRequest): Promise<Admin> => {
  console.log("[API] createAdmin - start", data);
  try {
    const res = await apiPost<Admin>("/api/users", data,{
      headers: {
        "authentication": "Bearer" 
      }
    });
    console.log("[API] createAdmin - success", res);
    return res;
  } catch (err) {
    console.error("[API] createAdmin - error", err);
    throw err;
  }
};

/**
 * Fetch all admins
 */
export const fetchAdmins = async (): Promise<Admin[]> => {
  console.log("[API] fetchAdmins - start");
  try {
    const res = await apiGet<Admin[]>("/api/users");
    console.log("[API] fetchAdmins - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchAdmins - error", err);
    throw err;
  }
};

/**
 * Delete an admin by ID
 */
export const deleteAdmin = async (id: number): Promise<void> => {
  console.log("[API] deleteAdmin - start", id);
  try {
    await apiDelete(`/api/users/${id}`);
    console.log("[API] deleteAdmin - success");
  } catch (err) {
    console.error("[API] deleteAdmin - error", err);
    throw err;
  }
};

/**
 * Update an admin (username and/or password)
 */
export const updateAdmin = async (
  id: number,
  data: { username?: string; password?: string }
): Promise<Admin> => {
  console.log("[API] updateAdmin - start", id, data);
  try {
    const res = await apiPut<Admin>(`/api/admins/${id}`, data);
    console.log("[API] updateAdmin - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateAdmin - error", err);
    throw err;
  }
};

/**
 * Update current user's profile (username and/or password)
 */
export const updateCurrentUser = async (data: {
  username?: string;
  password?: string;
}): Promise<{ username: string }> => {
  console.log("[API] updateCurrentUser - start", data);
  try {
    const res = await apiPut<{ username: string }>("/api/auth/profile", data);
    console.log("[API] updateCurrentUser - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateCurrentUser - error", err);
    throw err;
  }
};
