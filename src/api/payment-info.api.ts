import { PaymentInfoData } from "@/mock/data";
import { apiGet, apiPut } from "./http";

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