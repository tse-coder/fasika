// Legacy type - kept for backward compatibility
// Use User type from @/types/user.types instead
export type Admin = {
  id: string; // UUID
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
};

export interface AdminState {
  admins: Admin[];
  fetchAdmins: () => Promise<Admin[]>;
  createAdmin: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    dob?: string;
  }) => Promise<Admin>;
  deleteAdmin: (id: string) => Promise<void>;
  resetPassword: (id: string, newPassword: string) => Promise<Admin>;
  changeRole: (id: string, action: "PROMOTE" | "DEMOTE") => Promise<Admin>;
  isLoading: boolean;
  error: string | null;
}
