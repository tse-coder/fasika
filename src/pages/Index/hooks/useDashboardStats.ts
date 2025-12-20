import { useEffect } from "react";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";

export interface DashboardStats {
  totalChildren: number;
  activeChildren: number;
  totalCollected: number;
  expectedTotal: number;
  collectionRate: number;
}

/**
 * Custom hook to fetch and calculate dashboard statistics
 */
export const useDashboardStats = () => {
  const { children, fetchChildren } = useChildren();
  const { payments, fetchPayments } = usePayments();

  // Fetch children and payments on mount
  useEffect(() => {
    fetchChildren();
    fetchPayments({ limit: 1000 });
  }, [fetchChildren, fetchPayments]);

  // Calculate stats for current month
  const stats: DashboardStats = (() => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    // Filter payments for this month
    const thisMonthPayments = payments.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return (
        paymentDate.getMonth() === thisMonth &&
        paymentDate.getFullYear() === thisYear
      );
    });

    // Calculate total collected this month
    const totalCollected = thisMonthPayments.reduce(
      (sum, p) => sum + parseFloat(p.total_amount),
      0
    );

    // Calculate expected total from active children's monthly fees
    const expectedTotal = children
      .filter((c) => c.is_active)
      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0);

    // Calculate collection rate percentage
    const collectionRate =
      expectedTotal > 0 ? (totalCollected / expectedTotal) * 100 : 0;

    return {
      totalChildren: children.length,
      activeChildren: children.filter((c) => c.is_active).length,
      totalCollected,
      expectedTotal,
      collectionRate,
    };
  })();

  return { stats };
};
