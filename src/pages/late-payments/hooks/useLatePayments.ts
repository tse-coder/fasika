import { useState, useEffect } from "react";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "@/hooks/use-toast";
import { fetchLatePayments, fetchExpiringPayments } from "@/api/payment.api";
// import { fetchLatePayments, fetchExpiringPayments } from "@/mock/payment.mock";

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
 * Fetches children with unpaid payments using backend API endpoints
 */
export const useLatePayments = (lateRange: LateRange, showExpiring: boolean) => {
  const { currentBranch } = useBranchStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [latePayments, setLatePayments] = useState<LatePaymentChild[]>([]);

  useEffect(() => {
    const loadLatePayments = async () => {
      setIsLoading(true);
      try {
        let data: LatePaymentChild[] = [];

        if (showExpiring) {
          // Fetch payments expiring in 10 days
          data = await fetchExpiringPayments({ branch: currentBranch });
        } else {
          // Fetch late payments by month range
          data = await fetchLatePayments({ 
            months: lateRange as "1" | "2" | "3" | "3+", 
            branch: currentBranch 
          });
        }

        // Sort by months late (most late first) for late payments
        if (!showExpiring) {
          data.sort((a, b) => b.monthsLate - a.monthsLate);
        }
        
        setLatePayments(data);
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
  }, [lateRange, showExpiring, toast, currentBranch]);

  return {
    latePayments,
    isLoading,
  };
};
