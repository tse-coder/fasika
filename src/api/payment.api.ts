import { apiGet, apiPost, apiDelete } from "./http";
import {
  Payment,
  PaymentsPaginated,
  PaidMonth,
  NewPaymentRequest,
  CreatePaymentResponse,
  PaymentReport,
} from "@/types/payment.types";

export const fetchPayments = async (
  params: {
    child_id?: number;
    parent_id?: number;
    month?: string;
    page?: number;
    limit?: number;
    order?: "asc" | "desc";
  } = {}
): Promise<PaymentsPaginated> => {
  console.log("[API] fetchPayments - start", params);
  try {
    const res = await apiGet<PaymentsPaginated>("/api/payments", params);
    console.log("[API] fetchPayments - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchPayments - error", err);
    throw err;
  }
};

export const fetchPaidMonths = async (
  childId: number
): Promise<PaidMonth[]> => {
  console.log("[API] fetchPaidMonths - start", childId);
  try {
    const res = await apiGet<PaidMonth[]>(
      `/api/payments/${childId}/paid-months`
    );
    console.log("[API] fetchPaidMonths - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchPaidMonths - error", err);
    throw err;
  }
};

export const createPayment = async (
  payment: NewPaymentRequest
): Promise<CreatePaymentResponse> => {
  console.log("[API] createPayment - start", payment);
  try {
    const res = await apiPost<CreatePaymentResponse>("/api/payments", payment);
    console.log("[API] createPayment - success", res);
    return res;
  } catch (err) {
    console.error("[API] createPayment - error", err);
    throw err;
  }
};

export const deletePayment = async (
  id: number
): Promise<{ message: string }> => {
  console.log("[API] deletePayment - start", id);
  try {
    const res = await apiDelete<{ message: string }>(`/api/payments/${id}`);
    console.log("[API] deletePayment - success", res);
    return res;
  } catch (err) {
    console.error("[API] deletePayment - error", err);
    throw err;
  }
};

export const fetchPaymentReport = async (
  params: {
    month?: string;
    child_id?: number;
    parent_id?: number;
    page?: number;
    limit?: number;
  } = {}
): Promise<PaymentReport> => {
  console.log("[API] fetchPaymentReport - start", params);
  try {
    const res = await apiGet<PaymentReport>("/api/payments/report", params);
    console.log("[API] fetchPaymentReport - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchPaymentReport - error", err);
    throw err;
  }
};

export const fetchUnpaidChildren = async (params: {
  month: string; // Required, ISO date string
  page?: number;
  limit?: number;
}): Promise<{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Array<{
    id: number;
    fname: string;
    lname: string;
    gender: string;
    birthdate: string;
  }>;
}> => {
  console.log("[API] fetchUnpaidChildren - start", params);
  try {
    const res = await apiGet("/api/payments/unpaid", params);
    console.log("[API] fetchUnpaidChildren - success", res);
    return res as {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      data: Array<{
        id: number;
        fname: string;
        lname: string;
        gender: string;
        birthdate: string;
      }>;
    };
  } catch (err) {
    console.error("[API] fetchUnpaidChildren - error", err);
    throw err;
  }
};
