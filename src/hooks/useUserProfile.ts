import { useAuth } from "@/stores/auth.store";

/**
 * Custom hook to get user profile information
 * Note: Profile updates require admin privileges via the users management page
 */
export const useUserProfile = () => {
  const { user, updateUser } = useAuth();

  return {
    name: user?.name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
    role: user?.role || "USER",
    updateUser,
  };
};
