import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminsStore } from "@/stores/admins.store";
import { useAuth } from "@/stores/auth.store";
import { CreateUserRequest } from "@/types/user.types";

/**
 * Custom hook to handle admin actions (create, delete, promote)
 */
export const useAdminActions = () => {
  const { toast } = useToast();
  const { createAdmin, deleteAdmin, changeRole } = useAdminsStore();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async (
    data: CreateUserRequest & { makeAdmin: boolean }
  ) => {
    setIsCreating(true);
    try {
      const { makeAdmin, ...userData } = data;

      // Create user (will be created as USER by default)
      const newUser = await createAdmin(userData);

      // If admin privileges requested, promote the user
      if (makeAdmin) {
        await changeRole(newUser.id, "PROMOTE");
      }

      toast({
        title: "User Created",
        description: `${data.name} has been created successfully${
          makeAdmin ? " with admin privileges" : ""
        }.`,
      });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create user.";
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

  const handleDeleteAdmin = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteAdmin(id);
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete user.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const isSuperAdmin = user?.role === "ADMIN";

  return {
    handleCreateAdmin,
    handleDeleteAdmin,
    isDeleting,
    isCreating,
    isSuperAdmin,
  };
};
