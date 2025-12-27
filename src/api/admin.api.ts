import {
  User,
  CreateUserRequest,
  ResetPasswordRequest,
  ChangeRoleRequest,
  UserResponse,
} from "@/types/user.types";
import { apiGet, apiPost, apiPatch, apiPut } from "./http";

/**
 * Fetch all users (requires ADMIN role)
 */
export const fetchUsers = async (): Promise<UserResponse> => {
  console.log("[API] fetchUsers - start");
  try {
    const res = await apiGet<UserResponse>("/api/users");
    console.log("[API] fetchUsers - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchUsers - error", err);
    throw err;
  }
};

/**
 * Create a new user (requires ADMIN role)
 * Note: New users are created with role "USER" by default
 */
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  console.log("[API] createUser - start", data);
  try {
    const res = await apiPost<User>("/api/users", data);
    console.log("[API] createUser - success", res);
    return res;
  } catch (err) {
    console.error("[API] createUser - error", err);
    throw err;
  }
};

/**
 * Soft delete a user (requires ADMIN role)
 * PATCH /users/:id/delete
 */
export const deleteUser = async (id: string): Promise<User> => {
  console.log("[API] deleteUser - start", id);
  try {
    const res = await apiPatch<User>(`/api/users/${id}/delete`, {});
    console.log("[API] deleteUser - success", res);
    return res;
  } catch (err) {
    console.error("[API] deleteUser - error", err);
    throw err;
  }
};

/**
 * Reset a user's password (requires ADMIN role)
 * PATCH /users/:id/reset-password
 */
export const resetUserPassword = async (
  id: string,
  data: ResetPasswordRequest
): Promise<User> => {
  console.log("[API] resetUserPassword - start", id);
  try {
    const res = await apiPatch<User>(`/api/users/${id}/reset-password`, data);
    console.log("[API] resetUserPassword - success", res);
    return res;
  } catch (err) {
    console.error("[API] resetUserPassword - error", err);
    throw err;
  }
};

/**
 * Change user role (PROMOTE to ADMIN or DEMOTE to USER)
 * PATCH /users/:id/role
 */
export const changeUserRole = async (
  id: string,
  data: ChangeRoleRequest
): Promise<User> => {
  console.log("[API] changeUserRole - start", id, data);
  try {
    const res = await apiPatch<User>(`/api/users/${id}/role`, data);
    console.log("[API] changeUserRole - success", res);
    return res;
  } catch (err) {
    console.error("[API] changeUserRole - error", err);
    throw err;
  }
};

/**
 * Update user information (name, email, branch, role)
 * PUT /users/:id
 */
export const updateUser = async (
  id: string,
  data: { name?: string; email?: string; branch?: string; role?: "ADMIN" | "USER" }
): Promise<User> => {
  console.log("[API] updateUser - start", id, data);
  try {
    const res = await apiPut<User>(`/api/users/${id}`, data);
    console.log("[API] updateUser - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateUser - error", err);
    throw err;
  }
};
