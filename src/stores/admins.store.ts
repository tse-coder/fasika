import { create } from "zustand";
import { Admin, AdminState } from "@/types/admins.types";

const dummyAdmins: Admin[] = [];

export const useAdminsStore = create<AdminState>((set) => ({
  admins: [],
  isLoading: false,
  error: null,

  fetchAdmins: async (filters: Partial<Admin> = {}) => {
    set({ isLoading: true, error: null });

    console.log("[Store] fetchAdmins - start", filters);

    try {
      // simulate API delay
      await new Promise((res) => setTimeout(res, 300));

      let data = dummyAdmins;

      // Apply filters ONLY if provided
      if (Object.keys(filters).length > 0) {
        data = dummyAdmins.filter((admin) =>
          Object.entries(filters).every(
            ([key, value]) => admin[key as keyof Admin] === value
          )
        );
      }

      console.log("[Store] fetchAdmins - resolved", data);

      set({ admins: data, isLoading: false });
      return data;
    } catch (err) {
      console.error("Error fetching admins:", err);
      set({ error: "Failed to load admins.", isLoading: false });
      return [];
    }
  },
  updateAdmin: async (id: number, data: Partial<Admin>) => {
    set({ isLoading: true, error: null });
    console.log("[Store] updateAdmin - start", id, data);
    try {
      new Promise((res) => setTimeout(res, 300));

      const updatedAdmin = { ...data, id } as Admin;

      const index = dummyAdmins.findIndex((admin) => admin.id === id);
      if (index !== -1) {
        dummyAdmins[index] = { ...dummyAdmins[index], ...data };
      }

      console.log("[Store] updateAdmin - resolved", updatedAdmin);

      set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === id ? updatedAdmin : admin
        ),
        isLoading: false,
      }));
      return updatedAdmin;
    } catch (err) {
      console.error("Error updating admin:", err);
      set({ error: "Failed to update admin.", isLoading: false });
      return null;
    }
  },
}));
