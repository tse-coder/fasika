// src/helpers/paymentFormHelpers.ts

export const getAcademicYear = (date: Date = new Date()): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  return month >= 9 ? year : year - 1;
};

export const getCurrentQuarter = (date: Date = new Date()): number => {
  const month = date.getMonth() + 1;
  if (month >= 9 && month <= 11) return 1; // Sep-Nov
  if (month === 12 || month <= 2) return 2; // Dec-Feb
  if (month >= 3 && month <= 5) return 3;   // Mar-May
  return 4;                                 // Jun-Aug
};

export const getUpcomingQuarters = (
  count: number,
  paidQuarters: Array<{ quarter: number; year: number }>
): Array<{ quarter: number; year: number }> => {
  const paidSet = new Set(paidQuarters.map(q => `${q.year}-Q${q.quarter}`));
  const result: Array<{ quarter: number; year: number }> = [];
  let year = getAcademicYear();
  let quarter = getCurrentQuarter();

  while (result.length < count) {
    const key = `${year}-Q${quarter}`;
    if (!paidSet.has(key)) {
      result.push({ quarter, year });
    }
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }
  return result;
};

export const getUpcomingMonths = (
  count: number,
  paidMonths: Array<{ year: number; month: number }>
): string[] => {
  const paidSet = new Set(
    paidMonths.map(m => `${m.year}-${String(m.month).padStart(2, "0")}-01`)
  );
  const months: string[] = [];
  const cursor = new Date();
  cursor.setDate(1); // First day of current month

  while (months.length < count) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-01`;
    if (!paidSet.has(key)) {
      months.push(key);
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};

export const validatePaymentForm = (
  form: any,
  selectedChild: any,
  selectedQuarters: Array<{ quarter: number; year: number }>,
  selectedMonths: string[]
) => {
  const newErrors: Record<string, string> = {};

  if (!form.category) {
    newErrors.category = "Please select a payment type";
  }
  if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
    newErrors.totalAmount = "Please enter a valid amount";
  }
  if (!form.method) {
    newErrors.method = "Please select a payment method";
  }
  if (form.notes && form.notes.length > 255) {
    newErrors.notes = "Notes must be 255 characters or less";
  }
  if (form.category === "monthly" && selectedMonths.length === 0) {
    newErrors.selectedMonths = "Please select at least one month";
  }
  if (form.category === "quarterly" && selectedQuarters.length === 0) {
    newErrors.selectedMonths = "Please select at least one quarter";
  }

  return newErrors;
};

export const handleChildError = (
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  return (error: string) => {
    setErrors(prev => ({ ...prev, child: error }));
  };
};

export const handleMonthQuarterError = (
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  return (error: string) => {
    setErrors(prev => ({ ...prev, selectedMonths: error }));
  };
};

export const handleQuartersChange = (
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setSelectedQuarters: React.Dispatch<React.SetStateAction<Array<{ quarter: number; year: number }>>>
) => {
  return (quarters: Array<{ quarter: number; year: number }>) => {
    setSelectedQuarters(quarters);
    setErrors(prev => {
      const { selectedMonths, ...rest } = prev;
      return rest;
    });
  };
};