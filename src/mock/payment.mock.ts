import raw from "./data/payments.json";
import {
  Payment,
  PaymentsPaginated,
  PaidMonth,
  NewPaymentRequest,
  CreatePaymentResponse,
  PaymentReport,
} from "@/types/payment.types";
import { delay, paginate } from "./utils";

let payments: Payment[] = structuredClone(raw as Payment[]);

export const fetchPayments = async (
  params: any = {}
): Promise<PaymentsPaginated> => {
  await delay();

  let filtered = [...payments];

  if (params.child_id) {
    filtered = filtered.filter(p => p.child_id === params.child_id);
  }

  return paginate(filtered, params.page, params.limit);
};

export const fetchPaidMonths = async (
  childId: number
): Promise<PaidMonth[]> => {
  await delay();

  const months = payments
    .filter(p => p.child_id === childId)
    .flatMap(p =>
      p.monthly_records.map(m => {
        const d = new Date(m.month);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
      })
    );

  return months;
};

export const createPayment = async (
  req: NewPaymentRequest
): Promise<CreatePaymentResponse> => {
  await delay();

  const now = new Date().toISOString();
  const id = Math.max(0, ...payments.map(p => p.id)) + 1;

  const monthly_records = req.months.map((m, idx) => ({
    id: Date.now() + idx,
    payment_id: id,
    child_id: req.child_id,
    month: m,
    amount: (req.total_amount / req.months.length).toString(),
    created_at: now,
    updated_at: now,
  }));

  const payment: Payment = {
    id,
    child_id: req.child_id,
    total_amount: req.total_amount.toString(),
    payment_date: now,
    method: req.method,
    notes: req.notes ?? null,
    created_at: now,
    updated_at: now,
    monthly_records,
  };

  payments.push(payment);

  return {
    payment,
    recordedMonths: req.months,
    skippedMonths: [],
  };
};

export const deletePayment = async (id: number): Promise<void> => {
  await delay();
  payments = payments.filter(p => p.id !== id);
};

export const fetchPaymentReport = async (): Promise<PaymentReport> => {
  await delay();

  const breakdown: Record<string, number> = {};
  let total = 0;

  payments.forEach(p => {
    const amt = Number(p.total_amount);
    breakdown[p.method] = (breakdown[p.method] || 0) + amt;
    total += amt;
  });

  return {
    breakdown: Object.entries(breakdown).map(([method, amount]) => ({
      method,
      amount,
    })),
    total,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
};
