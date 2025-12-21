import raw from "./data/children.json";
import { Child, ChildQuery } from "@/types/child.types";
import { PaginatedResponse } from "@/types/api.types";
import { delay } from "./utils";

let children: Child[] = structuredClone(raw as Child[]);

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
  child: Omit<Child, "id" | "monthlyFee">
): Promise<Child> => {
  await delay();

  const newChild: Child = {
    ...child,
    id: Math.max(0, ...children.map(c => c.id)) + 1,
    monthlyFee: 0,
    parents: child.parents ?? [],
  };

  children.push(newChild);
  return newChild;
};

/**
 * Fetch children (filters + pagination)
 */
export const fetchChildren = async (
  params: ChildQuery = {}
): Promise<PaginatedResponse<Child>> => {
  await delay();

  let filtered = [...children];

  if (params.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.fname.toLowerCase().includes(q) ||
        c.lname.toLowerCase().includes(q)
    );
  }

  if (params.gender) {
    filtered = filtered.filter(c => c.gender === params.gender);
  }

  if (typeof params.is_active === "boolean") {
    filtered = filtered.filter(c => c.is_active === params.is_active);
  }

  return paginate(filtered, params.page, params.limit);
};

/**
 * Fetch child by ID
 */
export const fetchChildById = async (id: number): Promise<Child> => {
  await delay();
  const child = children.find(c => c.id === id);
  if (!child) throw new Error("Child not found");
  return child;
};

/**
 * Update child
 */
export const updateChild = async (
  id: number,
  updates: Partial<Child>
): Promise<Child> => {
  await delay();

  const index = children.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Child not found");

  children[index] = {
    ...children[index],
    ...updates,
  };

  return children[index];
};
