import {
  Payment,
  PaymentsPaginated,
  PaidMonth,
  NewPaymentRequest,
  CreatePaymentResponse,
  PaymentReport,
} from "@/types/payment.types";
import { Branch, PaginatedResponse } from "@/types/api.types";
import { mockPayments, mockChildren } from "./data";
import { delay } from "./utils";

let payments: Payment[] = [...mockPayments];
let children: Array<any> = [...mockChildren];

const nextId = (() => {
  let current = 4000;
  return () => ++current;
})();

/**
 * Pagination helper
 */
const paginate = <T>(
  data: T[],
  page = 1,
  limit = 20
): PaginatedResponse<T> & { totalPages: number } => ({
  data: data.slice((page - 1) * limit, page * limit),
  total: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
});

/**
 * Build monthly records for payment
 */
const buildMonthlyRecords = (
  child_id: number,
  paymentId: number,
  months: string[],
  amount: number
) =>
  months.map((month, idx) => ({
    id: nextId() + idx,
    payment_id: paymentId,
    child_id,
    month,
    amount: amount.toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

/**
 * Fetch payments with filtering and pagination
 */
export const fetchPayments = async (
  params: Record<string, any> = {}
): Promise<PaymentsPaginated> => {
  await delay();
  const {
    child_id,
    parent_id,
    month,
    page = 1,
    limit = 20,
    branch,
    startDate,
    endDate,
    method
  } = params;

  let data = [...payments];

  // Filter by child_id
  if (child_id) data = data.filter((p) => p.child_id === Number(child_id));

  // Filter by branch
  if (branch) data = data.filter((p) => p.branch === branch);

  // Filter by month
  if (month)
    data = data.filter((p) =>
      p.monthly_records.some((m) => m.month.startsWith(month))
    );

  // Filter by payment method
  if (method && method !== "all") data = data.filter((p) => p.method === method);

  // Filter by parent_id
  if (parent_id) {
    const linkedChildIds = children
      .filter((c) => c.parents.some((p) => p.id === Number(parent_id)))
      .map((c) => c.id);
    data = data.filter((p) => linkedChildIds.includes(p.child_id));
  }

  // Filter by date range
  if (startDate) {
    const s = new Date(startDate).getTime();
    data = data.filter((p) => new Date(p.payment_date).getTime() >= s);
  }

  if (endDate) {
    const e = new Date(endDate).getTime();
    data = data.filter((p) => new Date(p.payment_date).getTime() <= e);
  }

  return paginate(data, page, limit);
};

/**
 * Fetch paid months for a child
 */
export const fetchPaidMonths = async (childId: number): Promise<PaidMonth[]> => {
  await delay();
  const records = payments
    .filter((p) => p.child_id === childId)
    .flatMap((p) => p.monthly_records || []);
  return records.map((r) => ({
    year: new Date(r.month).getFullYear(),
    month: new Date(r.month).getMonth() + 1,
  }));
};

/**
 * Create payment
 */
export const createPayment = async (
  payload: NewPaymentRequest
): Promise<CreatePaymentResponse> => {
  await delay();

  const existingMonths = new Set(
    payments
      .filter((p) => p.child_id === payload.child_id)
      .flatMap((p) => p.monthly_records.map((m) => m.month))
  );

  const recordedMonths: string[] = [];
  const skippedMonths: string[] = [];
  payload.months.forEach((m) => {
    if (existingMonths.has(m)) skippedMonths.push(m);
    else recordedMonths.push(m);
  });

  const paymentId = nextId();
  const child = children.find((c) => c.id === payload.child_id);
  const payment: Payment = {
    id: paymentId,
    child_id: payload.child_id,
    total_amount: payload.total_amount.toString(),
    payment_date: new Date().toISOString(),
    method: payload.method,
    notes: payload.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    monthly_records: buildMonthlyRecords(
      payload.child_id,
      paymentId,
      recordedMonths,
      payload.total_amount / Math.max(recordedMonths.length || 1, 1)
    ),
    category: payload.category || (payload.months.length === 0 ? "registration" : "monthly"),
    branch: child?.branch,
    program: child?.program,
  };

  payments = [payment, ...payments];

  if (payment.category === "registration" && child) {
    child.registrationPaid = true;
  }

  return {
    payment: {
      id: payment.id,
      child_id: payment.child_id,
      total_amount: payment.total_amount,
      payment_date: payment.payment_date,
      method: payment.method,
      notes: payment.notes,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    },
    recordedMonths,
    skippedMonths,
  };
};

/**
 * Delete payment
 */
export const deletePayment = async (id: number) => {
  await delay();
  payments = payments.filter((p) => p.id !== id);
  return { message: "deleted" };
};

/**
 * Export payments as CSV
 */
export const exportPayments = async (
  params: Record<string, any> = {}
): Promise<{ filename: string; csv: string }> => {
  await delay();
  const { child_id, parent_id, month, branch, startDate, endDate } = params;

  let data = [...payments];
  if (child_id) data = data.filter((p) => p.child_id === Number(child_id));
  if (branch) data = data.filter((p) => p.branch === branch);
  if (month)
    data = data.filter((p) =>
      p.monthly_records.some((m) => m.month.startsWith(month))
    );
  if (parent_id) {
    const linkedChildIds = children
      .filter((c) => c.parents.some((p) => p.id === Number(parent_id)))
      .map((c) => c.id);
    data = data.filter((p) => linkedChildIds.includes(p.child_id));
  }

  if (startDate) {
    const s = new Date(startDate).getTime();
    data = data.filter((p) => new Date(p.payment_date).getTime() >= s);
  }
  if (endDate) {
    const e = new Date(endDate).getTime();
    data = data.filter((p) => new Date(p.payment_date).getTime() <= e);
  }

  // Build CSV
  const headers = [
    "id",
    "child_id",
    "total_amount",
    "payment_date",
    "method",
    "notes",
    "category",
    "branch",
    "program",
  ];

  const rows = data.map((p) => [
    p.id,
    p.child_id,
    p.total_amount,
    p.payment_date,
    p.method,
    (p.notes || "")?.replace(/"/g, '""'),
    p.category || "",
    p.branch || "",
    p.program || "",
  ]);

  const csv = [headers.join(","),
    ...rows.map((r) => r.map((c) => (typeof c === "string" && c.includes(",")) ? `"${c}"` : `${c}`).join(","))
  ].join("\n");

  const filename = `payments_export_${new Date().toISOString()}.csv`;
  return { filename, csv };
};

/**
 * Fetch payment report
 */
export const fetchPaymentReport = async (
  params: Record<string, any> = {}
): Promise<PaymentReport> => {
  await delay();
  const reportSource = (await fetchPayments(params)).data;
  const breakdownMap = new Map<string, number>();
  reportSource.forEach((p) => {
    const amount = parseFloat(p.total_amount);
    breakdownMap.set(p.method, (breakdownMap.get(p.method) || 0) + amount);
  });

  return {
    breakdown: Array.from(breakdownMap.entries()).map(([method, amount]) => ({
      method,
      amount,
    })),
    total: reportSource.reduce((sum, p) => sum + parseFloat(p.total_amount), 0),
    page: 1,
    limit: reportSource.length,
    totalPages: 1,
  };
};

/**
 * Fetch unpaid children for a specific month
 */
export const fetchUnpaidChildren = async (params: {
  month: string;
  page?: number;
  limit?: number;
  branch?: Branch;
}) => {
  await delay();

  let unpaid = children.filter((child) => {
    // Filter by branch if specified
    if (params.branch && child.branch !== params.branch) return false;

    const paidMonths = new Set(
      payments
        .filter((p) => p.child_id === child.id)
        .flatMap((p) => p.monthly_records.map((m) => m.month))
    );
    return !paidMonths.has(params.month);
  });

  const page = params.page || 1;
  const limit = params.limit || unpaid.length || 1;
  return {
    total: unpaid.length,
    page,
    limit,
    totalPages: Math.ceil(unpaid.length / limit),
    data: unpaid.slice((page - 1) * limit, (page - 1) * limit + limit).map(
      (c) => ({
        id: c.id,
        fname: c.fname,
        lname: c.lname,
        gender: c.gender,
        birthdate: c.birthdate,
      })
    ),
  };
};
