import { Child, ChildQuery } from "@/types/child.types";
import { apiGet, apiPost, apiPut } from "./http";
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

export const fetchChildById = async (id: number) => {
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

export const updateChild = async (id: number, updates: Partial<Child>) => {
  console.log("[API] updateChild - start", { id, updates });
  try {
    const res = await apiPut<Child>(`/api/child/${id}`, updates);
    console.log("[API] updateChild - success", res);
    return res;
  } catch (err) {
    console.error("[API] updateChild - error", err);
    throw err;
  }
};
