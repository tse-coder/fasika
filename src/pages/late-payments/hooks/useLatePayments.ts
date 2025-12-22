import { useState, useEffect } from "react";
import { useChildren } from "@/stores/children.store";
import { useBranchStore } from "@/stores/branch.store";
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

export type LateRange = "1" | "2" | "3" | "3+" | "expiring";

/**
 * Custom hook to manage late payments data
 * Fetches children with unpaid months from September to June and filters by late range or expiring status
 */
export const useLatePayments = (lateRange: LateRange, showExpiring: boolean) => {
  const { fetchChildren } = useChildren();
  const { currentBranch } = useBranchStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [latePayments, setLatePayments] = useState<LatePaymentChild[]>([]);

  useEffect(() => {
    const loadLatePayments = async () => {
      setIsLoading(true);
      try {
        // Fetch all active children for current branch
        const allChildren = await fetchChildren({ limit: 1000, branch: currentBranch });
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

            // Find unpaid months from September to June
            const unpaidMonths = monthsToCheck.filter(
              (month) => !paidMonthSet.has(month)
            );

            if (showExpiring) {
              // Determine next due date based on latest paid month
              const paid = await fetchPaidMonths(child.id);
              const paidMonths = paid || [];

              // find latest paid month
              const latest = paidMonths.reduce((acc, pm) => {
                const d = new Date(pm.year, pm.month - 1, 1);
                return !acc || d > acc ? d : acc;
              }, null as Date | null);

              let nextDue: Date | null = null;
              if (latest) {
                nextDue = new Date(latest.getFullYear(), latest.getMonth() + 1, 1);
              } else if (unpaidMonths.length > 0) {
                // if no paid months, take the first unpaid month as next due
                nextDue = new Date(unpaidMonths[0]);
              }

              if (nextDue) {
                const now = new Date();
                const diffMs = nextDue.getTime() - now.getTime();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 10) {
                  lateChildren.push({
                    id: child.id,
                    fname: child.fname,
                    lname: child.lname,
                    gender: child.gender,
                    birthdate: child.birthdate,
                    monthlyFee: child.monthlyFee,
                    monthsLate: 0,
                    unpaidMonths,
                  });
                }
              }
            } else {
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
  }, [lateRange, showExpiring, fetchChildren, toast, currentBranch]);

  return {
    latePayments,
    isLoading,
  };
};
