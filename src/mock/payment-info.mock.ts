import { PaymentInfoData, mockPaymentInfo } from "./data";
import { delay } from "./utils";

let paymentInfo: PaymentInfoData = { ...mockPaymentInfo };

export const getPaymentInfo = async (): Promise<PaymentInfoData> => {
  await delay();
  return paymentInfo;
};

export const updatePaymentInfo = async (updated: PaymentInfoData): Promise<PaymentInfoData> => {
  await delay();
  paymentInfo = { ...updated };
  return paymentInfo;
};

export const sendPaymentReminder = async () => {
  await delay();
  return { sent_to: [] as string[] };
};