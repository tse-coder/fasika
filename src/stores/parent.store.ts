import { fetchParents } from "@/api/parent.api";
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
      const response = await fetchParents(filters);
      console.log("[Store] fetchParents - api returned", response);

      // API may return a paginated response or a plain array. Normalize both.
      if (Array.isArray(response)) {
        set({ parents: response, isLoading: false });
      } else if ((response as any).data) {
        set({
          parents: (response as PaginatedResponse<Parent>).data,
          isLoading: false,
        });
      } else {
        set({ parents: [], isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching parents:", err);
      set({ error: "Failed to load parents.", isLoading: false });
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
