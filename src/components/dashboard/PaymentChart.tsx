import { useEffect } from "react";

// Payments not implemented in backend yet — show placeholder
export const PaymentChart = () => {
  useEffect(() => {
    // no-op; placeholder component
  }, []);

  return (
    <div className="stat-card h-[400px] flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <h3 className="dashboard-title mb-2">Monthly Collections</h3>
        <p>
          Payments are not available yet. Connect the payments API to show
          charts.
        </p>
      </div>
    </div>
  );
};
