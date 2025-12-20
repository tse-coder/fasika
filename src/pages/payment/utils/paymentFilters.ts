import { Payment } from "@/types/payment.types";
import { Child } from "@/types/child.types";

/**
 * Get child name from children array
 */
export const getChildName = (childId: number, children: Child[]): string => {
  const child = children.find((c) => c.id === childId);
  return child ? `${child.fname} ${child.lname}` : "Unknown";
};

/**
 * Filter payments based on search query, selected children, and payment method
 */
export const filterPayments = (
  payments: Payment[],
  search: string,
  selectedChildren: Child[],
  selectedMethod: string,
  children: Child[]
): Payment[] => {
  return payments.filter((p) => {
    // Filter by selected children (if multiple selected, show all)
    if (selectedChildren.length > 0) {
      const isSelected = selectedChildren.some((c) => c.id === p.child_id);
      if (!isSelected) return false;
    }

    // Filter by payment method
    if (selectedMethod !== "all" && p.method !== selectedMethod) {
      return false;
    }

    // Filter by search query
    if (search.trim()) {
      const childName = getChildName(p.child_id, children).toLowerCase();
      const searchLower = search.toLowerCase();
      return (
        childName.includes(searchLower) ||
        p.method.toLowerCase().includes(searchLower) ||
        parseFloat(p.total_amount).toString().includes(searchLower) ||
        (p.notes && p.notes.toLowerCase().includes(searchLower)) ||
        p.monthly_records.some((mr) =>
          new Date(mr.month)
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchLower)
        )
      );
    }

    return true;
  });
};
