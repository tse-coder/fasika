export type PaymentType = "registeration" | "monthly" | "quarterly";
export interface Payment {
  id: number;
  child_id: number;
  total_amount: string; // Decimal as string from backend
  payment_date: string; // ISO 8601 datetime
  method: string;
  notes: string | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  monthly_records: MonthlyRecord[];
}

export interface MonthlyRecord {
  id: number;
  payment_id: number;
  child_id: number;
  month: string; // ISO 8601 datetime (first day of month)
  amount: string; // Decimal as string
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface PaidMonth {
  year: number;
  month: number; // 1-12, where 1 = January, 12 = December
}

export interface NewPaymentRequest {
  child_id: number;
  total_amount: number;
  months: string[]; // Array of ISO date strings (YYYY-MM-DD format)
  method: string; // "Cash", "CBE", "Dashen Bank"
  notes?: string; // Optional, max 255 characters
}

export interface CreatePaymentResponse {
  payment: {
    id: number;
    child_id: number;
    total_amount: string;
    payment_date: string;
    method: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  recordedMonths: string[]; // Array of months that were successfully recorded
  skippedMonths: string[]; // Array of months that were skipped (already paid)
}

export interface PaymentsPaginated {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Payment[];
}

export interface PaymentReport {
  breakdown: Array<{
    method: string;
    amount: number;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentState {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchPayments: (filters?: {
    child_id?: number;
    parent_id?: number;
    month?: string;
    page?: number;
    limit?: number;
    order?: "asc" | "desc";
  }) => Promise<PaymentsPaginated>;
  fetchPaidMonths: (childId: number) => Promise<PaidMonth[]>;
  createPayment: (payment: NewPaymentRequest) => Promise<CreatePaymentResponse>;
  deletePayment: (id: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
