import { create } from "zustand";
import { Child, ChildState } from "@/types/child.types";
import { fetchChildren } from "@/api/child.api";
import { PaginatedResponse } from "@/types/api.types";

export const useChildren = create<ChildState>((set) => ({
  children: [],
  error: null,
  isLoading: false,

  fetchChildren: async (filters = {}) => {
    set({ isLoading: true, error: null });

    console.log("[Store] fetchChildren - start", filters);
    try {
      // Fetch from API
      const res = await fetchChildren(filters);
      console.log("[Store] fetchChildren - api returned", res);

      // API may return paginated response or plain array. Normalize both.
      const data = Array.isArray(res)
        ? res
        : (res as any).data
        ? (res as PaginatedResponse<Child>).data
        : [];

      set({ children: data, isLoading: false });
      return data;
    } catch (err) {
      console.error("Error fetching children:", err);
      set({ error: "Failed to load children.", isLoading: false });
      return [];
    }
  },
}));

export const useChild = (id: number) => {
  const { children, fetchChildren } = useChildren();

  const child = children.find((c) => c.id === id);

  const refresh = async () => {
    try {
      await fetchChildren({ id });
    } catch (err) {
      console.error(`Error refreshing child ${id}:`, err);
    }
  };

  return { child, refresh };
};
