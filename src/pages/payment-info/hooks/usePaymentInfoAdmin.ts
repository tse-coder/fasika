import { useEffect, useMemo, useState } from "react";
import { usePaymentInfoStore } from "@/stores/paymentInfo.store";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "@/hooks/use-toast";
import { PaymentInfoData, Program } from "@/mock/data";

const programs: Program[] = ["kindergarten", "childcare"];

export const usePaymentInfoAdmin = () => {
  const { data, isLoading, load, save } = usePaymentInfoStore();
  const { currentBranch } = useBranchStore();
  const { toast } = useToast();

  const [local, setLocal] = useState<PaymentInfoData | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    load();
  }, [load]);

  // Sync store data → local state
  useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  // Handlers
  const handleRegistrationChange = (
    program: Program,
    field: "newFee" | "oldFee",
    value: number
  ) => {
    if (!local) return;

    setLocal((prev) => {
      if (!prev) return prev;

      const existingIndex = prev.registration.findIndex((r) => r.program === program);
      let newRegistration;

      if (existingIndex >= 0) {
        newRegistration = prev.registration.map((r, i) =>
          i === existingIndex ? { ...r, [field]: value } : r
        );
      } else {
        newRegistration = [
          ...prev.registration,
          {
            program,
            newFee: field === "newFee" ? value : 0,
            oldFee: field === "oldFee" ? value : 0,
          },
        ];
      }

      return { ...prev, registration: newRegistration };
    });
  };

  const handleRecurringChange = (
    program: Program,
    field: "amount" | "discountPercent",
    value: number
  ) => {
    if (!local) return;

    setLocal((prev) => {
      if (!prev) return prev;

      const existingIndex = prev.recurring.findIndex(
        (r) => r.program === program && r.branch === currentBranch
      );
      let newRecurring;

      if (existingIndex >= 0) {
        newRecurring = prev.recurring.map((r, i) =>
          i === existingIndex ? { ...r, [field]: value } : r
        );
      } else {
        newRecurring = [
          ...prev.recurring,
          {
            program,
            branch: currentBranch,
            amount: field === "amount" ? value : 0,
            discountPercent: field === "discountPercent" ? value : 0,
          },
        ];
      }

      return { ...prev, recurring: newRecurring };
    });
  };

  const handleSave = async () => {
    if (!local) return;

    try {
      await save(local);
      toast({
        title: "Saved",
        description: "Payment info updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to save payment info.",
        variant: "destructive",
      });
    }
  };

  // Filtered & paginated discounts
  const discountedFiltered = useMemo(() => {
    if (!local) return [];
    const term = search.toLowerCase();
    return local.discounted.filter(
      (row) =>
        row.branch === currentBranch &&
        (row.childName.toLowerCase().includes(term) ||
          row.program.toLowerCase().includes(term))
    );
  }, [local, search, currentBranch]);

  const paginatedDiscounts = useMemo(() => {
    return discountedFiltered.slice((page - 1) * pageSize, page * pageSize);
  }, [discountedFiltered, page, pageSize]);

  const formatProgram = (p: Program) =>
    p === "kindergarten" ? "Kindergarten" : "Childcare";

  return {
    local,
    isLoading,
    hasData: !!local,
    currentBranch,
    programs,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    selectedNote,
    setSelectedNote,
    discountedFiltered,
    paginatedDiscounts,
    handleRegistrationChange,
    handleRecurringChange,
    handleSave,
    formatProgram,
  };
};