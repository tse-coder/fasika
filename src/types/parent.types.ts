export interface Parent {
  id: number;
  fname: string;
  lname: string;
  gender: "M" | "F";
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface ParentQuery {
  query?: string;
  page?: number;
  limit?: number;
  gender?: string;
  is_active?: boolean;
  email?: string;
  phone_number?: string;
  child_id?:string;
}

export interface parentState {
  parents: Parent[];
  fetchParents: (filters?: any) => Promise<Parent[]>;
  isLoading: boolean;
  error: string | null;
}

export interface ParentOutput {
  id: number;
  fname: string;
  lname: string;
  gender: "M" | "F";
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}