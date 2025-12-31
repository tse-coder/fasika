import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import { useBranchStore } from "@/stores/branch.store";
import { usePaymentInfoStore } from "@/stores/paymentInfo.store";
import type { Child } from "@/types/child.types";
import type { PaidMonth, PaymentsPaginated } from "@/types/payment.types";
import { fetchPayments } from "@/api/payment.api";
import { Branch } from "@/types/api.types";
import { ChildSelection } from "../components/ChildSelection";
import { PaymentTypeSelector, PaymentCategory } from "../components/PaymentTypeSelector";
import { AmountInput } from "../components/AmountInput";
import { MonthSelector } from "../components/MonthSelector";
import { QuarterSelector } from "../components/QuarterSelector";
import { PaymentMethod } from "../components/PaymentMethod";
import { PaymentNotes } from "../components/PaymentNotes";
import { FormProvider } from "react-hook-form";

interface PaymentFormProps {
  onSubmit: (data: {
    child_id: string;
    total_amount: number;
    months?: string[];
    quarters?: Array<{quarter: number, year: number}>;
    method: string;
    notes?: string;
    branch?: string;
    category?: PaymentCategory;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = ["Cash", "CBE", "Dashen Bank"];

export function PaymentForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: PaymentFormProps) {
  const { fetchChildren, isLoading: childrenLoading } = useChildren();
  const { fetchPaidMonths } = usePayments();
  const { currentBranch } = useBranchStore();
  const { data: paymentInfo, load: loadPaymentInfo } = usePaymentInfoStore();

  const [childSearch, setChildSearch] = useState("");
  const [debouncedChildSearch, setDebouncedChildSearch] = useState("");
  const [childList, setChildList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [paidMonths, setPaidMonths] = useState<PaidMonth[]>([]);
  const [isLoadingPaidMonths, setIsLoadingPaidMonths] = useState(false);
  const [childPage, setChildPage] = useState(1);
  const [isLoadingMoreChildren, setIsLoadingMoreChildren] = useState(false);
  const [hasRegistrationPaid, setHasRegistrationPaid] = useState<
    boolean | null
  >(null); // null = not checked yet
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);

  const [selectedQuarters, setSelectedQuarters] = useState<Array<{quarter: number, year: number}>>([]);
  const [paidQuarters, setPaidQuarters] = useState<Array<{quarter: number, year: number}>>([]);
  const [isLoadingPaidQuarters, setIsLoadingPaidQuarters] = useState(false);

  const [form, setForm] = useState({
    totalAmount: "",
    selectedMonths: [] as string[],
    method: "",
    notes: "",
    category: "" as PaymentCategory,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const debounceTimer = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  // Ensure payment info available for autofill
  useEffect(() => {
    if (!paymentInfo) {
      loadPaymentInfo();
    }
  }, [paymentInfo, loadPaymentInfo]);

  // Debounce child search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      setDebouncedChildSearch(childSearch.trim());
      setChildPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [childSearch]);

  // Fetch children when search changes
  useEffect(() => {
    let cancelled = false;
    const loadChildren = async () => {
      try {
        const params =
          debouncedChildSearch.trim().length > 0
            ? { query: debouncedChildSearch.trim(), branch: currentBranch }
            : { page: childPage, branch: currentBranch };

        const data = (await fetchChildren(params)) || [];
        if (cancelled) return;

        setChildList((prev) =>
          childPage === 1
            ? data
            : [...prev, ...data.filter((c) => !prev.some((p) => p.id === c.id))]
        );
        setIsLoadingMoreChildren(false);
      } catch (err) {
        console.error("[PaymentForm] Failed to fetch children", err);
        setIsLoadingMoreChildren(false);
      }
    };

    loadChildren();
    return () => {
      cancelled = true;
    };
  }, [debouncedChildSearch, childPage, fetchChildren, currentBranch]);

  // Fetch paid months when child is selected
  useEffect(() => {
    if (!selectedChild) {
      setPaidMonths([]);
      setHasRegistrationPaid(null);
      return;
    }

    setIsLoadingPaidMonths(true);
    fetchPaidMonths(selectedChild.id)
      .then((months) => {
        setPaidMonths(months);
      })
      .catch((err) => {
        console.error("[PaymentForm] Failed to fetch paid months", err);
        setPaidMonths([]);
      })
      .finally(() => {
        setIsLoadingPaidMonths(false);
      });
    setIsCheckingRegistration(true);
    fetchPayments({
      child_id: selectedChild.id,
      limit: 50, // enough to find registration payment
      order: "desc",
    })
      .then((paginated: PaymentsPaginated) => {
        const payments = paginated.data;
        const hasRegPayment = payments.some(
          (p) => p.category === "registration"
        );
        setHasRegistrationPaid(hasRegPayment);
      })
      .catch((err) => {
        console.error(
          "[PaymentForm] Failed to check registration payment",
          err
        );
        setHasRegistrationPaid(false); // assume not paid on error
      })
      .finally(() => setIsCheckingRegistration(false));
  }, [selectedChild, fetchPaidMonths]);

  const registrationFee = useMemo(() => {
    if (!paymentInfo || !selectedChild) return 0;
    const match = paymentInfo.registration.find(
      (r) => r.program === (selectedChild.program || "kindergarten")
    );
    return match?.newFee || 0;
  }, [paymentInfo, selectedChild]);

  const recurringInfo = useMemo(() => {
    if (!paymentInfo || !selectedChild) return null;
    return (
      paymentInfo.recurring.find(
        (r) =>
          r.branch === (selectedChild.branch || currentBranch) &&
          r.program === (selectedChild.program || "kindergarten")
      ) || null
    );
  }, [paymentInfo, selectedChild, currentBranch]);

  const discountPercent = useMemo(() => {
    return (
      selectedChild?.discountPercent ?? recurringInfo?.discountPercent ?? 0
    );
  }, [selectedChild, recurringInfo]);

  const recurringAmount = useMemo(() => {
    const base = recurringInfo?.amount || 0;
    const discounted = base - (base * discountPercent) / 100;
    return discounted > 0 ? discounted : 0;
  }, [recurringInfo, discountPercent]);

  const isChildNew = useMemo(() => {
    if (!selectedChild) return false;
    const currentYear = new Date().getFullYear();
    return (
      !selectedChild.registerationYear ||
      selectedChild.registerationYear >= currentYear
    );
  }, [selectedChild]);

  const isChildOld = useMemo(() => {
    if (!selectedChild) return false;
    const currentYear = new Date().getFullYear();
    return (
      selectedChild.registerationYear &&
      selectedChild.registerationYear < currentYear
    );
  }, [selectedChild]);

  const getUpcomingMonths = useCallback(
    (count: number) => {
      const paidKeys = new Set(
        paidMonths.map(
          (m) => `${m.year}-${String(m.month).padStart(2, "0")}-01`
        )
      );
      const months: string[] = [];
      const cursor = new Date();
      cursor.setDate(1);
      while (months.length < count) {
        const key = `${cursor.getFullYear()}-${String(
          cursor.getMonth() + 1
        ).padStart(2, "0")}-01`;
        if (!paidKeys.has(key)) {
          months.push(key);
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return months;
    },
    [paidMonths]
  );

  // Prefill form when child/payment info/paid months change
  useEffect(() => {
    if (!selectedChild || !paymentInfo || !form.category) return;

    const needsRegistration =
      hasRegistrationPaid === null
        ? selectedChild.registrationPaid === false // old fallback
        : !hasRegistrationPaid; // true if NO registration payment found

    let amount = "";
    let nextMonths: string[] = [];

    if (needsRegistration && form.category === "registration") {
      amount = registrationFee ? registrationFee.toString() : "";
      nextMonths = [];
    } else if (form.category === "quarterly")  {
        amount = recurringAmount ? recurringAmount.toString() : "";
        nextMonths = getUpcomingMonths(3);
      } else {
        // Monthly payments
        nextMonths = getUpcomingMonths(1);
        amount = (recurringAmount || 0).toString();
      
    }
    // For therapy, after school, and other - don't auto-fill amount

    setForm((prev) => ({
      ...prev,
      totalAmount: amount,
      selectedMonths: nextMonths,
    }));
    setErrors({});
  }, [
    selectedChild,
    paymentInfo,
    paidMonths,
    registrationFee,
    recurringAmount,
    recurringInfo,
    getUpcomingMonths,
    hasRegistrationPaid,
    form.category,
  ]);

  // Update amount when months change for recurring payments
  useEffect(() => {
    if (form.category !== "quarterly" && form.category !== "monthly" || !selectedChild) return;
    
    let amount = "";
    if (recurringInfo?.schedule === "quarterly") {
      // For quarterly, charge the quarterly fee regardless of how many months selected
      amount = recurringAmount ? recurringAmount.toString() : "";
    } else {
      // For monthly, charge per month selected
      amount = ((recurringAmount || 0) * Math.max(form.selectedMonths.length || 1, 1)).toString();
    }
    
    if (form.totalAmount !== amount) {
      setForm((prev) => ({
        ...prev,
        totalAmount: amount,
      }));
    }
  }, [form.selectedMonths, form.category, recurringAmount, recurringInfo, selectedChild]);

  const handleQuartersChange = (quarters: Array<{quarter: number, year: number}>) => {
    setSelectedQuarters(quarters);
    
    // Clear error when selection changes
    if (errors.selectedMonths) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selectedMonths;
        return newErrors;
      });
    }
  };

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setChildSearch("");
    setChildList([]);
    setSelectedQuarters([]); // Reset quarter selection when child changes
  };

  const handleLoadMoreChildren = () => {
    if (fetchingRef.current || childrenLoading) return;
    fetchingRef.current = true;
    setIsLoadingMoreChildren(true);
    setChildPage((p) => p + 1);
  };

  const handleScroll = () => {
    if (fetchingRef.current || childrenLoading) return;
    const el = listRef.current;
    if (!el) return;
    const threshold = 120;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      handleLoadMoreChildren();
    }
  };

  // Check if current branch should use quarters based on branch name
  const shouldUseQuarters = useMemo(() => {
    if (!selectedChild || !currentBranch) return false;
    return currentBranch === "pre school summit";
  }, [selectedChild, currentBranch]);

  // Error handlers for child components
  const handleChildError = (error: string) => {
    setErrors(prev => ({ ...prev, child: error }));
  };

  const handleMonthQuarterError = (error: string) => {
    setErrors(prev => ({ ...prev, selectedMonths: error }));
  };

  const validateForm = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedChild || !form.category) return;

    try {
      await onSubmit({
        child_id: selectedChild.id,
        total_amount: parseFloat(form.totalAmount),
        // Handle months based on category
        months: (() => {
          switch (form.category) {
            case "registration":
              return ["1970-01-01"]; // Required for registration
            case "monthly":
              return form.selectedMonths; // Selected months for monthly payments
            case "quarterly":
            case "therapy":
            case "afterschool":
            case "other":
            default:
              return undefined; // No months needed for these categories
          }
        })(),
        // Handle quarters only for quarterly payments
        quarters: form.category === "quarterly" ? selectedQuarters : undefined,
        method: form.method,
        notes: form.notes.trim() || undefined,
        category: form.category,
        branch: currentBranch,
      });
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChildSelection
        childSearch={childSearch}
        onChildSearchChange={setChildSearch}
        childList={childList}
        selectedChild={selectedChild}
        onSelectChild={handleSelectChild}
        childrenLoading={childrenLoading}
        isLoadingMoreChildren={isLoadingMoreChildren}
        onLoadMoreChildren={handleLoadMoreChildren}
        error={errors.child}
        listRef={listRef}
        onScroll={handleScroll}
        isChildNew={isChildNew}
        isChildOld={isChildOld}
        isLoadingPaidMonths={isLoadingPaidMonths}
        onError={handleChildError}
      />

      {selectedChild && (
        <>
          {/* Show payment type selector for all cases */}
          <PaymentTypeSelector
            selectedCategory={form.category}
            onCategoryChange={(category) => {
              setForm((prev) => ({ ...prev, category }));
              if (errors.selectedMonths) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.selectedMonths;
                  return newErrors;
                });
              }
            }}
            hasRegistrationPaid={hasRegistrationPaid}
            isCheckingRegistration={isCheckingRegistration}
            selectedChild={selectedChild}
            registrationFee={registrationFee}
            recurringInfo={recurringInfo}
            getUpcomingMonths={getUpcomingMonths}
            discountPercent={discountPercent}
            currentBranch={currentBranch}
          />

          {/* Show form inputs only when payment type is selected */}
          {form.category && (
            <>
              <AmountInput
                amount={form.totalAmount}
                onAmountChange={(value) => {
                  setForm({ ...form, totalAmount: value });
                  if (errors.totalAmount) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.totalAmount;
                      return newErrors;
                    });
                  }
                }}
                error={errors.totalAmount}
                selectedChild={selectedChild}
                selectedCategory={form.category}
                isAutoFilled={form.category === "registration" || form.category === "monthly" || form.category === "quarterly"}
              />

              {/* Show month/quarter selector only for recurring payments */}
              {(form.category === "quarterly" || form.category === "monthly") && (
                shouldUseQuarters ? (
                  <QuarterSelector
                    selectedChild={selectedChild}
                    onQuartersChange={handleQuartersChange}
                    paidQuarters={paidQuarters}
                    isLoadingPaidQuarters={isLoadingPaidQuarters}
                    selectedQuarters={selectedQuarters}
                    error={errors.selectedQuarters}
                    onError={handleMonthQuarterError}
                  />
                ) : (
                  <MonthSelector
                    selectedChild={selectedChild}
                    selectedMonths={form.selectedMonths}
                    onMonthsChange={(months,amount) => {
                      setForm((prev) => ({ ...prev, selectedMonths: months,totalAmount: String(amount) }));
                    }}
                    paidMonths={paidMonths}
                    isLoadingPaidMonths={isLoadingPaidMonths}
                    error={errors.selectedMonths}
                    onError={handleMonthQuarterError}
                  />
                )
              )}

              <PaymentMethod
                method={form.method}
                onMethodChange={(value) => {
                  setForm({ ...form, method: value });
                  if (errors.method) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.method;
                      return newErrors;
                    });
                  }
                }}
                error={errors.method}
                selectedChild={selectedChild}
              />

              <PaymentNotes
                notes={form.notes}
                onNotesChange={(value) => {
                  setForm({ ...form, notes: value });
                  if (errors.notes) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.notes;
                      return newErrors;
                    });
                  }
                }}
                error={errors.notes}
                selectedChild={selectedChild}
              />
            </>
          )}
        </>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading || !selectedChild || !form.category}>
          {isLoading ? (
            <>
              <LoaderIcon className="w-4 h-4 mr-2" />
              Processing...
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </div>
    </form>
  );
}
