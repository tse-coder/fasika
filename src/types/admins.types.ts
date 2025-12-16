export type Admin = {
  id: number;
  username: string;
  password: string;
  role: "superadmin" | "admin";
  created_at: string;
  updated_at: string;
};

export interface AdminState {
  admins: Admin[];
  fetchAdmins: () => Promise<Admin[]>;
  updateAdmin: (id: number, data: Partial<Admin>) => Promise<Admin | null>;
  isLoading: boolean;
  error: string | null;
}
