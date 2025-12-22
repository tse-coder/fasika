
import { mockFetchParents } from "@/mock/api";
import { PaginatedResponse } from "@/types/api.types";
import { Parent, parentState } from "@/types/parent.types";
import { create } from "zustand";

export const useParents = create<parentState>((set) => ({
  parents: [],
  isLoading: false,
  error: null,

  fetchParents: async (filters = {}) => {
    set({ isLoading: true, error: null });

    console.log("[Store] fetchParents - start", filters);
    try {
      // Fetch from API
      const response = await mockFetchParents(filters);
      console.log("[Store] fetchParents - api returned", response);

      // API may return a paginated response or a plain array. Normalize both.
      const data = Array.isArray(response)
        ? response
        : (response as any).data
        ? (response as PaginatedResponse<Parent>).data
        : [];

      set({ parents: data, isLoading: false });
      return data;
    } catch (err) {
      console.error("Error fetching parents:", err);
      set({ error: "Failed to load parents.", isLoading: false });
      return [];
    }
  },
}));

export const useParent = (id: number) => {
  const { parents, fetchParents } = useParents();

  const parent = parents.find((p) => p.id === id);

  const refresh = async () => {
    try {
      await fetchParents({ id });
    } catch (err) {
      console.error(`Error refreshing parent ${id}:`, err);
    }
  };

  return { parent, refresh };
};
