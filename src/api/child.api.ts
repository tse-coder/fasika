import { Child, ChildQuery } from "@/types/child.types";
import { apiGet, apiPost, apiPut, apiDelete } from "./http";
import { PaginatedResponse } from "@/types/api.types";

export const createChild = async (child: Omit<Child, "id"|"monthlyFee">) => {
  console.log("[API] createChild - start", child);
  try {
    const res = await apiPost<Child>("/api/child", child);
    console.log("[API] createChild - success", res);
    return res;
  } catch (err) {
    console.error("[API] createChild - error", err);
    throw err;
  }
};

export const fetchChildren = async (params: ChildQuery = {}) => {
  console.log("[API] fetchChildren - start", params);
  try {
    const res = await apiGet<PaginatedResponse<Child>>("/api/child", params);
    console.log("[API] fetchChildren - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchChildren - error", err);
    throw err;
  }
};

export const fetchChildById = async (id: string) => {
  console.log("[API] fetchChildById - start", id);
  try {
    const res = await apiGet<Child>(`/api/child/${id}`);
    console.log("[API] fetchChildById - success", res);
    return res;
  } catch (err) {
    console.error("[API] fetchChildById - error", err);
    throw err;
  }
};

export const deleteChild = async (id: string) => {
  console.log("[API] deleteChild - start", id);
  try {
    const res = await apiDelete<Child>(`/api/child/${id}`);
    console.log("[API] deleteChild - success", res);
    return res;
  } catch (err) {
    console.error("[API] deleteChild - error", err);
    throw err;
  }
};

export const updateChild = async (id: string, updates: Partial<Child>) => {
  console.log("[API] updateChild - start", { id, updates });
  try {
    // Map frontend field names to backend field names
    const backendUpdates = {
      ...updates,
      discount_note: updates.discountNote,
    };
    // Remove the frontend discountNote field
    delete (backendUpdates as any).discountNote;
    
    const res = await apiPut<Child>(`/api/child/${id}`, backendUpdates);
    console.log("[API] updateChild - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateChild - error", err);
    throw err;
  }
};
