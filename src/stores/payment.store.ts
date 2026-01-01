// src/stores/payment.store.ts

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
  createPayment,
  deletePayment,
  fetchPaidMonths,
  fetchPaidQuarters as fetchPaidQuartersApi,
  fetchPayments,
} from "@/api/payment.api";

export const usePayments = create<PaymentState>((set, get) => ({
  payments: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  // Fetch list of payments (paginated)
  fetchPayments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchPayments(filters);
      const payments = response.data || [];

      set({
        payments,
        pagination: {
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 20,
          totalPages: response.totalPages || 0,
        },
        isLoading: false,
      });

      return response;
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to load payments.";
      set({ error: errorMessage, isLoading: false });

      return {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        data: [],
      };
    }
  },

  // Fetch paid months for a child
  fetchPaidMonths: async (childId: string): Promise<PaidMonth[]> => {
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

  // Fetch paid quarters for a child (now properly implemented and used)
  fetchPaidQuarters: async (
    childId: string
  ): Promise<Array<{ quarter: number; year: number }>> => {
    try {
      const paidQuarters = await fetchPaidQuartersApi(childId);
      return paidQuarters || [];
    } catch (err: any) {
      console.error("Error fetching paid quarters:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to load paid quarters.";
      set({ error: errorMessage });
      return [];
    }
  },

  // Create new payment
  createPayment: async (paymentData: NewPaymentRequest): Promise<CreatePaymentResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await createPayment(paymentData);

      // Optionally refetch payments list or prepend the new one
      // For now, we just return the response (frontend list can be refreshed separately)
      set({ isLoading: false });

      return response;
    } catch (err: any) {
      console.error("Error creating payment:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to create payment.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Delete payment
  deletePayment: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deletePayment(id);

      // Remove from local state
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to delete payment.";
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Optional: Clear error
  clearError: () => set({ error: null }),
}));