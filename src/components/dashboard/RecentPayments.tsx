import { useEffect } from "react";
import { useChildren } from "@/stores/children.store";

// Payments are not implemented on backend yet; show recent children instead
export const RecentPayments = () => {
  const { children, fetchChildren } = useChildren();

  useEffect(() => {
    fetchChildren();
  }, []);

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
    </div>
  );
};
