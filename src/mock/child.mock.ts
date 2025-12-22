import { Child, ChildQuery } from "@/types/child.types";
import { PaginatedResponse, Branch } from "@/types/api.types";
import { mockChildren } from "./data";
import { delay } from "./utils";

let children: Array<Child & { branch?: Branch; program?: string }> = [
  ...mockChildren,
];

const nextId = (() => {
  let current = 4000;
  return () => ++current;
})();

/**
 * Pagination helper (matches your PaginatedResponse)
 */
const paginate = <T>(
  data: T[],
  page = 1,
  limit = 10
): PaginatedResponse<T> => ({
  data: data.slice((page - 1) * limit, page * limit),
  total: data.length,
  page,
  limit,
});

/**
 * Create child
 */
export const createChild = async (
  child: Omit<Child, "id">
): Promise<Child> => {
  await delay();

  const newChild: Child & { branch?: Branch; program?: string } = {
    ...child,
    id: nextId(),
    monthlyFee: child.monthlyFee,
  };

  children.push(newChild);
  return newChild;
};

/**
 * Fetch children (filters + pagination)
 */
export const fetchChildren = async (
  params: Record<string, any> = {}
): Promise<PaginatedResponse<Child>> => {
  await delay();

  let filtered = [...children];

  // Filter by branch if specified
  if (params.branch) {
    filtered = filtered.filter((child) => child.branch === params.branch);
  }

  // Filter by search query
  if (params.query) {
    const query = params.query.toLowerCase();
    filtered = filtered.filter((child) =>
      `${child.fname} ${child.lname}`.toLowerCase().includes(query) ||
      `${child.parents?.[0]?.id || ""}`.includes(query)
    );
  }

  // Filter by active status
  if (typeof params.is_active === "boolean") {
    filtered = filtered.filter((child) => child.is_active === params.is_active);
  }

  return paginate(filtered, params.page, params.limit);
};

/**
 * Fetch child by ID
 */
export const fetchChildById = async (id: number): Promise<Child | null> => {
  await delay();
  return children.find((c) => c.id === id) || null;
};

/**
 * Update child
 */
export const updateChild = async (id: number, updates: Partial<Child>): Promise<Child> => {
  await delay();
  const idx = children.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Child not found");
  children[idx] = { ...children[idx], ...updates };
  return children[idx];
};
