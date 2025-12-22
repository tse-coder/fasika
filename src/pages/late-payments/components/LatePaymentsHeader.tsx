import { LatePaymentsFilters } from "./LatePaymentsFilters";
import type { LateRange } from "../hooks/useLatePayments";

interface LatePaymentsHeaderProps {
  lateRange: LateRange;
  onRangeChange: (range: LateRange) => void;
  showExpiring: boolean;
  onShowExpiringChange: (show: boolean) => void;
}

/**
 * Header component for the Late Payments page
 * Displays title, description, and filter controls
 */
export const LatePaymentsHeader = ({
  lateRange,
  onRangeChange,
  showExpiring,
  onShowExpiringChange,
}: LatePaymentsHeaderProps) => {
  // Get current year and month for display
  const now = new Date();
  const currentYear = now.getFullYear();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Late Payments</h1>
        <p className="text-muted-foreground">
          Children with overdue payments from September {currentYear - 1} to June {currentYear}
        </p>
      </div>
      <LatePaymentsFilters
        lateRange={lateRange}
        onRangeChange={onRangeChange}
        showExpiring={showExpiring}
        onShowExpiringChange={onShowExpiringChange}
      />
    </div>
  );
};
