import { create } from "zustand";
import { Admin, AdminState } from "@/types/admins.types";
import {
  fetchAdmins,
  createAdmin,
  deleteAdmin,
  updateAdmin,
} from "@/api/admin.api";
import { CreateAdminRequest } from "@/api/admin.api";

export const useAdminsStore = create<AdminState>((set) => ({
  admins: [],
  isLoading: false,
  error: null,

  fetchAdmins: async () => {
    set({ isLoading: true, error: null });
    console.log("[Store] fetchAdmins - start");
    try {
      const data = await fetchAdmins();
      console.log("[Store] fetchAdmins - success", data);
      set({ admins: data, isLoading: false });
      return data;
    } catch (err) {
      console.error("Error fetching admins:", err);
      set({ error: "Failed to load admins.", isLoading: false });
      return [];
    }
  },

  createAdmin: async (data: CreateAdminRequest) => {
    set({ isLoading: true, error: null });
    console.log("[Store] createAdmin - start", data);
    try {
      const newAdmin = await createAdmin(data);
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

  deleteAdmin: async (id: number) => {
    set({ isLoading: true, error: null });
    console.log("[Store] deleteAdmin - start", id);
    try {
      await deleteAdmin(id);
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

  updateAdmin: async (
    id: number,
    data: { username?: string; password?: string }
  ) => {
    set({ isLoading: true, error: null });
    console.log("[Store] updateAdmin - start", id, data);
    try {
      const updatedAdmin = await updateAdmin(id, data);
      set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === id ? updatedAdmin : admin
        ),
        isLoading: false,
      }));
      console.log("[Store] updateAdmin - success", updatedAdmin);
      return updatedAdmin;
    } catch (err) {
      console.error("Error updating admin:", err);
      set({ error: "Failed to update admin.", isLoading: false });
      throw err;
    }
  },
}));
