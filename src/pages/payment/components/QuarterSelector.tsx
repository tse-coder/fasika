import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useEffect } from "react";

interface QuarterSelectorProps {
  selectedChild: any;
  onQuartersChange: (quarters: Array<{quarter: number, year: number}>) => void;
  paidQuarters: Array<{quarter: number, year: number}>; // Quarters already paid
  isLoadingPaidQuarters: boolean;
  selectedQuarters: Array<{quarter: number, year: number}>;
  error?: string;
  onError?: (error: string) => void; // Add error callback
}

export function QuarterSelector({
  selectedChild,
  onQuartersChange,
  paidQuarters,
  isLoadingPaidQuarters,
  selectedQuarters,
  error,
  onError,
}: QuarterSelectorProps) {
  // Validate quarter selection
  const validateSelection = () => {
    if (selectedChild && selectedQuarters.length === 0 && onError) {
      onError("Please select at least one quarter");
      return false;
    }
    
    if (selectedQuarters.length > 0 && onError) {
      onError(""); // Clear error when quarters are selected
    }
    return true;
  };

  // Call validation when selectedQuarters changes
  useEffect(() => {
    validateSelection();
  }, [selectedQuarters, selectedChild]);

  if (!selectedChild) return null;

  const quarters = [
    { label: "Q1 (Sep-Nov)", quarter: 1 },
    { label: "Q2 (Dec-Feb)", quarter: 2 },
    { label: "Q3 (Mar-May)", quarter: 3 },
    { label: "Q4 (Jun-Aug)", quarter: 4 },
  ];

  const getCurrentYearForQuarter = (quarter: number): number => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    return currentMonth
  };

  const handleQuarterToggle = (quarter: { label: string; quarter: number }) => {
    const year = getCurrentYearForQuarter(quarter.quarter);
    const quarterData = { quarter: quarter.quarter, year };
    
    // Check if quarter is already paid
    const isPaid = paidQuarters.some(pq => pq.quarter === quarter.quarter && pq.year === year);
    if (isPaid) return; // Don't allow selecting paid quarters

    // Toggle quarter selection
    const isSelected = selectedQuarters.some(sq => sq.quarter === quarter.quarter && sq.year === year);
    let newSelection: Array<{quarter: number, year: number}>;
    
    if (isSelected) {
      // Remove quarter
      newSelection = selectedQuarters.filter(q => !(q.quarter === quarter.quarter && q.year === year));
    } else {
      // Add quarter
      newSelection = [...selectedQuarters, quarterData];
    }
    
    onQuartersChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <Label>Select Quarters</Label>
      
      {isLoadingPaidQuarters ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="w-4 h-4" />
          <span>Loading paid quarters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {quarters.map((quarter) => {
            const year = getCurrentYearForQuarter(quarter.quarter);
            const isSelected = selectedQuarters.some(sq => sq.quarter === quarter.quarter && sq.year === year);
            const isPaid = paidQuarters.some(pq => pq.quarter === quarter.quarter && pq.year === year);

            return (
              <button
                key={quarter.label}
                type="button"
                onClick={() => handleQuarterToggle(quarter)}
                disabled={isPaid}
                className={`
                  p-3 rounded-md border text-sm transition-colors
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
                    ? `${quarter.label} is already paid`
                    : isSelected
                    ? `Click to deselect ${quarter.label}`
                    : `Click to select ${quarter.label}`
                }
              >
                {quarter.label}
              </button>
            );
          })}
        </div>
      )}
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      
      {paidQuarters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {paidQuarters.length} quarter(s) already paid (disabled)
        </p>
      )}
    </div>
  );
}
