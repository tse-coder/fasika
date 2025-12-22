// src/mocks/users.mock.ts

import { mockUsers, type MockUser } from "./data";
import {
  User,
  CreateUserRequest,
  ResetPasswordRequest,
  ChangeRoleRequest,
} from "@/types/user.types";

/**
 * Clone JSON so we can mutate it safely
 */
const users: MockUser[] = structuredClone(mockUsers);

/**
 * Simulate network latency
 */
const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all users
 */
export const fetchUsers = async (): Promise<User[]> => {
  await delay();
  return users.filter((u) => !u.isDeleted);
};

/**
 * Create a new user
 */
export const createUser = async (
  data: CreateUserRequest
): Promise<User> => {
  await delay();

  const now = new Date().toISOString();

  const newUser: MockUser = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    dob: data.dob ?? null,
    role: "USER",
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    password: `hashed_${data.password}`, // mock hash
    branch: data.branch
  };

  users.push(newUser);
  return newUser;
};

/**
 * Soft delete user
 */
export const deleteUser = async (id: string): Promise<User> => {
  await delay();

  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error("User not found");

  user.isDeleted = true;
  user.deletedAt = new Date().toISOString();
  user.updatedAt = user.deletedAt;

  return user;
};

/**
 * Reset user password
 */
export const resetUserPassword = async (
  id: string,
  data: ResetPasswordRequest
): Promise<User> => {
  await delay();

  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error("User not found");

  user.password = `hashed_${data.newPassword}`;
  user.updatedAt = new Date().toISOString();

  return user;
};

/**
 * Change user role
 */
export const changeUserRole = async (
  id: string,
  data: ChangeRoleRequest
): Promise<User> => {
  await delay();

  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error("User not found");

  user.role =
    data.action === "PROMOTE" ? "ADMIN" : "USER";

  user.updatedAt = new Date().toISOString();

  return user;
};
