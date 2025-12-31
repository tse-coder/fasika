import { Branch, ChildParentLink } from "./api.types";
import { Program } from "@/mock/data";

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
  discountPercent?: number;
  discountNote?: string;
  registerationYear?: number;
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
