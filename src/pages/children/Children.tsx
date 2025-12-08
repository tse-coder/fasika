import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search } from "lucide-react";
import { SkeletonCard, LoaderIcon } from "@/components/ui/skeleton-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useChildren } from "@/stores/children.store";
import { Child } from "@/types/child.types";
import { useParents } from "@/stores/parent.store";
import { useModalStore } from "@/stores/overlay.store";
import ChildCard from "./sections/childCard";
import InfoOverlay from "./sections/infoOverlay";
import EmptyState from "./sections/emptyState";

const Children = () => {
  const { children, fetchChildren, isLoading } = useChildren();
  const { parents, fetchParents } = useParents();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  const openModal = useModalStore((state) => state.openModal);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // Reset pagination for new search
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  useEffect(() => {
    fetchChildren({ page });
  }, [page]);
  useEffect(() => {
    fetchChildren({ q: debouncedSearch });
  }, [debouncedSearch]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      await fetchChildren({ page: nextPage, q: debouncedSearch });
      setPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const showInfoOverlay = (child: Child) => {
    const parentIds = (child.parents || []).map((p) => p.id);

    fetchParents({ ids: parentIds });

    const parentInfo = parents.filter((p) => parentIds.includes(p.id));

    openModal(<InfoOverlay child={child} parentInfo={parentInfo} />);
  };

  const showSkeleton =
    (isLoading && children.length === 0) || // initial load
    (debouncedSearch !== "" && isLoading); // while searching

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search children..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link to="/register">
            <Button>Register New Child</Button>
          </Link>
        </div>

        {/* Skeleton loaders */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : children.length === 0 ? (
          /* Empty state */
          <EmptyState />
        ) : (
          <>
            {/* Child cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child: Child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  showInfoOverlay={showInfoOverlay}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="mt-4 flex justify-center">
              <Button
                variant="link"
                size="lg"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <LoaderIcon className="w-4 h-4" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Children;
