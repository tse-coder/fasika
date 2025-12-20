import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import { Child } from "@/types/child.types";

/**
 * Custom hook to manage payments data fetching and filtering
 */
export const usePaymentsData = () => {
  const [searchParams] = useSearchParams();
  const { children, fetchChildren } = useChildren();
  const {
    payments,
    pagination,
    fetchPayments,
    isLoading: paymentsLoading,
  } = usePayments();
  const [page, setPage] = useState(1);
  const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  // Load children and payments on mount
  useEffect(() => {
    fetchChildren({ page: 1, limit: 100 });
  }, [fetchChildren]);

  // Load payments when filters change
  const loadPayments = async () => {
    const filters: any = {
      page,
      limit: 20,
      order: "desc",
    };

    if (selectedChildren.length === 1) {
      filters.child_id = selectedChildren[0].id;
    }

    await fetchPayments(filters);
  };

  useEffect(() => {
    loadPayments();
  }, [page, selectedChildren]);

  // Initialize selected children from URL param if present
  useEffect(() => {
    const childParam = searchParams.get("child");
    if (childParam && children.length > 0) {
      const child = children.find((c) => String(c.id) === childParam);
      if (child && !selectedChildren.some((c) => c.id === child.id)) {
        setSelectedChildren([child]);
      }
    }
  }, [searchParams, children]);

  // Fetch missing children when payments are loaded
  useEffect(() => {
    if (payments.length > 0 && children.length > 0) {
      const paymentChildIds = new Set(payments.map((p) => p.child_id));
      const loadedChildIds = new Set(children.map((c) => c.id));
      const missingIds = Array.from(paymentChildIds).filter(
        (id) => !loadedChildIds.has(id)
      );

      if (missingIds.length > 0) {
        fetchChildren({ page: 1, limit: 200 });
      }
    }
  }, [payments, children, fetchChildren]);

  const handleSelectChild = (child: Child) => {
    if (!selectedChildren.some((c) => c.id === child.id)) {
      setSelectedChildren([...selectedChildren, child]);
    }
  };

  const handleRemoveChild = (childId: number) => {
    setSelectedChildren(selectedChildren.filter((c) => c.id !== childId));
  };

  return {
    payments,
    pagination,
    children,
    page,
    setPage,
    selectedChildren,
    selectedMethod,
    setSelectedMethod,
    isLoading: paymentsLoading,
    loadPayments,
    handleSelectChild,
    handleRemoveChild,
  };
};
