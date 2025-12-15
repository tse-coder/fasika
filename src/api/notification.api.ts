import { apiPost } from "./http";

export interface SendNotificationRequest {
  child_id: number;
  months: string[]; // Array of months that are late (ISO date strings)
}

export interface SendNotificationResponse {
  message: string;
  sent_to: string[]; // Array of parent emails
}

export const sendPaymentReminder = async (
  data: SendNotificationRequest
): Promise<SendNotificationResponse> => {
  console.log("[API] sendPaymentReminder - start", data);
  try {
    // For now, this is a mock endpoint - replace with actual endpoint when backend is ready
    // The backend should send emails to all parents associated with the child
    const res = await apiPost<SendNotificationResponse>(
      "/api/notifications/payment-reminder",
      data
    );
    console.log("[API] sendPaymentReminder - success", res);
    return res;
  } catch (err) {
    console.error("[API] sendPaymentReminder - error", err);
    // For demo purposes, return a mock response if the endpoint doesn't exist yet
    throw err;
  }
};
