import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePaymentsData } from "./hooks/usePaymentsData";
import { usePaymentActions } from "./hooks/usePaymentActions";
import { filterPayments, getChildName } from "./utils/paymentFilters";
import PaymentHeader from "./sections/header";
import { HeaderExtra } from "./sections/headerExtra";
import PaymentsTable from "./sections/paymentsTable";
import { InvoiceOverlay } from "./sections/invoiceOverlay";
import { useAuth } from "@/stores/auth.store";

/**
 * Main Payments page component
 * Handles payment creation, viewing, filtering, and deletion
 */
const Payments = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    payments,
    pagination,
    children,
    page,
    setPage,
    selectedChildren,
    selectedMethod,
    setSelectedMethod,
    loadPayments,
    handleSelectChild,
    handleRemoveChild,
    startMonth,
    endMonth,
    setStartMonth,
    setEndMonth,
  } = usePaymentsData();

  const {
    isSubmitting,
    invoiceData,
    setInvoiceData,
    handleSubmitPayment,
    handlePaymentClick,
  } = usePaymentActions(loadPayments, children);
  const { user } = useAuth();

  // Filter payments client-side for search
  const filteredPayments = filterPayments(
    payments,
    search,
    selectedChildren,
    selectedMethod,
    children
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {user?.role === "ADMIN" && <HeaderExtra />}
        <PaymentHeader
          search={search}
          setSearch={setSearch}
          selectedChildren={selectedChildren}
          onSelectChild={handleSelectChild}
          onRemoveChild={handleRemoveChild}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          startMonth={startMonth}
          endMonth={endMonth}
          setStartMonth={setStartMonth}
          setEndMonth={setEndMonth}
          open={open}
          setOpen={setOpen}
          onSubmitPayment={handleSubmitPayment}
          isSubmitting={isSubmitting}
          userRole={user?.role}
        />
        {user?.role === "ADMIN" && (
          <PaymentsTable
            payments={payments}
            children={children}
            getChildName={(id) => getChildName(id, children)}
            filteredPayments={filteredPayments}
            onPaymentClick={handlePaymentClick}
            pagination={pagination}
            onPageChange={setPage}
            currentPage={page}
          />
        )}
      </div>

      {invoiceData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInvoiceData(null)}
        >
          <div
            className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1">
              <InvoiceOverlay
                payment={invoiceData.payment}
                child={invoiceData.child}
                onClose={() => setInvoiceData(null)}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Payments;
