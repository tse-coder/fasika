import { create } from "zustand";
import { getPaymentInfo, updatePaymentInfo } from "@/api/payment-info.api";
import { PaymentInfoData } from "@/types/payment-info.types";


interface PaymentInfoState {
  data: PaymentInfoData | null;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<PaymentInfoData>;
  save: (data: PaymentInfoData) => Promise<PaymentInfoData>;
}

export const usePaymentInfoStore = create<PaymentInfoState>()((set, get) => ({
      data: null,
      isLoading: false,
      error: null,
      load: async () => {
        set({ isLoading: true, error: null });
        try {
          const info = await getPaymentInfo();
          set({ data: info, isLoading: false });
          return info;
        } catch (err: any) {
          set({
            error: err?.message || "Failed to load payment info",
            isLoading: false,
          });
          throw err;
        }
      },
      save: async (data: PaymentInfoData) => {
        set({ isLoading: true, error: null });
        try {
          const saved = await updatePaymentInfo(data);
          set({ data: saved, isLoading: false });
          return saved;
        } catch (err: any) {
          set({
            error: err?.message || "Failed to save payment info",
            isLoading: false,
          });
          throw err;
        }
      },
    })
  );

