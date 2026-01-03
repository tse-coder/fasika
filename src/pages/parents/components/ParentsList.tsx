import { useMemo, useState, useEffect } from "react";
import { SkeletonCard, LoaderIcon } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Parent } from "@/types/parent.types";
import ParentCard from "../sections/parentCard";
import { EmptyState } from "../sections/emptyState";

interface ParentsListProps {
  parents: Parent[];
  isLoading: boolean;
  isLoadingMore: boolean;
  showLoadMore: boolean;
  debouncedSearch: string;
  onLoadMore: () => void;
  onParentUpdate: (updatedParent?: Parent) => void;
}

/**
 * Component to display the list of parents with loading states
 */
export const ParentsList = ({
  parents,
  isLoading,
  isLoadingMore,
  showLoadMore,
  debouncedSearch,
  onLoadMore,
  onParentUpdate,
}: ParentsListProps) => {
  const [localParents, setLocalParents] = useState<Parent[]>(parents);
  
  // Update local parents when prop changes
  useEffect(() => {
    setLocalParents(parents);
  }, [parents]);
  
  // Handle immediate UI updates for parent status changes
  const handleParentUpdate = (updatedParent?: Parent) => {
    if (updatedParent) {
      // Update the local state immediately
      setLocalParents(prev => 
        prev.map(parent => 
          parent.id === updatedParent.id ? updatedParent : parent
        )
      );
    }
    // Also call the parent handler for data refetch
    onParentUpdate();
  };

  // Remove filtering - just use the local parents directly
  const filteredList = localParents;

  const showSkeleton = isLoading && parents.length === 0;

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
        {filteredList.map((parent) => (
          <ParentCard
            key={parent.id}
            parent={parent}
            onParentUpdate={handleParentUpdate}
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
