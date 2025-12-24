import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Parent } from "@/types/parent.types";
import { registerParent } from "@/api/parent.api";
import { useBranchStore } from "@/stores/branch.store";
// import { registerParent } from "@/mock/parent.mock";

/**
 * Custom hook to handle parent creation
 */
export const useParentCreation = (
  onParentCreated: (parentId: number) => void,
  refreshParents: () => Promise<Parent[]>
) => {
  const { toast } = useToast();
  const [isSavingParent, setIsSavingParent] = useState(false);
  const {currentBranch} = useBranchStore()
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
      phone: data.phone,
      email: data.email || "",
      branch: currentBranch
    };

    try {
      const newParent = await registerParent(payload as Omit<Parent, "id"|"created_at"| "updated_at"| "is_active">);
      const refreshed = await refreshParents();

      // Try to find the parent in the refreshed list
      const createdId =
        (newParent && (newParent as any).id) ||
        (newParent && (newParent as any).data && (newParent as any).data.id) ||
        refreshed.find((p) => p.phone === payload.phone)?.id ||
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
