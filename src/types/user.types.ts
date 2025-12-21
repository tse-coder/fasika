import { Branch } from "./api.types";

/**
 * User type matching the API response format
 */
export type User = {
  id: string; // UUID
  name: string;
  email: string;
  phone: string | null;
  dob: string | null; // ISO 8601 date
  role: "ADMIN" | "USER";
  branch?: Branch;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  password?: string; // Only included in some responses (hashed)
};

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  dob?: string; // ISO 8601 date format (YYYY-MM-DD)
  password: string; // Minimum 8 characters
}

export interface ResetPasswordRequest {
  newPassword: string; // Minimum 8 characters
}

export interface ChangeRoleRequest {
  action: "PROMOTE" | "DEMOTE";
}
