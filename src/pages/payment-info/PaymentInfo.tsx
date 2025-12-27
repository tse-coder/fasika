import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/stores/auth.store";
import { Navigate } from "react-router-dom";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import Header from "./components/header";
import RegisterationInfoTable from "./components/registerationInfoTable";
import MonthQuartInfoTable from "./components/monthQuarterInfoTable";
import DiscountsTable from "./components/discountsTable";
import { usePaymentInfoAdmin } from "./hooks/usePaymentInfoAdmin";

export default function PaymentInfo() {
  const { user } = useAuth();

  const {
    local,
    isLoading,
    hasData,
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
  } = usePaymentInfoAdmin();

  // Access control
  if (user?.role !== "ADMIN") {
    return <Navigate to="/payments" replace />;
  }

  // Full-page loading
  if (isLoading && !local) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 p-6">
          <LoaderIcon className="w-5 h-5" />
          <span>Loading payment info...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Header
          isLoading={isLoading}
          local={hasData}
          currentBranch={currentBranch}
          handleSave={handleSave}
        />

        {hasData ? (
          <>
            <RegisterationInfoTable
              programs={programs}
              local={local!}
              handleRegistrationChange={handleRegistrationChange}
              formatProgram={formatProgram}
            />

            <MonthQuartInfoTable
              programs={programs}
              local={local!}
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
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No payment configuration found. Start by editing the tables above.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
