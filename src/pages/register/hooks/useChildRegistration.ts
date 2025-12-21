import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useChildren } from "@/stores/children.store";
import { Parent } from "@/types/parent.types";
import { createChild } from "@/mock/child.mock";

export interface ChildFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  relationship: string;
}

/**
 * Custom hook to manage child form and registration
 */
export const useChildRegistration = () => {
  const { toast } = useToast();
  const { fetchChildren } = useChildren();
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [childForm, setChildForm] = useState<ChildFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    relationship: "guardian",
  });
  const [childErrors, setChildErrors] = useState<Record<string, string>>({});

  const initialChildForm: ChildFormData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    relationship: "guardian",
  };

  const validateChildForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!childForm.firstName.trim()) errs.firstName = "First name is required";
    if (!childForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!childForm.dateOfBirth && !childForm.age)
      errs.dateOfBirth = "Provide date of birth or age";
    if (!childForm.gender) errs.gender = "Gender is required";
    if (!childForm.relationship) errs.relationship = "Relationship is required";
    return errs;
  };

  const handleChildChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChildForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    selectedParent: number | null,
    parentList: Parent[]
  ) => {
    const parent = parentList.find((p) => p.id === selectedParent);
    if (!parent) {
      console.warn("[Register] handleSubmit - no parent selected");
      return;
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

    const childPayload = {
      fname: childForm.firstName,
      lname: childForm.lastName,
      gender: childForm.gender || "M",
      birthdate,
      is_active: true,
      parents: [
        {
          parentId: parent.id,
          relationship: childForm.relationship || "guardian",
          isPrimary: true,
        },
      ],
    } as any;

    try {
      setIsSubmittingChild(true);
      await createChild(childPayload as any);
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
    setChildForm(initialChildForm);
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
  };
};
