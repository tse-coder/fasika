import { fetchParents } from "@/api/parent.api";
import { PaginatedResponse } from "@/types/api.types";
import { Parent, parentState } from "@/types/parent.types";
import { loadCache, saveCache } from "@/utils/cache";
import { create } from "zustand";

export const useParents = create<parentState>((set) => ({
  parents: [],
  isLoading: false,
  error: null,

  fetchParents: async (filters = {}) => {
    const parentKey = "parents_" + JSON.stringify(filters);

    set({ isLoading: true, error: null });

    console.log("[Store] fetchParents - start", filters);
    try {
      // Try to use cache
      const cached = loadCache<PaginatedResponse<Parent>>(parentKey, 300000);
      if (cached) {
        console.log("[Store] fetchParents - cache hit", cached);
        set({ parents: cached.data, isLoading: false });
        return;
      }

      // Fetch from API
      const response = await fetchParents(filters);
      console.log("[Store] fetchParents - api returned", response);

      // API may return a paginated response or a plain array. Normalize both.
      if (Array.isArray(response)) {
        const paginated = {
          data: response,
          total: response.length,
          page: 1,
          limit: response.length,
        };
        saveCache(parentKey, paginated);
        set({ parents: response, isLoading: false });
      } else if ((response as any).data) {
        saveCache(parentKey, response as PaginatedResponse<Parent>);
        set({
          parents: (response as PaginatedResponse<Parent>).data,
          isLoading: false,
        });
      } else {
        saveCache(parentKey, { data: [], total: 0, page: 1, limit: 0 });
        set({ parents: [], isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching parents:", err);
      set({
        error: "Failed to load parents.",
        isLoading: false,
      });
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
