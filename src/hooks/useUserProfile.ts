import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/auth.store";
import { updateCurrentUser } from "@/api/admin.api";

/**
 * Custom hook to handle user profile updates
 */
export const useUserProfile = () => {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (data: {
    username?: string;
    password?: string;
  }) => {
    setIsUpdating(true);
    try {
      const response = await updateCurrentUser(data);

      // Update local user state
      if (data.username) {
        updateUser({ username: data.username });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleUpdate,
    isUpdating,
    username: user?.username || "",
  };
};
