import { useMemo } from "react";
import { SkeletonCard, LoaderIcon } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Child } from "@/types/child.types";
import ChildCard from "../sections/childCard";
import EmptyState from "../sections/emptyState";
import { filterByAge } from "../utils/childrenFilters";

interface ChildrenListProps {
  children: Child[];
  isLoading: boolean;
  isLoadingMore: boolean;
  showLoadMore: boolean;
  minAge: string;
  maxAge: string;
  debouncedSearch: string;
  onLoadMore: () => void;
  onShowInfo: (child: Child) => void;
  onChildUpdate: () => void;
}

/**
 * Component to display the list of children with loading states
 */
export const ChildrenList = ({
  children,
  isLoading,
  isLoadingMore,
  showLoadMore,
  minAge,
  maxAge,
  debouncedSearch,
  onLoadMore,
  onShowInfo,
  onChildUpdate,
}: ChildrenListProps) => {
  // Filter by age range
  const filteredList = useMemo(
    () => filterByAge(children, minAge, maxAge),
    [children, minAge, maxAge]
  );

  const showSkeleton = isLoading && children.length === 0;

  if (showSkeleton) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (filteredList.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            showInfoOverlay={onShowInfo}
            onChildUpdate={onChildUpdate}
          />
        ))}
      </div>

      {showLoadMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="link"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <LoaderIcon className="w-4 h-4" /> : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
};
