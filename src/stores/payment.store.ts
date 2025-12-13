import { create } from "zustand";
import {
  Payment,
  PaymentState,
  PaidMonth,
  NewPaymentRequest,
  CreatePaymentResponse,
  PaymentsPaginated,
} from "@/types/payment.types";
import {
  fetchPayments,
  fetchPaidMonths,
  createPayment,
  deletePayment as deletePaymentApi,
} from "@/api/payment.api";

export const usePayments = create<PaymentState>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,

  fetchPayments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchPayments(filters);
      const payments = response.data || [];
      set({ payments, isLoading: false });
      return response;
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to load payments.";
      set({ error: errorMessage, isLoading: false });
      return {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        data: [],
      };
    }
  },

  fetchPaidMonths: async (childId: number) => {
    try {
      const paidMonths = await fetchPaidMonths(childId);
      return paidMonths;
    } catch (err: any) {
      console.error("Error fetching paid months:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to load paid months.";
      set({ error: errorMessage });
      return [];
    }
  },

  createPayment: async (paymentData: NewPaymentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createPayment(paymentData);
      // Refresh payments list after creating
      const currentPayments = get().payments;
      const newPayment: Payment = {
        ...response.payment,
        monthly_records: [], // Will be populated when fetching full list
      };
      set({
        payments: [newPayment, ...currentPayments],
        isLoading: false,
      });
      return response;
    } catch (err: any) {
      console.error("Error creating payment:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to create payment.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  deletePayment: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deletePaymentApi(id);
      const currentPayments = get().payments;
      set({
        payments: currentPayments.filter((p) => p.id !== id),
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to delete payment.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
}));
