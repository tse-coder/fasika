import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePayments } from "@/stores/payment.store";
import { useModalStore } from "@/stores/overlay.store";
import { PaymentInfoOverlay } from "../sections/paymentInfoOverlay";
import { CreatePaymentResponse } from "@/types/payment.types";
import { Payment } from "@/types/payment.types";
import { Child } from "@/types/child.types";
import { Branch } from "@/types/api.types";

/**
 * Custom hook to handle payment actions (create, delete, view)
 */
export const usePaymentActions = (
  loadPayments: () => Promise<void>,
  children: Child[]
) => {
  const { toast } = useToast();
  const { createPayment, deletePayment } = usePayments();
  const openModal = useModalStore((state) => state.openModal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    payment: CreatePaymentResponse;
    child: Child | null;
  } | null>(null);

  const handleSubmitPayment = async (data: {
    child_id: string;
    total_amount: number;
    months: string[];
    method: string;
    notes?: string;
    category: string;
    branch: Branch
  }) => {
    setIsSubmitting(true);
    try {
      const response = await createPayment(data);

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

      await loadPayments();

      const child = children.find((c) => c.id === data.child_id);

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

  const handleDeletePayment = async (id: number) => {
    setIsDeleting(true);
    try {
      await deletePayment(id);
      toast({
        title: "Payment Deleted",
        description: "The payment has been successfully deleted.",
      });
      useModalStore.getState().closeModal();
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

  return {
    isSubmitting,
    isDeleting,
    invoiceData,
    setInvoiceData,
    handleSubmitPayment,
    handlePaymentClick,
  };
};