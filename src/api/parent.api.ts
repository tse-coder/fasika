import { PaginatedResponse } from "@/types/api.types";
import { apiGet, apiPost, apiPut } from "./http";
import { Parent, ParentQuery } from "@/types/parent.types";

// Backend registers a global prefix '/api' in main.ts
export const fetchParents = async (params: ParentQuery = {}) => {
  console.log("[API] fetchParents - start", params);
  try {
    const res = await apiGet<PaginatedResponse<Parent>>("/api/parent", params);
    console.log("[API] fetchParents - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchParents - error", err);
    throw err;
  }
};

export const fetchParentById = async (id: number) => {
  console.log("[API] fetchParentById - start", id);
  try {
    const res = await apiGet<Parent>(`/api/parent/${id}`);
    console.log("[API] fetchParentById - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchParentById - error", err);
    throw err;
  }
};

export const registerParent = async (
  parentData: Omit<Parent, "id" | "created_at" | "updated_at">
) => {
  console.log("[API] registerParent - start", parentData);
  try {
    const res = await apiPost<Parent>("/api/parent", parentData);
    console.log("[API] registerParent - success", res);
    return res;
  } catch (err) {
    console.error("[API] registerParent - error", err);
    throw err;
  }
};

export const updateParent = async (id: number, updates: Partial<Parent>) => {
  console.log("[API] updateParent - start", { id, updates });
  try {
    const res = await apiPut<Parent>(`/api/parent/${id}`, updates);
    console.log("[API] updateParent - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateParent - error", err);
    throw err;
  }
};
