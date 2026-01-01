import { Branch, ChildParentLink } from "./api.types";
export type Program = "kindergarten" | "childcare";

export interface Child {
  id: string;
  fname: string;
  lname: string;
  gender: string;
  birthdate: string;
  is_active: boolean;
  monthlyFee?: number;
  parents: ChildParentLink[];
  branch: Branch;
  program?: Program;
  registrationPaid?: boolean;
  discount_percent?: number;
  discountNote?: string;
  registerationYear?: number;
  has_discount: boolean;
}
export interface ChildQuery {
  query?: string;
  page?: number;
  limit?: number;
  gender?: string;
  is_active?: boolean;
}
export interface ChildState {
  children: Child[];
  fetchChildren: (filters?: any) => Promise<Child[]>;
  isLoading: boolean;
  error: string | null;
}
