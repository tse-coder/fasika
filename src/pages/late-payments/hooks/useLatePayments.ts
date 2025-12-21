import { useState, useEffect } from "react";
import { useChildren } from "@/stores/children.store";
import { useToast } from "@/hooks/use-toast";
import {
  getMonthsFromJanuaryToNow,
  calculateMonthsLate,
  matchesLateRange,
} from "../utils/latePaymentsUtils";
import { fetchPaidMonths } from "@/mock/payment.mock";

export interface LatePaymentChild {
  id: number;
  fname: string;
  lname: string;
  gender: string;
  birthdate: string;
  monthlyFee?: number;
  monthsLate: number;
  unpaidMonths: string[];
  parents?: Array<{ id: number; email: string; fname: string; lname: string }>;
}

export type LateRange = "1" | "2" | "3" | "3+";

/**
 * Custom hook to manage late payments data
 * Fetches children with unpaid months from January to now and filters by late range
 */
export const useLatePayments = (lateRange: LateRange) => {
  const { fetchChildren } = useChildren();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [latePayments, setLatePayments] = useState<LatePaymentChild[]>([]);

  useEffect(() => {
    const loadLatePayments = async () => {
      setIsLoading(true);
      try {
        // Fetch all active children
        const allChildren = await fetchChildren({ limit: 1000 });
        const childrenArray = Array.isArray(allChildren)
          ? allChildren
          : (allChildren as any).data || [];

        const activeChildren = childrenArray.filter(
          (c: any) => c.is_active === true
        );

        // Get months from January of current year to now
        const monthsToCheck = getMonthsFromJanuaryToNow();
        const lateChildren: LatePaymentChild[] = [];

        // Check each child for unpaid months
        for (const child of activeChildren) {
          try {
            // Fetch paid months for this child
            const paidMonths = await fetchPaidMonths(child.id);
            const paidMonthSet = new Set(
              paidMonths.map(
                (pm) => `${pm.year}-${String(pm.month).padStart(2, "0")}-01`
              )
            );

            // Find unpaid months from January to now
            const unpaidMonths = monthsToCheck.filter(
              (month) => !paidMonthSet.has(month)
            );

            if (unpaidMonths.length > 0) {
              // Calculate months late from the oldest unpaid month
              const oldestUnpaid = unpaidMonths[0];
              const monthsDiff = calculateMonthsLate(oldestUnpaid);

              // Filter by the selected late range
              if (matchesLateRange(monthsDiff, lateRange)) {
                lateChildren.push({
                  id: child.id,
                  fname: child.fname,
                  lname: child.lname,
                  gender: child.gender,
                  birthdate: child.birthdate,
                  monthlyFee: child.monthlyFee,
                  monthsLate: monthsDiff,
                  unpaidMonths,
                });
              }
            }
          } catch (err) {
            console.error(
              `Error fetching paid months for child ${child.id}:`,
              err
            );
          }
        }

        // Sort by months late (most late first)
        lateChildren.sort((a, b) => b.monthsLate - a.monthsLate);
        setLatePayments(lateChildren);
      } catch (err) {
        console.error("Error loading late payments:", err);
        toast({
          title: "Error",
          description: "Failed to load late payments.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLatePayments();
  }, [lateRange, fetchChildren, toast]);

  return {
    latePayments,
    isLoading,
  };
};
