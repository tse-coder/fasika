import { apiGet, apiPut } from "./http";

interface PaymentInfoData {
  registration: Array<{ program: string; newFee: number; oldFee: number }>;
  recurring: Array<{
    program: string;
    branch: string;
    schedule: "monthly" | "quarterly";
    amount: number;
    discountPercent: number;
  }>;
  discounted: Array<{
    childId: number;
    childName: string;
    branch: string;
    program: string;
    discountPercent: number;
    note: string;
  }>;
}

export const getPaymentInfo = async (): Promise<PaymentInfoData> => {
  console.log("[API] getPaymentInfo - start");
  try {
    const res = await apiGet<PaymentInfoData>("/api/payment-info");
    console.log("[API] getPaymentInfo - success", res);
    return res;
  } catch (err) {
    console.error("[API] getPaymentInfo - error", err);
    throw err;
  }
};

export const updatePaymentInfo = async (data: PaymentInfoData): Promise<PaymentInfoData> => {
  console.log("[API] updatePaymentInfo - start", data);
  try {
    const res = await apiPut<PaymentInfoData>("/api/payment-info", data);
    console.log("[API] updatePaymentInfo - success", res);
    return res;
  } catch (err) {
    console.error("[API] updatePaymentInfo - error", err);
    throw err;
  }
};