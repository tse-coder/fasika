import {
  branches,
  mockChildren,
  mockParents,
  mockPaymentInfo,
  mockPayments,
  mockUsers,
  type MockUser,
  type PaymentInfoData,
  type Program,
} from "./data";
import { Branch, PaginatedResponse } from "@/types/api.types";
import { Parent } from "@/types/parent.types";
import { Child } from "@/types/child.types";
import {
  CreatePaymentResponse,
  NewPaymentRequest,
  PaidMonth,
  Payment,
  PaymentReport,
  PaymentsPaginated,
} from "@/types/payment.types";
import {  CreateUserRequest, User } from "@/types/user.types";

// Local login request/response types (avoid importing from the real API layer)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  name: string;
  email: string;
  sub?: string;
  role?: "ADMIN" | "USER";
}

let users: MockUser[] = [...mockUsers];
let parents: Parent[] = [...mockParents];
let children: Array<Child & { branch?: Branch; program?: Program }> = [
  ...mockChildren,
];
let payments: Payment[] = [...mockPayments];
let paymentInfo: PaymentInfoData = { ...mockPaymentInfo };

const nextId = (() => {
  let current = 4000;
  return () => ++current;
})();

const sanitizeUser = (user: MockUser): User => {
  const { password, ...rest } = user;
  return rest;
};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogin = async (
  data: LoginRequest
): Promise<LoginResponse & { user: User }> => {
  await delay();
  console.log(users)
  console.log(data.email, data.password)
  const found = users.find(
    (u) => {
        console.log(u.email.toLowerCase(), data.email.toLowerCase())
        return u.email.toLowerCase() === data.email.toLowerCase()
    }

  );
  if (!found || found.password !== data.password) {
    throw new Error("Invalid credentials");
  }

  const payload = btoa(
    JSON.stringify({
      sub: found.id,
      role: found.role,
      branch: found.branch,
      name: found.name,
      email: found.email,
    })
  );
  const access_token = `mock.${payload}.token`;
  // @ts-expect-error
  return { access_token, user: sanitizeUser(found) };
};

export const mockFetchUsers = async (): Promise<User[]> => {
  await delay();
  return users.map(sanitizeUser);
};

export const mockCreateUser = async (
  data: CreateUserRequest
): Promise<User> => {
  await delay();
  const newUser: MockUser = {
    ...data,
    id: `u-${nextId()}`,
    role: "USER",
    branch: data.branch || "Bulbula",
    dob: data.dob || null,
    phone: data.phone || null,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: data.password,
  };
  users = [...users, newUser];
  return sanitizeUser(newUser);
};

export const mockDeleteUser = async (id: string): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.isDeleted = true;
  existing.deletedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockResetPassword = async (
  id: string,
  data: { newPassword: string }
): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.password = data.newPassword;
  existing.updatedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockChangeRole = async (
  id: string,
  action: "PROMOTE" | "DEMOTE"
): Promise<User> => {
  await delay();
  const existing = users.find((u) => u.id === id);
  if (!existing) throw new Error("User not found");
  existing.role = action === "PROMOTE" ? "ADMIN" : "USER";
  existing.updatedAt = new Date().toISOString();
  return sanitizeUser(existing);
};

export const mockFetchParents = async (
  params: Record<string, any> = {}
): Promise<PaginatedResponse<Parent>> => {
  await delay();
  const query = (params.query || "").toLowerCase();
  const filtered = parents.filter((p) =>
    `${p.fname} ${p.lname} ${p.phone_number}`.toLowerCase().includes(query)
  );
  return {
    data: filtered,
    total: filtered.length,
    page: params.page || 1,
    limit: params.limit || filtered.length,
  };
};

export const mockFetchParentById = async (id: number) => {
  await delay();
  return parents.find((p) => p.id === id) || null;
};

export const mockRegisterParent = async (
  data: Omit<Parent, "id" | "created_at" | "updated_at">
): Promise<Parent> => {
  await delay();
  const parent: Parent = {
    ...data,
    id: nextId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  parents = [...parents, parent];
  return parent;
};

export const mockUpdateParent = async (
  id: number,
  updates: Partial<Parent>
): Promise<Parent> => {
  await delay();
  const idx = parents.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Parent not found");
  parents[idx] = { ...parents[idx], ...updates, updated_at: new Date().toISOString() };
  return parents[idx];
};

export const mockFetchChildren = async (
  params: Record<string, any> = {}
): Promise<PaginatedResponse<Child>> => {
  await delay();
  const query = (params.query || "").toLowerCase();
  const branch = params.branch as Branch | undefined;
  const filtered = children.filter((child) => {
    const matchesQuery =
      `${child.fname} ${child.lname}`.toLowerCase().includes(query) ||
      `${child.parents?.[0]?.id || ""}`.includes(query);
    const matchesBranch = branch ? child.branch === branch : true;
    return matchesQuery && matchesBranch;
  });
  return {
    data: filtered,
    total: filtered.length,
    page: params.page || 1,
    limit: params.limit || filtered.length,
  };
};

export const mockFetchChildById = async (id: number) => {
  await delay();
  return children.find((c) => c.id === id) || null;
};

export const mockCreateChild = async (
  data: Omit<Child, "id">
) => {
  await delay();
  const child: Child & { branch?: Branch; program?: Program } = {
    ...data,
    id: nextId(),
    monthlyFee: data.monthlyFee,
  };
  children = [...children, child];
  return child;
};

export const mockUpdateChild = async (id: number, updates: Partial<Child>) => {
  await delay();
  const idx = children.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Child not found");
  children[idx] = { ...children[idx], ...updates };
  return children[idx];
};

export const mockFetchPaidMonths = async (childId: number): Promise<PaidMonth[]> => {
  await delay();
  const records = payments
    .filter((p) => p.child_id === childId)
    .flatMap((p) => p.monthly_records || []);
  return records.map((r) => ({
    year: new Date(r.month).getFullYear(),
    month: new Date(r.month).getMonth() + 1,
  }));
};

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

export const mockCreatePayment = async (
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
  }

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

export const mockDeletePayment = async (id: number) => {
  await delay();
  payments = payments.filter((p) => p.id !== id);
  return { message: "deleted" };
};

export const mockFetchPayments = async (
  params: Record<string, any> = {}
): Promise<PaymentsPaginated> => {
  await delay();
  const { child_id, parent_id, month, page = 1, limit = 20, branch, startDate, endDate, method } = params;

  let data = [...payments];

  if (child_id) data = data.filter((p) => p.child_id === Number(child_id));
  if (branch) data = data.filter((p) => p.branch === branch);
  if (month)
    data = data.filter((p) =>
      p.monthly_records.some((m) => m.month.startsWith(month))
    );
  if (method && method !== "all") data = data.filter((p) => p.method === method);
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

  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return {
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
    data: paged,
  };
};

/**
 * Export payments as CSV according to same filters as mockFetchPayments
 * Accepts optional `startDate` and `endDate` (ISO strings) to filter by payment_date.
 */
export const mockExportPayments = async (
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

export const mockFetchPaymentReport = async (
  params: Record<string, any> = {}
): Promise<PaymentReport> => {
  await delay();
  const reportSource = (await mockFetchPayments(params)).data;
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

export const mockFetchUnpaidChildren = async (params: {
  month: string;
  page?: number;
  limit?: number;
}) => {
  await delay();
  const unpaid = children.filter((child) => {
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

export const mockGetPaymentInfo = async () => {
  await delay();
  return paymentInfo;
};

export const mockUpdatePaymentInfo = async (updated: PaymentInfoData) => {
  await delay();
  paymentInfo = { ...updated };
  return paymentInfo;
};

export const mockSendPaymentReminder = async () => {
  await delay();
  return { sent_to: [] as string[] };
};

export const mockBranches = branches;

