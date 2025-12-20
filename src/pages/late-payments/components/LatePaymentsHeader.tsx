import { LatePaymentsFilters } from "./LatePaymentsFilters";
import type { LateRange } from "../hooks/useLatePayments";

interface LatePaymentsHeaderProps {
  lateRange: LateRange;
  onRangeChange: (range: LateRange) => void;
}

/**
 * Header component for the Late Payments page
 * Displays title, description, and filter dropdown
 */
export const LatePaymentsHeader = ({
  lateRange,
  onRangeChange,
}: LatePaymentsHeaderProps) => {
  // Get current year and month for display
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Late Payments</h1>
        <p className="text-muted-foreground">
          Children with overdue payments from January {currentYear} to{" "}
          {currentMonth} {currentYear}
        </p>
      </div>
      <LatePaymentsFilters
        lateRange={lateRange}
        onRangeChange={onRangeChange}
      />
    </div>
  );
};
