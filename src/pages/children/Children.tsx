import { useState, useEffect, useRef } from "react";
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
  const { fetchChildren, isLoading,children } = useChildren();
  const { parents, fetchParents } = useParents();

  const [list, setList] = useState<Child[]>([]);

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
    }, 500);

    return () => debounceTimer.current && clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    const loadChildren = async () => {
      await fetchChildren({ page, q: debouncedSearch });

      if (!Array.isArray(children)) return;

      if (page === 1) {
        setList(children); 
      } else {
        setList((prev) => [...prev, ...children]);
      }
    };

    loadChildren();
  }, [page, debouncedSearch]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;

    await fetchChildren({ page: nextPage, q: debouncedSearch });
    if (Array.isArray(children)) {
      setList((prev) => [...prev, ...children]);
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  };

  const showInfoOverlay = (child: Child) => {
    const parentIds = (child.parents || []).map((p) => p.id);

    fetchParents({ ids: parentIds });

    const parentInfo = parents.filter((p) => parentIds.includes(p.id));
    openModal(<InfoOverlay child={child} parentInfo={parentInfo} />);
  };

  const showSkeleton =
    (isLoading && list.length === 0) || // initial load
    (debouncedSearch !== "" && isLoading); // searching

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
        ) : list.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Child Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((child) => (
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
