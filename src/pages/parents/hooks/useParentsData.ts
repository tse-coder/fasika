import { useState, useCallback, useEffect, useRef } from "react";
import { fetchParents } from "@/api/parent.api";
import { Parent, ParentQuery } from "@/types/parent.types";

interface UseParentsDataReturn {
  list: Parent[];
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  debouncedSearch: string;
}

const DEBOUNCE_MS = 300;

export const useParentsData = (): UseParentsDataReturn => {
  const [list, setList] = useState<Parent[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Use refs to avoid dependency issues
  const debouncedSearchRef = useRef(debouncedSearch);
  const hasMoreRef = useRef(hasMore);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setList([]);
    // Update refs
    debouncedSearchRef.current = debouncedSearch;
    hasMoreRef.current = true;
  }, [debouncedSearch]);

  // Fetch parents when search changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let response;
        if (debouncedSearch.trim() === "") {
          // Fetch all parents when search is empty
          response = await fetchParents({ page: 1 });
        } else {
          // Fetch filtered parents when search has value
          response = await fetchParents({ page: 1, query: debouncedSearch.trim() });
        }
        const newParents = response.data || [];
        setList(newParents);
        
        // Check if there are more pages
        if (newParents.length === 0 || newParents.length < 10) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch (error) {
        console.error("Failed to fetch parents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [debouncedSearch]);

  // Fetch parents
  const fetchParentsData = useCallback(
    async (page: number = 1, isLoadMore: boolean = false) => {
      if (isLoading || (isLoadMore && isLoadingMore) || (!hasMore && isLoadMore)) {
        return;
      }

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params: ParentQuery = {
          page
        };

        if (debouncedSearchRef.current.trim()) {
          params.query = debouncedSearchRef.current.trim();
        }

        const response = await fetchParents(params);
        const newParents = response.data || [];

        if (isLoadMore) {
          setList(prev => [...prev, ...newParents]);
        } else {
          setList(newParents);
        }

        // Check if there are more pages
        if (newParents.length === 0 || newParents.length < 10) {
          setHasMore(false);
          hasMoreRef.current = false;
        }

        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch parents:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearchRef, hasMoreRef]
  );

  // Initial fetch and when search changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchParentsData(1, false);
    }
  }, [debouncedSearch, currentPage]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchParentsData(currentPage + 1, true);
    }
  }, [currentPage, isLoading, isLoadingMore, hasMore]);

  return {
    list,
    search,
    setSearch,
    isLoading,
    isLoadingMore,
    loadMore,
    debouncedSearch,
  };
};
