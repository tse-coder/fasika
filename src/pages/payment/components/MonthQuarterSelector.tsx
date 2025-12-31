import { Label } from "@/components/ui/label";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { PaidMonth } from "@/types/payment.types";

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

interface MonthQuarterSelectorProps {
  selectedChild: any;
  selectedMonths: string[];
  onMonthsChange: (months: string[]) => void;
  paidMonths: PaidMonth[];
  isLoadingPaidMonths: boolean;
  currentBranch: string;
  error?: string;
}

export function MonthQuarterSelector({
  selectedChild,
  selectedMonths,
  onMonthsChange,
  paidMonths,
  isLoadingPaidMonths,
  currentBranch,
  error,
}: MonthQuarterSelectorProps) {
  const currentYear = new Date().getFullYear();

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
    
    onMonthsChange(newSelectedMonths);
  };

  const handleQuarterToggle = (quarter: {
    label: string;
    months: string[];
    year: number;
  }) => {
    const newSelectedMonths = [...selectedMonths];
    
    quarter.months.forEach((month) => {
      const monthKey = `${quarter.year}-${month.padStart(2, "0")}-01`;
      const monthIndex = parseInt(month) - 1;
      const isPaid = isMonthPaid(monthIndex, quarter.year);
      
      if (!isPaid) {
        const isQuarterSelected = quarter.months.every((m) => {
          const mKey = `${quarter.year}-${m.padStart(2, "0")}-01`;
          return selectedMonths.includes(mKey);
        });

        if (isQuarterSelected) {
          // Deselect all months in quarter
          const index = newSelectedMonths.indexOf(monthKey);
          if (index > -1) newSelectedMonths.splice(index, 1);
        } else {
          // Select all months in quarter
          if (!newSelectedMonths.includes(monthKey)) {
            newSelectedMonths.push(monthKey);
          }
        }
      }
    });
    
    onMonthsChange(newSelectedMonths);
  };

  if (!selectedChild) return null;

  // Check if current branch should use quarters
  const shouldUseQuarters = currentBranch === "pre school summit";

  return (
    <div className="space-y-2">
      <Label>
        {shouldUseQuarters ? "Select Quarters" : "Select Months"}
      </Label>
      
      {isLoadingPaidMonths ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="w-4 h-4" />
          <span>Loading paid months...</span>
        </div>
      ) : shouldUseQuarters ? (
        // Quarterly selection for pre school summit branch
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Q1 (Sep-Nov)",
              months: ["09", "10", "11"],
              year: currentYear - 1,
            },
            {
              label: "Q2 (Dec-Feb)",
              months: ["12", "01", "02"],
              year: currentYear - 1,
            },
            {
              label: "Q3 (Mar-May)",
              months: ["03", "04", "05"],
              year: currentYear,
            },
            {
              label: "Q4 (Jun-Aug)",
              months: ["06", "07", "08"],
              year: currentYear,
            },
          ].map((quarter) => {
            const isQuarterSelected = quarter.months.every((month) => {
              const monthKey = `${quarter.year}-${month.padStart(2, "0")}-01`;
              return selectedMonths.includes(monthKey);
            });

            const isQuarterPaid = quarter.months.some((month) => {
              const monthIndex = parseInt(month) - 1;
              const year = quarter.year;
              return isMonthPaid(monthIndex, year);
            });

            return (
              <button
                key={quarter.label}
                type="button"
                onClick={() => handleQuarterToggle(quarter)}
                disabled={isQuarterPaid}
                className={`
                  p-3 rounded-md border text-sm transition-colors
                  ${
                    isQuarterPaid
                      ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                      : isQuarterSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent border-border"
                  }
                `}
                title={
                  isQuarterPaid
                    ? `${quarter.label} is already paid`
                    : isQuarterSelected
                    ? `Click to deselect ${quarter.label}`
                    : `Click to select ${quarter.label}`
                }
              >
                {quarter.label}
              </button>
            );
          })}
        </div>
      ) : (
        // Monthly selection for other branches
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
