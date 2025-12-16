import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateAge } from "@/lib/utils";

const Children = () => {
  const { fetchChildren, isLoading } = useChildren();

  const [list, setList] = useState<Child[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");

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
      const params: any =
        debouncedSearch.trim().length > 0
          ? { query: debouncedSearch.trim() }
          : { page };

      // Add active filter if not "all"
      if (activeFilter !== "all") {
        params.is_active = activeFilter === "active";
      }

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
  }, [page, debouncedSearch, activeFilter, fetchChildren]);

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

  // Client-side age filtering
  const filteredList = useMemo(() => {
    let filtered = list;

    // Filter by age range
    if (minAge || maxAge) {
      filtered = filtered.filter((child) => {
        const age = calculateAge(child.birthdate);
        if (minAge && age as number < parseInt(minAge)) return false;
        if (maxAge && age as number > parseInt(maxAge)) return false;
        return true;
      });
    }

    return filtered;
  }, [list, minAge, maxAge]);

  const showSkeleton = isLoading && page === 1 && list.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search Bar and Filters */}
        <div className="flex flex-col gap-4">
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min Age"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-[100px]"
                min="0"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max Age"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-[100px]"
                min="0"
              />
            </div>

            {(minAge || maxAge || activeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMinAge("");
                  setMaxAge("");
                  setActiveFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Skeleton loaders */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Child Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  showInfoOverlay={showInfoOverlay}
                  onChildUpdate={() => {
                    // Reload children when a child is updated
                    const params =
                      debouncedSearch.trim().length > 0
                        ? { query: debouncedSearch.trim() }
                        : { page: 1 };
                    fetchChildren(params).then((data) => {
                      setList(data || []);
                    });
                  }}
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
