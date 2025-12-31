import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { Child } from "@/types/child.types";

interface ChildSelectionProps {
  childSearch: string;
  onChildSearchChange: (value: string) => void;
  childList: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
  childrenLoading: boolean;
  isLoadingMoreChildren: boolean;
  onLoadMoreChildren: () => void;
  error?: string;
  listRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  isChildNew: boolean;
  isChildOld: boolean;
  isLoadingPaidMonths: boolean;
}

export function ChildSelection({
  childSearch,
  onChildSearchChange,
  childList,
  selectedChild,
  onSelectChild,
  childrenLoading,
  isLoadingMoreChildren,
  onLoadMoreChildren,
  error,
  listRef,
  onScroll,
  isChildNew,
  isChildOld,
  isLoadingPaidMonths,
}: ChildSelectionProps) {
  // Local filtering for quick UX
  const filteredChildren = childList.filter(
    (c) =>
      `${c.fname} ${c.lname}`
        .toLowerCase()
        .includes(childSearch.toLowerCase()) ||
      (c.birthdate || "").includes(childSearch)
  );

  return (
    <div className="space-y-2">
      <Label>Select Child</Label>
      <div className="relative">
        <Input
          placeholder="Search child by name..."
          value={childSearch}
          onChange={(e) => onChildSearchChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}

        {childSearch && (
          <div
            className="border rounded-md max-h-56 overflow-y-auto mt-2 absolute z-50 w-full bg-background shadow-lg"
            ref={listRef}
            onScroll={onScroll}
          >
            {(childrenLoading || isLoadingMoreChildren) &&
            filteredChildren.length === 0 ? (
              <div className="p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse mb-3">
                    <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted/30 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredChildren.length > 0 ? (
              <>
                {filteredChildren.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectChild(child)}
                    className="p-3 cursor-pointer hover:bg-primary/10 border-b"
                  >
                    <div className="font-medium">
                      {child.fname} {child.lname}
                    </div>
                    {child.birthdate && (
                      <div className="text-sm text-muted-foreground">
                        DOB: {new Date(child.birthdate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
                {!childSearch.trim() && (
                  <div className="p-3 text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={onLoadMoreChildren}
                      disabled={isLoadingMoreChildren}
                    >
                      {isLoadingMoreChildren ? (
                        <LoaderIcon className="w-4 h-4" />
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground p-3">
                No matching children found.
              </p>
            )}
          </div>
        )}
      </div>

      {selectedChild && (
        <div className="mt-2 p-2 bg-primary/10 rounded-md space-y-2">
          <div className="font-medium">
            Selected: {selectedChild.fname} {selectedChild.lname}
          </div>
        </div>
      )}
    </div>
  );
}
