/**
 * Utility functions for late payments calculations
 */

/**
 * Get all months from January of current year up to current month
 * Returns array of ISO date strings in format "YYYY-MM-01"
 */
export const getMonthsFromJanuaryToNow = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 11 = December)

  // Start from January (month 0) of current year
  for (let month = 0; month <= currentMonth; month++) {
    const date = new Date(currentYear, month, 1);
    const monthStr = `${date.getFullYear()}-${String(month + 1).padStart(
      2,
      "0"
    )}-01`;
    months.push(monthStr);
  }

  return months;
};

/**
 * Calculate how many months late a payment is
 * Compares the unpaid month date to the current date
 */
export const calculateMonthsLate = (unpaidMonthDate: string): number => {
  const unpaidDate = new Date(unpaidMonthDate);
  const now = new Date();

  const monthsDiff =
    (now.getFullYear() - unpaidDate.getFullYear()) * 12 +
    (now.getMonth() - unpaidDate.getMonth());

  return monthsDiff;
};

/**
 * Format a month string to readable format (e.g., "Jan 2024")
 */
export const formatMonth = (monthStr: string): string => {
  const date = new Date(monthStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

/**
 * Filter late payments based on the selected range
 * Range options: "1" (1 month), "2" (2 months), "3" (3 months), "3+" (more than 3 months)
 */
export const matchesLateRange = (
  monthsLate: number,
  range: "1" | "2" | "3" | "3+"
): boolean => {
  if (range === "3+") {
    return monthsLate > 3;
  }

  const rangeNum = parseInt(range);
  // For exact ranges, show children who are exactly that many months late
  // or slightly more (to account for partial months)
  return monthsLate >= rangeNum && monthsLate < rangeNum + 1;
};
