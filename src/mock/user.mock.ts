import { User, CreateUserRequest } from "@/types/user.types";
import { Branch } from "@/types/api.types";
import { mockUsers, type MockUser } from "./data";
import { delay } from "./utils";

let users: MockUser[] = [...mockUsers];

const nextId = (() => {
  let current = 4000;
  return () => ++current;
})();

const sanitizeUser = (user: MockUser): User => {
  const { password, ...rest } = user;
  return rest;
};

export const mockFetchUsers = async (): Promise<User[]> => {
  await delay();
  return users.map(sanitizeUser);
};

export const mockCreateUser = async (
  data: CreateUserRequest
): Promise<User> => {
  await delay();
  const newUser: MockUser = {
    ...data,
    id: `u-${nextId()}`,
    role: "USER",
    branch: data.branch || "daycare Bulbula",
    dob: data.dob || null,
    phone: data.phone || null,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: data.password,
  };
  users = [...users, newUser];
  return sanitizeUser(newUser);
};

export const mockDeleteUser = async (id: string): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.isDeleted = true;
  existing.deletedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockResetPassword = async (
  id: string,
  data: { newPassword: string }
): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.password = data.newPassword;
  existing.updatedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockChangeRole = async (
  id: string,
  action: "PROMOTE" | "DEMOTE"
): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.role = action === "PROMOTE" ? "ADMIN" : "USER";
  existing.updatedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockUpdateUser = async (
  id: string,
  data: { name?: string; email?: string; branch?: string; role?: "ADMIN" | "USER" }
): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");

  if (data.name !== undefined) existing.name = data.name;
  if (data.email !== undefined) existing.email = data.email;
  if (data.branch !== undefined) existing.branch = data.branch as any;
  if (data.role !== undefined) existing.role = data.role;

  existing.updatedAt = new Date().toISOString();
  return sanitizeUser(existing);
};