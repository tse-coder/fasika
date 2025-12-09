import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search } from "lucide-react";
import { SkeletonCard, LoaderIcon } from "@/components/ui/skeleton-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useChildren } from "@/stores/children.store";
import { Child } from "@/types/child.types";
import { useModalStore } from "@/stores/overlay.store";
import ChildCard from "./sections/childCard";
import InfoOverlay from "./sections/infoOverlay";
import EmptyState from "./sections/emptyState";
import { fetchParentById } from "@/api/parent.api";

const Children = () => {
  const { fetchChildren, isLoading } = useChildren();

  const [list, setList] = useState<Child[]>([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const openModal = useModalStore((state) => state.openModal);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = window.setTimeout(() => {
      const nextSearch = search.trim();
      setPage(1);
      setDebouncedSearch(nextSearch);
    }, 500);

    return () => debounceTimer.current && clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestIdRef.current;

    const loadChildren = async () => {
      const params =
        debouncedSearch.trim().length > 0
          ? { query: debouncedSearch.trim() }
          : { page };

      const data = (await fetchChildren(params)) || [];

      if (cancelled || currentRequest !== requestIdRef.current) return;

      setList((prev) =>
        page === 1
          ? data
          : [
              ...prev,
              ...data.filter((child) => !prev.some((c) => c.id === child.id)),
            ]
      );
      setIsLoadingMore(false);
    };

    loadChildren();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, fetchChildren]);

  const loadMore = () => {
    if (isLoading || isLoadingMore || debouncedSearch.trim()) return;
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
  };

  const LoadingOverlay = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <LoaderIcon className="w-6 h-6" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const showInfoOverlay = async (child: Child) => {
    const parentIds = (child.parents || []).map((p) => p.id).filter(Boolean);

    if (parentIds.length === 0) {
      openModal(<InfoOverlay child={child} parentInfo={[]} />);
      return;
    }

    openModal(<LoadingOverlay message="Fetching parent details..." />);

    try {
      const parents = (
        await Promise.all(parentIds.map((id) => fetchParentById(id)))
      ).filter(Boolean);

      openModal(<InfoOverlay child={child} parentInfo={parents} />);
    } catch (err) {
      console.error("[Children] Failed to load parent info", err);
      openModal(
        <div className="py-6">
          <p className="font-semibold">Unable to load parent details.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try again.
          </p>
        </div>
      );
    }
  };

  const showSkeleton = isLoading && page === 1 && list.length === 0;

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
            {debouncedSearch.trim() === "" && (
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
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Children;
