import { useEffect } from "react";
import { useAdminsStore } from "@/stores/admins.store";

/**
 * Custom hook to fetch and manage admins data
 */
export const useAdmins = () => {
  const { admins, fetchAdmins, isLoading, error } = useAdminsStore();

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return {
    admins,
    isLoading,
    error,
    refetch: fetchAdmins,
  };
};
