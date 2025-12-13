import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import type { Child } from "@/types/child.types";
import type { PaidMonth } from "@/types/payment.types";

interface PaymentFormProps {
  onSubmit: (data: {
    child_id: number;
    total_amount: number;
    months: string[];
    method: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PAYMENT_METHODS = ["Cash", "CBE", "Dashen Bank"];

export function PaymentForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: PaymentFormProps) {
  const { fetchChildren, isLoading: childrenLoading } = useChildren();
  const { fetchPaidMonths } = usePayments();

  const [childSearch, setChildSearch] = useState("");
  const [debouncedChildSearch, setDebouncedChildSearch] = useState("");
  const [childList, setChildList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [paidMonths, setPaidMonths] = useState<PaidMonth[]>([]);
  const [isLoadingPaidMonths, setIsLoadingPaidMonths] = useState(false);
  const [childPage, setChildPage] = useState(1);
  const [isLoadingMoreChildren, setIsLoadingMoreChildren] = useState(false);

  const [form, setForm] = useState({
    totalAmount: "",
    selectedMonths: [] as string[],
    method: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const debounceTimer = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

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
            ? { query: debouncedChildSearch.trim() }
            : { page: childPage };

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
  }, [debouncedChildSearch, childPage, fetchChildren]);

  // Fetch paid months when child is selected
  useEffect(() => {
    if (!selectedChild) {
      setPaidMonths([]);
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
  }, [selectedChild, fetchPaidMonths]);

  // Reset form when child changes
  useEffect(() => {
    if (selectedChild) {
      setForm({
        totalAmount: "",
        selectedMonths: [],
        method: "",
        notes: "",
      });
      setErrors({});
    }
  }, [selectedChild]);

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setChildSearch("");
    setChildList([]);
  };

  const handleMonthToggle = (monthIndex: number, year: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const isPaid = paidMonths.some(
      (pm) => pm.year === year && pm.month === monthIndex + 1
    );

    if (isPaid) return; // Don't allow selecting paid months

    setForm((prev) => {
      const isSelected = prev.selectedMonths.includes(monthKey);
      return {
        ...prev,
        selectedMonths: isSelected
          ? prev.selectedMonths.filter((m) => m !== monthKey)
          : [...prev.selectedMonths, monthKey],
      };
    });
    // Clear month error when user selects
    if (errors.selectedMonths) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.selectedMonths;
        return newErrors;
      });
    }
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedChild) {
      newErrors.child = "Please select a child";
    }

    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      newErrors.totalAmount = "Please enter a valid amount";
    }

    if (form.selectedMonths.length === 0) {
      newErrors.selectedMonths = "Please select at least one month";
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

    if (!validateForm() || !selectedChild) return;

    try {
      await onSubmit({
        child_id: selectedChild.id,
        total_amount: parseFloat(form.totalAmount),
        months: form.selectedMonths,
        method: form.method,
        notes: form.notes.trim() || undefined,
      });
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const currentYear = new Date().getFullYear();
  const isMonthPaid = (monthIndex: number, year: number) => {
    return paidMonths.some(
      (pm) => pm.year === year && pm.month === monthIndex + 1
    );
  };

  const isMonthSelected = (monthIndex: number, year: number) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    return form.selectedMonths.includes(monthKey);
  };

  // Local filtering for quick UX
  const filteredChildren = childList.filter(
    (c) =>
      `${c.fname} ${c.lname}`
        .toLowerCase()
        .includes(childSearch.toLowerCase()) ||
      (c.birthdate || "").includes(childSearch)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Child Selection */}
      <div className="space-y-2">
        <Label>Select Child</Label>
        <div className="relative">
          <Input
            placeholder="Search child by name..."
            value={childSearch}
            onChange={(e) => setChildSearch(e.target.value)}
            className={errors.child ? "border-red-500" : ""}
          />
          {errors.child && (
            <p className="text-red-600 text-sm mt-1">{errors.child}</p>
          )}

          {childSearch && (
            <div
              className="border rounded-md max-h-56 overflow-y-auto mt-2 absolute z-50 w-full bg-background shadow-lg"
              ref={listRef}
              onScroll={handleScroll}
            >
              {(childrenLoading || isLoadingMoreChildren) &&
              filteredChildren.length === 0 ? (
                <div className="p-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse mb-3">
                      <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted/30 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredChildren.length > 0 ? (
                <>
                  {filteredChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleSelectChild(child)}
                      className="p-3 cursor-pointer hover:bg-primary/10 border-b"
                    >
                      <div className="font-medium">
                        {child.fname} {child.lname}
                      </div>
                      {child.birthdate && (
                        <div className="text-sm text-muted-foreground">
                          DOB: {new Date(child.birthdate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                  {!debouncedChildSearch.trim() && (
                    <div className="p-3 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleLoadMoreChildren}
                        disabled={isLoadingMoreChildren}
                      >
                        {isLoadingMoreChildren ? (
                          <LoaderIcon className="w-4 h-4" />
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground p-3">
                  No matching children found.
                </p>
              )}
            </div>
          )}
        </div>

        {selectedChild && (
          <div className="mt-2 p-2 bg-primary/10 rounded-md">
            <div className="font-medium">
              Selected: {selectedChild.fname} {selectedChild.lname}
            </div>
            {isLoadingPaidMonths && (
              <div className="text-sm text-muted-foreground mt-1">
                Loading payment history...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total Amount */}
      <div className="space-y-2">
        <Label>Total Amount (ETB)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={form.totalAmount}
          onChange={(e) => {
            setForm({ ...form, totalAmount: e.target.value });
            if (errors.totalAmount) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.totalAmount;
                return newErrors;
              });
            }
          }}
          placeholder="Enter total amount"
          className={errors.totalAmount ? "border-red-500" : ""}
          disabled={!selectedChild}
        />
        {errors.totalAmount && (
          <p className="text-red-600 text-sm">{errors.totalAmount}</p>
        )}
      </div>

      {/* Month Selection */}
      {selectedChild && (
        <div className="space-y-2">
          <Label>Select Months</Label>
          {isLoadingPaidMonths ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderIcon className="w-4 h-4" />
              <span>Loading paid months...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTHS.map((month, index) => {
                const isPaid = isMonthPaid(index, currentYear);
                const isSelected = isMonthSelected(index, currentYear);
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthToggle(index, currentYear)}
                    disabled={isPaid}
                    className={`
                      p-2 rounded-md border text-sm transition-colors
                      ${
                        isPaid
                          ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                          : isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-accent border-border"
                      }
                    `}
                    title={
                      isPaid
                        ? `${month} is already paid`
                        : isSelected
                        ? `Click to deselect ${month}`
                        : `Click to select ${month}`
                    }
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}
          {errors.selectedMonths && (
            <p className="text-red-600 text-sm">{errors.selectedMonths}</p>
          )}
          {paidMonths.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {paidMonths.length} month(s) already paid (disabled)
            </p>
          )}
        </div>
      )}

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select
          value={form.method}
          onValueChange={(value) => {
            setForm({ ...form, method: value });
            if (errors.method) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.method;
                return newErrors;
              });
            }
          }}
          disabled={!selectedChild}
        >
          <SelectTrigger className={errors.method ? "border-red-500" : ""}>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.method && (
          <p className="text-red-600 text-sm">{errors.method}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => {
            setForm({ ...form, notes: e.target.value });
            if (errors.notes) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.notes;
                return newErrors;
              });
            }
          }}
          placeholder="Add any additional notes..."
          rows={3}
          maxLength={255}
          className={errors.notes ? "border-red-500" : ""}
          disabled={!selectedChild}
        />
        {errors.notes && <p className="text-red-600 text-sm">{errors.notes}</p>}
        <p className="text-xs text-muted-foreground">
          {form.notes.length}/255 characters
        </p>
      </div>

      {/* Form Actions */}
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
        <Button type="submit" className="flex-1" disabled={isLoading}>
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
