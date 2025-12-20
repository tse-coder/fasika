import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminsStore } from "@/stores/admins.store";
import { useAuth } from "@/stores/auth.store";

/**
 * Custom hook to handle admin actions (create, delete)
 */
export const useAdminActions = () => {
  const { toast } = useToast();
  const { createAdmin, deleteAdmin } = useAdminsStore();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async (data: {
    username: string;
    password: string;
    role: "superadmin" | "admin";
  }) => {
    setIsCreating(true);
    try {
      await createAdmin(data);
      toast({
        title: "Admin Created",
        description: `${data.username} has been created successfully.`,
      });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create admin.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteAdmin(id);
      toast({
        title: "Admin Deleted",
        description: "The admin has been deleted successfully.",
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete admin.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const isSuperAdmin = user?.role === "superadmin";

  return {
    handleCreateAdmin,
    handleDeleteAdmin,
    isDeleting,
    isCreating,
    isSuperAdmin,
  };
};
