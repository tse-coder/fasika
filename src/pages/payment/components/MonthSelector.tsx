import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { PaidMonth } from "@/types/payment.types";
import { useEffect } from "react";

const MONTHS = [
  "January",
  "February", 
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface MonthSelectorProps {
  selectedChild: any;
  selectedMonths: string[];
  onMonthsChange: (months: string[],amount:number) => void;
  paidMonths: PaidMonth[];
  isLoadingPaidMonths: boolean;
  error?: string;
  onError?: (error: string) => void; // Add error callback
}

export function MonthSelector({
  selectedChild,
  selectedMonths,
  onMonthsChange,
  paidMonths,
  isLoadingPaidMonths,
  error,
  onError,
}: MonthSelectorProps) {
  const currentYear = new Date().getFullYear();

  // Validate month selection
  const validateSelection = () => {
    if (selectedChild && selectedMonths.length === 0 && onError) {
      onError("Please select at least one month");
      return false;
    }
    if (selectedMonths.length > 0 && onError) {
      onError(""); // Clear error when months are selected
    }
    return true;
  };

  // Call validation when selectedMonths changes
  useEffect(() => {
    validateSelection();
  }, [selectedMonths, selectedChild]);

  const isMonthPaid = (monthIndex: number, year: number) => {
    return paidMonths.some(
      (pm) => pm.year === year && pm.month === monthIndex + 1
    );
  };

  const isMonthSelected = (monthIndex: number, year: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    return selectedMonths.includes(monthKey);
  };

  const handleMonthToggle = (monthIndex: number, year: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const isPaid = isMonthPaid(monthIndex, year);

    if (isPaid) return; // Don't allow selecting paid months

    const isSelected = selectedMonths.includes(monthKey);
    const newSelectedMonths = isSelected
      ? selectedMonths.filter((m) => m !== monthKey)
      : [...selectedMonths, monthKey];
    const amount = newSelectedMonths.length * (selectedChild?.monthlyRate || 0);
    onMonthsChange(newSelectedMonths, amount);
  };

  if (!selectedChild) return null;

  return (
    <div className="space-y-2">
      <Label>Select Months</Label>
      
      {isLoadingPaidMonths ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="w-4 h-4" />
          <span>Loading paid months...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {MONTHS.map((month, index) => {
            const isPaid = isMonthPaid(index, currentYear);
            const isSelected = isMonthSelected(index, currentYear);
            return (
              <button
                key={month}
                type="button"
                onClick={() => handleMonthToggle(index, currentYear)}
                disabled={isPaid}
                className={`
                  p-2 rounded-md border text-sm transition-colors
                  ${
                    isPaid
                      ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                      : isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent border-border"
                  }
                `}
                title={
                  isPaid
                    ? `${month} is already paid`
                    : isSelected
                    ? `Click to deselect ${month}`
                    : `Click to select ${month}`
                }
              >
                {month.slice(0, 3)}
              </button>
            );
          })}
        </div>
      )}
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      
      {paidMonths.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {paidMonths.length} month(s) already paid (disabled)
        </p>
      )}
    </div>
  );
}
