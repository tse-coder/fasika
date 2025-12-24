import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePaymentInfoStore } from "@/stores/paymentInfo.store";
import { PaymentInfoData, Program } from "@/mock/data";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/auth.store";
import { Navigate } from "react-router-dom";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import Header from "./components/header";
import RegisterationInfoTable from "./components/registerationInfoTable";
import MonthQuartInfoTable from "./components/monthQuarterInfoTable";
import DiscountsTable from "./components/discountsTable";

const programs: Program[] = ["kindergarten", "childcare"];

const formatProgram = (p: Program) =>
  p === "kindergarten" ? "Kindergarten" : "Childcare";

export default function PaymentInfo() {
  const { data, isLoading, load, save } = usePaymentInfoStore();
  const { currentBranch } = useBranchStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const [local, setLocal] = useState<PaymentInfoData | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/payments" replace />;
  }

  const handleRegistrationChange = (
    program: Program,
    field: "newFee" | "oldFee",
    value: number
  ) => {
    if (!local) return;
    const updated = {
      ...local,
      registration: local.registration.map((row) =>
        row.program === program ? { ...row, [field]: value } : row
      ),
    };
    setLocal(updated);
  };

  const handleRecurringChange = (
    program: Program,
    field: "amount" | "discountPercent",
    value: number
  ) => {
    if (!local) return;
    const updated = {
      ...local,
      recurring: local.recurring.map((row) =>
        row.program === program && row.branch === currentBranch
          ? { ...row, [field]: value }
          : row
      ),
    };
    setLocal(updated);
  };

  const handleSave = async () => {
    if (!local) return;
    try {
      await save(local);
      toast({ title: "Saved", description: "Payment info updated." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to save payment info.",
        variant: "destructive",
      });
    }
  };

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

  const paginatedDiscounts = discountedFiltered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Header
          isLoading={isLoading}
          local={!!local}
          currentBranch={currentBranch}
          handleSave={handleSave}
        />
        {isLoading && !local ? (
          <div className="flex items-center gap-2">
            <LoaderIcon className="w-5 h-5" />
            <span>Loading payment info...</span>
          </div>
        ) : null}

        {local && (
          <>
            <RegisterationInfoTable
              programs={programs}
              local={local}
              handleRegistrationChange={handleRegistrationChange}
              formatProgram={formatProgram}
            />
            <MonthQuartInfoTable
              programs={programs}
              local={local}
              currentBranch={currentBranch}
              handleRecurringChange={handleRecurringChange}
              formatProgram={formatProgram}
            />
            <DiscountsTable
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              paginatedDiscounts={paginatedDiscounts}
              discountedFiltered={discountedFiltered}
              setSelectedNote={setSelectedNote}
              selectedNote={selectedNote}
              formatProgram={formatProgram}
            />

          </>
        )}
      </div>
    </DashboardLayout>
  );
}
