export type Admin = {
  id: number;
  username: string;
  password?: string; // Optional, usually not returned from API
  role: "superadmin" | "admin";
  created_at: string;
  updated_at: string;
};

export interface AdminState {
  admins: Admin[];
  fetchAdmins: () => Promise<Admin[]>;
  createAdmin: (data: {
    username: string;
    password: string;
    role: "superadmin" | "admin";
  }) => Promise<Admin>;
  deleteAdmin: (id: number) => Promise<void>;
  updateAdmin: (
    id: number,
    data: { username?: string; password?: string }
  ) => Promise<Admin>;
  isLoading: boolean;
  error: string | null;
}
