import { create } from "zustand";
import { Child, ChildState } from "@/types/child.types";
import { fetchChildren } from "@/api/child.api";
import { PaginatedResponse } from "@/types/api.types";
import { loadCache, saveCache } from "@/utils/cache";

export const useChildren = create<ChildState>((set) => ({
  children: [],
  error: null,
  isLoading: false,

  fetchChildren: async (filters = {}) => {
    const cacheKey = "children_" + JSON.stringify(filters);

    set({ isLoading: true, error: null });

    console.log("[Store] fetchChildren - start", filters);
    try {
      // Try to use cache
      const cached = loadCache<PaginatedResponse<Child>>(cacheKey, 300000);
      if (cached) {
        console.log("[Store] fetchChildren - cache hit", cached);
        set({ children: cached.data, isLoading: false });
        return;
      }

      // Fetch from API
      const res = await fetchChildren(filters);
      console.log("[Store] fetchChildren - api returned", res);

      // Save to cache and update state. API may return paginated response or plain array.
      if (Array.isArray(res)) {
        saveCache(cacheKey, {
          data: res,
          total: res.length,
          page: 1,
          limit: res.length,
        });
        set({ children: res, isLoading: false });
      } else if ((res as any).data) {
        saveCache(cacheKey, res as PaginatedResponse<Child>);
        set({
          children: (res as PaginatedResponse<Child>).data,
          isLoading: false,
        });
      } else {
        // Fallback
        set({ children: [], isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching children:", err);
      set({ error: "Failed to load children.", isLoading: false });
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
