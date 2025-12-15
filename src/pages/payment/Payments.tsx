import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import { useModalStore } from "@/stores/overlay.store";
import type { Child } from "@/types/child.types";
import type { Payment } from "@/types/payment.types";
import { CreatePaymentResponse } from "@/types/payment.types";
import { useToast } from "@/hooks/use-toast";
import PaymentHeader from "./sections/header";
import { HeaderExtra } from "./sections/headerExtra";
import PaymentsTable from "./sections/paymentsTable";
import { PaymentInfoOverlay } from "./sections/paymentInfoOverlay";
import { InvoiceOverlay } from "./sections/invoiceOverlay";

const Payments = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { children, fetchChildren } = useChildren();
  const {
    payments,
    pagination,
    fetchPayments,
    createPayment,
    deletePayment,
    isLoading: paymentsLoading,
  } = usePayments();
  const openModal = useModalStore((state) => state.openModal);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [invoiceData, setInvoiceData] = useState<{
    payment: CreatePaymentResponse;
    child: Child | null;
  } | null>(null);

  // Load children and payments on mount
  useEffect(() => {
    // Load children (first page, will load more as needed)
    fetchChildren({ page: 1, limit: 100 });
    loadPayments();
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

  const handleSubmitPayment = async (data: {
    child_id: number;
    total_amount: number;
    months: string[];
    method: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await createPayment(data);

      // Show success message with details
      const recordedCount = response.recordedMonths.length;
      const skippedCount = response.skippedMonths.length;

      let description = `Payment recorded for ${recordedCount} month(s).`;
      if (skippedCount > 0) {
        description += ` ${skippedCount} month(s) were already paid and skipped.`;
      }

      toast({
        title: "Payment Recorded",
        description,
      });

      setOpen(false);

      // Reload payments first
      await loadPayments();

      // Find child for invoice (after reload, children might be updated)
      const child = children.find((c) => c.id === data.child_id);

      // Show invoice overlay only if we have valid payment data
      if (response && response.payment && response.recordedMonths.length > 0) {
        setInvoiceData({
          payment: response,
          child: child || null,
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to record payment. Please try again.";

      // Handle specific error cases
      if (err?.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.overlapped && errorData.overlapped.length > 0) {
          toast({
            title: "All Months Already Paid",
            description: `The selected months are already paid. Please select different months.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    const child = children.find((c) => c.id === payment.child_id);
    openModal(
      <PaymentInfoOverlay
        payment={payment}
        child={child || null}
        onDelete={handleDeletePayment}
        isDeleting={isDeleting}
      />
    );
  };

  const handleDeletePayment = async (id: number) => {
    setIsDeleting(true);
    try {
      await deletePayment(id);
      toast({
        title: "Payment Deleted",
        description: "The payment has been successfully deleted.",
      });
      // Close modal
      useModalStore.getState().closeModal();
      // Reload payments
      await loadPayments();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete payment. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectChild = (child: Child) => {
    if (!selectedChildren.some((c) => c.id === child.id)) {
      setSelectedChildren([...selectedChildren, child]);
    }
  };

  const handleRemoveChild = (childId: number) => {
    setSelectedChildren(selectedChildren.filter((c) => c.id !== childId));
  };

  // Fetch missing children when payments are loaded
  useEffect(() => {
    if (payments.length > 0 && children.length > 0) {
      const paymentChildIds = new Set(payments.map((p) => p.child_id));
      const loadedChildIds = new Set(children.map((c) => c.id));
      const missingIds = Array.from(paymentChildIds).filter(
        (id) => !loadedChildIds.has(id)
      );

      // If there are missing children, try to load more
      if (missingIds.length > 0) {
        // Load a larger page to hopefully get the missing children
        fetchChildren({ page: 1, limit: 200 });
      }
    }
  }, [payments, children, fetchChildren]);

  const getChildName = (childId: number) => {
    const child = children.find((c) => c.id === childId);
    return child ? `${child.fname} ${child.lname}` : "Unknown";
  };

  // Filter payments based on search, selected children, and payment method
  // Note: Server-side filtering is handled by loadPayments, this is for client-side search
  const filteredPayments = payments.filter((p) => {
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
      const childName = getChildName(p.child_id).toLowerCase();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Extra Content */}
        <HeaderExtra />

        {/* Header with Search and Filters */}
        <PaymentHeader
          search={search}
          setSearch={setSearch}
          selectedChildren={selectedChildren}
          onSelectChild={handleSelectChild}
          onRemoveChild={handleRemoveChild}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          open={open}
          setOpen={setOpen}
          onSubmitPayment={handleSubmitPayment}
          isSubmitting={isSubmitting}
        />

        {/* Payments Table */}
        <PaymentsTable
          payments={payments}
          children={children}
          getChildName={getChildName}
          filteredPayments={filteredPayments}
          onPaymentClick={handlePaymentClick}
          pagination={pagination}
          onPageChange={setPage}
          currentPage={page}
        />
      </div>

      {/* Invoice Overlay Modal */}
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
