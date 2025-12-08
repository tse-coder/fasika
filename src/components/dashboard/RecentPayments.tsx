import { useEffect, useState } from "react";
import { useChildren } from "@/stores/children.store";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";

// Payments are not implemented on backend yet; show recent children instead
export const RecentPayments = () => {
  const { children, fetchChildren } = useChildren();

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchChildren({ page });
  }, [page]);

  const recent = [...children].slice(-5).reverse();

  return (
    <div className="stat-card">
      <h3 className="dashboard-title mb-6">Recent Children</h3>
      {recent.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No children registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recent.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">
                    {(child.fname[0] || "") + (child.lname[0] || "")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {child.fname} {child.lname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(child.birthdate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          onClick={async () => {
            setIsLoadingMore(true);
            try {
              setPage((p) => p + 1);
            } finally {
              setIsLoadingMore(false);
            }
          }}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? <LoaderIcon className="w-4 h-4" /> : "Next"}
        </Button>
      </div>
    </div>
  );
};
