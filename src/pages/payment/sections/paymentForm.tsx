// PaymentForm.tsx

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import { useBranchStore } from "@/stores/branch.store";
import { usePaymentInfoStore } from "@/stores/paymentInfo.store";
import type { Child } from "@/types/child.types";
import type { PaidMonth, PaymentsPaginated } from "@/types/payment.types";
import { fetchPayments } from "@/api/payment.api";

import { ChildSelection } from "../components/ChildSelection";
import { PaymentTypeSelector, PaymentCategory } from "../components/PaymentTypeSelector";
import { AmountInput } from "../components/AmountInput";
import { MonthSelector } from "../components/MonthSelector";
import { QuarterSelector } from "../components/QuarterSelector";
import { PaymentMethod } from "../components/PaymentMethod";
import { PaymentNotes } from "../components/PaymentNotes";

import {
  getUpcomingQuarters,
  getUpcomingMonths,
  validatePaymentForm,
  handleChildError,
  handleMonthQuarterError,
  handleQuartersChange,
} from "../helpers/paymentFormHelpers";

interface PaymentFormProps {
  onSubmit: (data: {
    child_id: string;
    total_amount: number;
    months?: string[];
    quarters?: Array<{ quarter: number; year: number }>;
    method: string;
    notes?: string;
    branch?: string;
    category?: PaymentCategory;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: PaymentFormProps) {
  const { fetchChildren, isLoading: childrenLoading } = useChildren();
  const { fetchPaidMonths, fetchPaidQuarters } = usePayments();
  const { currentBranch } = useBranchStore();
  const { data: paymentInfo, load: loadPaymentInfo } = usePaymentInfoStore();

  const [childSearch, setChildSearch] = useState("");
  const [debouncedChildSearch, setDebouncedChildSearch] = useState("");
  const [childList, setChildList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [paidMonths, setPaidMonths] = useState<PaidMonth[]>([]);
  const [paidQuarters, setPaidQuarters] = useState<Array<{ quarter: number; year: number }>>([]);
  const [isLoadingPaidMonths, setIsLoadingPaidMonths] = useState(false);
  const [isLoadingPaidQuarters, setIsLoadingPaidQuarters] = useState(false);
  const [hasRegistrationPaid, setHasRegistrationPaid] = useState<boolean | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [selectedQuarters, setSelectedQuarters] = useState<Array<{ quarter: number; year: number }>>([]);
  const [childPage, setChildPage] = useState(1);
  const [isLoadingMoreChildren, setIsLoadingMoreChildren] = useState(false);

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

  // Load payment info
  useEffect(() => {
    if (!paymentInfo) loadPaymentInfo();
  }, [paymentInfo, loadPaymentInfo]);

  // Debounce search
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

  // Fetch children
  useEffect(() => {
    let cancelled = false;
    const loadChildren = async () => {
      try {
        const params = debouncedChildSearch.trim()
          ? { query: debouncedChildSearch.trim(), branch: currentBranch }
          : { page: childPage, branch: currentBranch };
        const data = (await fetchChildren(params)) || [];
        if (cancelled) return;
        setChildList(prev =>
          childPage === 1 ? data : [...prev, ...data.filter(c => !prev.some(p => p.id === c.id))]
        );
        setIsLoadingMoreChildren(false);
      } catch (err) {
        console.error("[PaymentForm] Failed to fetch children", err);
        setIsLoadingMoreChildren(false);
      }
    };
    loadChildren();
    return () => { cancelled = true; };
  }, [debouncedChildSearch, childPage, fetchChildren, currentBranch]);

  // Fetch paid data + registration check
  useEffect(() => {
    if (!selectedChild) {
      setPaidMonths([]);
      setPaidQuarters([]);
      setHasRegistrationPaid(null);
      setSelectedQuarters([]);
      return;
    }

    setIsLoadingPaidMonths(true);
    fetchPaidMonths(selectedChild.id)
      .then(setPaidMonths)
      .catch(() => setPaidMonths([]))
      .finally(() => setIsLoadingPaidMonths(false));

    setIsLoadingPaidQuarters(true);
    fetchPaidQuarters(selectedChild.id)
      .then(setPaidQuarters)
      .catch(() => setPaidQuarters([]))
      .finally(() => setIsLoadingPaidQuarters(false));

    setIsCheckingRegistration(true);
    fetchPayments({ child_id: selectedChild.id, limit: 50, order: "desc" })
      .then((paginated: PaymentsPaginated) => {
        setHasRegistrationPaid(paginated.data.some(p => p.category === "registration"));
      })
      .catch(() => setHasRegistrationPaid(false))
      .finally(() => setIsCheckingRegistration(false));
  }, [selectedChild, fetchPaidMonths, fetchPaidQuarters]);

  // Computed values
  const registrationFee = useMemo(() => {
    if (!paymentInfo || !selectedChild) return 0;
    const match = paymentInfo.registration.find(r => r.program === (selectedChild.program || "kindergarten"));
    return match?.newFee || 0;
  }, [paymentInfo, selectedChild]);

  const recurringInfo = useMemo(() => {
    if (!paymentInfo || !selectedChild) return null;
    return (
      paymentInfo.recurring.find(
        (r: any) =>
          r.branch === (selectedChild.branch || currentBranch) &&
          r.program === (selectedChild.program || "kindergarten")
      ) || null
    );
  }, [paymentInfo, selectedChild, currentBranch]);

  const discountPercent = useMemo(() => {
    // Only apply discount if has_discount is true AND discountPercent exists
    if (selectedChild?.has_discount) {
      return selectedChild.discount_percent;
    }
    return 0;
  }, [selectedChild]);

  const recurringAmount = useMemo(() => {
    const base = recurringInfo?.amount ?? 0; // ← Safe fallback to 0 if amount missing

    if (discountPercent > 0) {
      const discounted = base - (base * discountPercent) / 100;
      return Math.max(0, discounted); // Prevent negative
    }

    return base; // No discount → full amount
  }, [recurringInfo, discountPercent]);
  const shouldUseQuarters = currentBranch === "pre school summit";

  // Handlers
  const onQuartersChange = handleQuartersChange(setErrors, setSelectedQuarters);
  const onMonthQuarterError = handleMonthQuarterError(setErrors);
  const onChildError = handleChildError(setErrors);

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setChildSearch("");
    setChildList([]);
    setSelectedQuarters([]);
  };

  const handleLoadMoreChildren = () => {
    if (fetchingRef.current || childrenLoading) return;
    fetchingRef.current = true;
    setIsLoadingMoreChildren(true);
    setChildPage(p => p + 1);
  };

  const handleScroll = () => {
    if (fetchingRef.current || childrenLoading || !listRef.current) return;
    const el = listRef.current;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 120) {
      handleLoadMoreChildren();
    }
  };

  // Auto-prefill
  useEffect(() => {
    if (!selectedChild || !form.category || recurringAmount === 0) return;

    let amount = "";
    let nextMonths: string[] = [];
    let nextQuarters: Array<{ quarter: number; year: number }> = [];

    if (form.category === "registration" && !hasRegistrationPaid) {
      amount = registrationFee.toString();
    } else if (form.category === "quarterly") {
      nextQuarters = getUpcomingQuarters(0, paidQuarters);
      amount = (recurringAmount * nextQuarters.length).toString();
      setSelectedQuarters(nextQuarters);
    } else if (form.category === "monthly") {
      nextMonths = getUpcomingMonths(0, paidMonths);
      amount = recurringAmount.toString();
    }

    setForm(prev => ({ ...prev, totalAmount: amount, selectedMonths: nextMonths }));
    setErrors({});
  }, [selectedChild, form.category, recurringAmount, registrationFee, hasRegistrationPaid, paidQuarters, paidMonths]);

  // Update amount on selection change
  useEffect(() => {
    if (form.category === "quarterly" && recurringAmount) {
      const newAmount = (recurringAmount * (selectedQuarters.length || 1)).toString();
      if (form.totalAmount !== newAmount) {
        setForm(prev => ({ ...prev, totalAmount: newAmount }));
      }
    }
  }, [selectedQuarters, form.category, recurringAmount]);

  useEffect(() => {
    if (form.category === "monthly" && recurringAmount) {
      const newAmount = (recurringAmount * (form.selectedMonths.length || 1)).toString();
      if (form.totalAmount !== newAmount) {
        setForm(prev => ({ ...prev, totalAmount: newAmount }));
      }
    }
  }, [form.selectedMonths, form.category, recurringAmount]);

  const validateForm = () => {
    const newErrors = validatePaymentForm(form, selectedChild, selectedQuarters, form.selectedMonths);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedChild || !form.category) return;

    await onSubmit({
      child_id: selectedChild.id,
      total_amount: parseFloat(form.totalAmount),
      months: form.category === "monthly" ? form.selectedMonths : form.category === "registration" ? ["1970-01-01"] : undefined,
      quarters: form.category === "quarterly" ? selectedQuarters : undefined,
      method: form.method,
      notes: form.notes.trim() || undefined,
      category: form.category,
      branch: currentBranch,
    });
    onCancel();
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
        isLoadingPaidMonths={isLoadingPaidMonths}
        onError={onChildError}
        isChildNew={false}
        isChildOld={false}
      />

      {selectedChild && (
        <>
          <PaymentTypeSelector
            selectedCategory={form.category}
            onCategoryChange={(category) => {
              setForm(prev => ({ ...prev, category }));
              if (errors.selectedMonths) {
                setErrors(prev => {
                  const { selectedMonths, ...rest } = prev;
                  return rest;
                });
              }
            }}
            hasRegistrationPaid={hasRegistrationPaid}
            isCheckingRegistration={isCheckingRegistration}
            selectedChild={selectedChild}
            registrationFee={registrationFee}
            recurringInfo={recurringInfo}
            getUpcomingMonths={getUpcomingMonths.bind(null, 1, paidMonths)}
            discountPercent={discountPercent}
            currentBranch={currentBranch}
          />

          {form.category && (
            <>
              <AmountInput
                amount={form.totalAmount}
                onAmountChange={(value) => {
                  setForm(prev => ({ ...prev, totalAmount: value }));
                  if (errors.totalAmount) {
                    setErrors(prev => {
                      const { totalAmount, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                error={errors.totalAmount}
                selectedChild={selectedChild}
                selectedCategory={form.category}
                isAutoFilled={["registration", "monthly", "quarterly"].includes(form.category)}
              />

              {(form.category === "quarterly" && shouldUseQuarters) && (
                <QuarterSelector
                  selectedChild={selectedChild}
                  onQuartersChange={onQuartersChange}
                  paidQuarters={paidQuarters}
                  isLoadingPaidQuarters={isLoadingPaidQuarters}
                  selectedQuarters={selectedQuarters}
                  error={errors.selectedMonths}
                  onError={onMonthQuarterError}
                />
              )}

              {(form.category === "monthly" && !shouldUseQuarters) && (
                <MonthSelector
                  selectedChild={selectedChild}
                  selectedMonths={form.selectedMonths}
                  onMonthsChange={(months, amount) => {
                    setForm(prev => ({ ...prev, selectedMonths: months, totalAmount: String(amount) }));
                  }}
                  paidMonths={paidMonths}
                  isLoadingPaidMonths={isLoadingPaidMonths}
                  error={errors.selectedMonths}
                  onError={onMonthQuarterError}
                />
              )}

              <PaymentMethod
                method={form.method}
                onMethodChange={(value) => {
                  setForm(prev => ({ ...prev, method: value }));
                  if (errors.method) {
                    setErrors(prev => {
                      const { method, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                error={errors.method}
                selectedChild={selectedChild}
              />

              <PaymentNotes
                notes={form.notes}
                onNotesChange={(value) => {
                  setForm(prev => ({ ...prev, notes: value }));
                  if (errors.notes) {
                    setErrors(prev => {
                      const { notes, ...rest } = prev;
                      return rest;
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
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
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