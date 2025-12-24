import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/stores/children.store";
import { Parent } from "@/types/parent.types";
// import { createChild } from "@/mock/api";
import { Branch } from "@/types/api.types";
import { Program } from "@/mock/data";
import { useBranchStore } from "@/stores/branch.store";
import { usePaymentInfoStore } from "@/stores/paymentInfo.store";
import { createChild } from "@/api/child.api";
import { Child } from "@/types/child.types";

export interface ChildFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  relationship: string;
  branch: Branch;
  program: Program;
  hasDiscount: boolean;
  discountNote: string;
}

/**
 * Custom hook to manage child form and registration
 */
export const useChildRegistration = () => {
  const { toast } = useToast();
  const { fetchChildren } = useChildren();
  const { currentBranch, branches } = useBranchStore();
  const { data: paymentInfo, load: loadPaymentInfo } = usePaymentInfoStore();
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [childForm, setChildForm] = useState<ChildFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    relationship: "guardian",
    branch: currentBranch,
    program: "kindergarten",
    hasDiscount: false,
    discountNote: "",
  });
  const [childErrors, setChildErrors] = useState<Record<string, string>>({});

  const initialChildForm: ChildFormData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    relationship: "guardian",
    branch: currentBranch,
    program: "kindergarten",
    hasDiscount: false,
    discountNote: "",
  };

  useEffect(() => {
    setChildForm((prev) => ({ ...prev, branch: currentBranch }));
  }, [currentBranch]);

  const discountPercent = useMemo(() => {
    const info = paymentInfo;
    if (!info) return 0;
    const match = info.recurring.find(
      (r) => r.branch === childForm.branch && r.program === childForm.program
    );
    return match?.discountPercent || 0;
  }, [paymentInfo, childForm.branch, childForm.program]);

  const validateChildForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!childForm.firstName.trim()) errs.firstName = "First name is required";
    if (!childForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!childForm.dateOfBirth && !childForm.age)
      errs.dateOfBirth = "Provide date of birth or age";
    if (!childForm.gender) errs.gender = "Gender is required";
    if (!childForm.relationship) errs.relationship = "Relationship is required";
    if (!childForm.branch) errs.branch = "Branch is required";
    if (!childForm.program) errs.program = "Program is required";
    if (childForm.hasDiscount && !childForm.discountNote.trim()) {
      errs.discountNote = "Add a note for the discount";
    }
    return errs;
  };

  const handleChildChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const nextValue = type === "checkbox" ? checked : value;
    setChildForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (
    selectedParent: number | null,
    parentList: Parent[]
  ) => {
    if (!selectedParent) {
      console.warn("[Register] handleSubmit - no parent selected");
      toast({
        title: "Error",
        description: "Please select a parent first.",
        variant: "destructive",
      });
      return false;
    }

    // Find parent in list, but don't fail if not found (could be newly created)
    const parent = parentList.find((p) => p.id === selectedParent);
    if (!parent) {
      console.warn("[Register] handleSubmit - parent not found in current list, but proceeding with selected ID");
    }

    const childValidation = validateChildForm();
    setChildErrors(childValidation);
    if (Object.keys(childValidation).length > 0) return false;

    let birthdate = childForm.dateOfBirth;
    if (!birthdate && childForm.age) {
      const now = new Date();
      const year = now.getFullYear() - Number(childForm.age || 0);
      birthdate = new Date(year, now.getMonth(), now.getDate()).toISOString();
    }

    const info = paymentInfo || (await loadPaymentInfo());
    const recurring = info?.recurring.find(
      (r) => r.branch === childForm.branch && r.program === childForm.program
    );

    const childPayload = {
      fname: childForm.firstName,
      lname: childForm.lastName,
      gender: childForm.gender || "M",
      birthdate,
      branch: childForm.branch,
      program: childForm.program,
      monthlyFee: recurring?.amount,
      discountPercent: childForm.hasDiscount ? discountPercent : undefined,
      discountNote: childForm.hasDiscount ? childForm.discountNote : undefined,
      parent_ids: [selectedParent],
    } as any;

    try {
      setIsSubmittingChild(true);
      await createChild(childPayload as Omit<Child, "id">);
      await fetchChildren();
      toast({ title: "Success!", description: "Child has been registered." });

      setChildForm(initialChildForm);
      setChildErrors({});
      return true;
    } catch (err: any) {
      console.error("[Register] handleSubmit - error creating child", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register child";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmittingChild(false);
    }
  };

  const resetForm = () => {
    setChildForm({ ...initialChildForm});
    setChildErrors({});
  };

  return {
    childForm,
    childErrors,
    isSubmittingChild,
    handleChildChange,
    handleSubmit,
    resetForm,
    validateChildForm: () => {
      const errs = validateChildForm();
      setChildErrors(errs);
      return errs;
    },
    discountPercent,
    branches,
  };
};
