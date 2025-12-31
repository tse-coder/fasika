import { useMemo, useState, useEffect } from "react";
import { SkeletonCard, LoaderIcon } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Child } from "@/types/child.types";
import ChildCard from "../sections/childCard";
import EmptyState from "../sections/emptyState";
import { filterChildren } from "../utils/childrenFilters";

interface ChildrenListProps {
  children: Child[];
  isLoading: boolean;
  isLoadingMore: boolean;
  showLoadMore: boolean;
  minAge: string;
  maxAge: string;
  activeFilter: string;
  debouncedSearch: string;
  onLoadMore: () => void;
  onShowInfo: (child: Child) => void;
  onChildUpdate: (updatedChild?: Child) => void;
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
  activeFilter,
  debouncedSearch,
  onLoadMore,
  onShowInfo,
  onChildUpdate,
}: ChildrenListProps) => {
  const [localChildren, setLocalChildren] = useState<Child[]>(children);
  
  // Update local children when prop changes
  useEffect(() => {
    setLocalChildren(children);
  }, [children]);
  
  // Handle immediate UI updates for child status changes
  const handleChildUpdate = (updatedChild?: Child) => {
    if (updatedChild) {
      // Update the local state immediately
      setLocalChildren(prev => 
        prev.map(child => 
          child.id === updatedChild.id ? updatedChild : child
        )
      );
    }
    // Also call the parent handler for data refetch
    onChildUpdate();
  };

  // Filter by age range and status
  const filteredList = useMemo(
    () => filterChildren(localChildren, minAge, maxAge, activeFilter),
    [localChildren, minAge, maxAge, activeFilter]
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
            onChildUpdate={handleChildUpdate}
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
