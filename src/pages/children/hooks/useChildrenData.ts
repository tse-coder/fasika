import { useState, useEffect, useRef } from "react";
import { useChildren } from "@/stores/children.store";
import { useBranchStore } from "@/stores/branch.store";
import { Child } from "@/types/child.types";

/**
 * Custom hook to manage children data fetching with search and pagination
 */
export const useChildrenData = () => {
  const { fetchChildren, isLoading } = useChildren();
  const { currentBranch } = useBranchStore();
  const [list, setList] = useState<Child[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      const nextSearch = search.trim();
      setPage(1);
      setDebouncedSearch(nextSearch);
    }, 500);

    return () => debounceTimer.current && clearTimeout(debounceTimer.current);
  }, [search]);

  // Fetch children when filters change
  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestIdRef.current;

    const loadChildren = async () => {
      const params: any =
        debouncedSearch.trim().length > 0
          ? { query: debouncedSearch.trim() }
          : { page };

      // Add active filter if not "all"
      if (activeFilter !== "all") {
        params.is_active = activeFilter === "active";
      }

      // Add branch filter
      params.branch = currentBranch;

      const response = (await fetchChildren(params)) || [];
      const data = Array.isArray(response)
        ? response
        : (response as any).data || [];

      if (cancelled || currentRequest !== requestIdRef.current) return;

      // Store all children for client-side filtering
      if (page === 1) {
        setAllChildren(data);
      } else {
        setAllChildren((prev) => [
          ...prev,
          ...data.filter(
            (child: Child) => !prev.some((c) => c.id === child.id)
          ),
        ]);
      }

      setList((prev) =>
        page === 1
          ? data
          : [
              ...prev,
              ...data.filter(
                (child: Child) => !prev.some((c) => c.id === child.id)
              ),
            ]
      );
      setIsLoadingMore(false);
    };

    loadChildren();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, activeFilter, fetchChildren, currentBranch]);

  const loadMore = () => {
    if (isLoading || isLoadingMore || debouncedSearch.trim()) return;
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
  };

  return {
    list,
    allChildren,
    page,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    isLoading,
    isLoadingMore,
    loadMore,
    debouncedSearch,
  };
};
