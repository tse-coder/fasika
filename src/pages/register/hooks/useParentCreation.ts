import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParents } from "@/stores/parent.store";
import { registerParent } from "@/api/parent.api";
import { Parent } from "@/types/parent.types";

/**
 * Custom hook to handle parent creation
 */
export const useParentCreation = (
  onParentCreated: (parentId: number) => void,
  refreshParents: () => Promise<Parent[]>
) => {
  const { toast } = useToast();
  const [isSavingParent, setIsSavingParent] = useState(false);

  const handleAddParent = async (data: {
    fname: string;
    lname: string;
    email?: string;
    phone: string;
    gender: string;
  }) => {
    if (isSavingParent) return;
    if (!data.phone || !data.fname) return;

    setIsSavingParent(true);
    const fname = data.fname.trim();
    const lname = data.lname.trim() || "";
    const payload = {
      fname,
      lname,
      gender: data.gender,
      phone_number: data.phone,
      email: data.email || "",
      is_active: true,
    };

    try {
      const newParent = await registerParent(payload as any);
      const refreshed = await refreshParents();

      // Try to find the parent in the refreshed list
      const createdId =
        (newParent && (newParent as any).id) ||
        (newParent && (newParent as any).data && (newParent as any).data.id) ||
        refreshed.find((p) => p.phone_number === payload.phone_number)?.id ||
        refreshed[0]?.id ||
        null;

      toast({
        title: "Parent created",
        description: "Parent has been saved successfully.",
      });

      if (createdId) {
        onParentCreated(createdId);
      }
    } catch (err: any) {
      console.error("[Register] handleAddParent - error", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create parent";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSavingParent(false);
    }
  };

  return {
    isSavingParent,
    handleAddParent,
  };
};
