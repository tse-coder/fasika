import { create } from "zustand";
import { Admin, AdminState } from "@/types/admins.types";
import { User, CreateUserRequest } from "@/types/user.types";
import {
  mockChangeRole,
  mockCreateUser,
  mockDeleteUser,
  mockFetchUsers,
  mockResetPassword,
} from "@/mock/api";

// Convert User to Admin (for backward compatibility)
const userToAdmin = (user: User): Admin => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  branch: user.branch
});

export const useAdminsStore = create<AdminState>((set) => ({
  admins: [],
  isLoading: false,
  error: null,

  fetchAdmins: async () => {
    set({ isLoading: true, error: null });
    console.log("[Store] fetchAdmins - start");
    try {
      const users = await mockFetchUsers();
      const admins = users.map(userToAdmin);
      console.log("[Store] fetchAdmins - success", admins);
      set({ admins, isLoading: false });
      return admins;
    } catch (err) {
      console.error("Error fetching admins:", err);
      set({ error: "Failed to load admins.", isLoading: false });
      return [];
    }
  },

  createAdmin: async (data: CreateUserRequest) => {
    set({ isLoading: true, error: null });
    console.log("[Store] createAdmin - start", data);
    try {
      const newUser = await mockCreateUser(data);
      const newAdmin = userToAdmin(newUser);
      set((state) => ({
        admins: [...state.admins, newAdmin],
        isLoading: false,
      }));
      console.log("[Store] createAdmin - success", newAdmin);
      return newAdmin;
    } catch (err) {
      console.error("Error creating admin:", err);
      set({ error: "Failed to create admin.", isLoading: false });
      throw err;
    }
  },

  deleteAdmin: async (id: string) => {
    set({ isLoading: true, error: null });
    console.log("[Store] deleteAdmin - start", id);
    try {
      await mockDeleteUser(id);
      set((state) => ({
        admins: state.admins.filter((admin) => admin.id !== id),
        isLoading: false,
      }));
      console.log("[Store] deleteAdmin - success");
    } catch (err) {
      console.error("Error deleting admin:", err);
      set({ error: "Failed to delete admin.", isLoading: false });
      throw err;
    }
  },

  resetPassword: async (id: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    console.log("[Store] resetPassword - start", id);
    try {
      const updatedUser = await mockResetPassword(id, { newPassword });
      const updatedAdmin = userToAdmin(updatedUser);
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === id ? updatedAdmin : admin
        ),
        isLoading: false,
      }));
      console.log("[Store] resetPassword - success", updatedAdmin);
      return updatedAdmin;
    } catch (err) {
      console.error("Error resetting password:", err);
      set({ error: "Failed to reset password.", isLoading: false });
      throw err;
    }
  },

  changeRole: async (id: string, action: "PROMOTE" | "DEMOTE") => {
    set({ isLoading: true, error: null });
    console.log("[Store] changeRole - start", id, action);
    try {
      const updatedUser = await mockChangeRole(id, action);
      const updatedAdmin = userToAdmin(updatedUser);
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === id ? updatedAdmin : admin
        ),
        isLoading: false,
      }));
      console.log("[Store] changeRole - success", updatedAdmin);
      return updatedAdmin;
    } catch (err) {
      console.error("Error changing role:", err);
      set({ error: "Failed to change role.", isLoading: false });
      throw err;
    }
  },
}));
