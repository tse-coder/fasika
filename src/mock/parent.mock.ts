import raw from "./data/parents.json";
import { Parent, ParentQuery } from "@/types/parent.types";
import { PaginatedResponse } from "@/types/api.types";
import { delay, paginate } from "./utils";

let parents: Parent[] = structuredClone(raw as Parent[]);

export const fetchParents = async (
  params: ParentQuery = {}
): Promise<PaginatedResponse<Parent>> => {
  await delay();

  let filtered = [...parents];

  if (params.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      p => p.fname.toLowerCase().includes(q) || p.lname.toLowerCase().includes(q)
    );
  }

  if (params.gender) {
    filtered = filtered.filter(p => p.gender === params.gender);
  }

  if (params.email) {
    filtered = filtered.filter(p => p.email === params.email);
  }

  if (params.phone_number) {
    filtered = filtered.filter(p => p.phone_number === params.phone_number);
  }

  return paginate(filtered, params.page, params.limit);
};

export const fetchParentById = async (id: number): Promise<Parent> => {
  await delay();
  const parent = parents.find(p => p.id === id);
  if (!parent) throw new Error("Parent not found");
  return parent;
};

export const registerParent = async (
  parent: Omit<Parent, "id" | "created_at" | "updated_at">
): Promise<Parent> => {
  await delay();

  const now = new Date().toISOString();
  const newParent: Parent = {
    ...parent,
    id: Math.max(0, ...parents.map(p => p.id)) + 1,
    created_at: now,
    updated_at: now,
  };

  parents.push(newParent);
  return newParent;
};

export const updateParent = async (
  id: number,
  updates: Partial<Parent>
): Promise<Parent> => {
  await delay();
  const index = parents.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Parent not found");

  parents[index] = {
    ...parents[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return parents[index];
};
