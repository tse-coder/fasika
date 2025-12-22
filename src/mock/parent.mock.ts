import { Parent } from "@/types/parent.types";
import { PaginatedResponse } from "@/types/api.types";
import { mockParents } from "./data";
import { delay } from "./utils";

let parents: Parent[] = [...mockParents];

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
 * Fetch parents (filters + pagination)
 */
export const fetchParents = async (
  params: Record<string, any> = {}
): Promise<PaginatedResponse<Parent>> => {
  await delay();
  const query = (params.query || "").toLowerCase();
  const filtered = parents.filter((p) =>
    `${p.fname} ${p.lname} ${p.phone_number}`.toLowerCase().includes(query)
  );
  return paginate(filtered, params.page, params.limit);
};

/**
 * Fetch parent by ID
 */
export const fetchParentById = async (id: number): Promise<Parent | null> => {
  await delay();
  return parents.find((p) => p.id === id) || null;
};

/**
 * Register parent
 */
export const registerParent = async (
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

/**
 * Update parent
 */
export const updateParent = async (
  id: number,
  updates: Partial<Parent>
): Promise<Parent> => {
  await delay();
  const idx = parents.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Parent not found");
  parents[idx] = { ...parents[idx], ...updates, updated_at: new Date().toISOString() };
  return parents[idx];
};
