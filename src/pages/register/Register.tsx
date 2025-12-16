import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { registerParent } from "@/api/parent.api";
import { createChild } from "@/api/child.api";
import { useParents } from "@/stores/parent.store";
import { useChildren } from "@/stores/children.store";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, User } from "lucide-react";
import { ParentStep } from "./sections/parentStep";
import { NewParentStep } from "./sections/parentCreation";
import { ChildInfoStep } from "./sections/childInfoStep";
import { Button } from "@/components/ui/button";
import type { Parent } from "@/types/parent.types";
import { LoaderIcon } from "@/components/ui/skeleton-card";

// ------------------------------
// Main Sequential Form
// ------------------------------
export default function RegisterSequential() {
  const { toast } = useToast();
  const {
    fetchParents,
    isLoading: parentsLoading,
  } = useParents();
  const { fetchChildren } = useChildren();
  const [parentPage, setParentPage] = useState(1);
  const [parentSearch, setParentSearch] = useState("");
  const [isLoadingMoreParents, setIsLoadingMoreParents] = useState(false);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState("select-parent");
  const [isSavingParent, setIsSavingParent] = useState(false);
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [parentList, setParentList] = useState<Parent[]>([]);
  const initialChildForm = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    relationship: "guardian",
  };

  const [childForm, setChildForm] = useState(initialChildForm);

  const [childErrors, setChildErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // fetch parents when page or search changes and manage loading-more state
    let mounted = true;
    const load = async () => {
      try {
        setIsLoadingMoreParents(true);
        const trimmed = parentSearch.trim();
        const params =
          trimmed.length > 0
            ? { query: trimmed }
            : {
                page: parentPage,
              };

        const data = (await fetchParents(params)) || [];

        if (!mounted) return;

        setParentList((prev) =>
          parentPage === 1
            ? data
            : [
                ...prev,
                ...data.filter((parent) => !prev.some((p) => p.id === parent.id)),
              ]
        );
      } catch (e) {
        // swallow - store handles errors
      } finally {
        if (mounted) setIsLoadingMoreParents(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [parentPage, parentSearch]);

  const handleChildChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChildForm((prev) => ({ ...prev, [name]: value }));
  };

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
    console.log("[Register] handleAddParent - payload", payload);
    try {
      const newParent = await registerParent(payload as any);
      console.log("[Register] handleAddParent - created", newParent);
      const trimmed = parentSearch.trim();
      const refreshed =
        (await fetchParents(trimmed ? { query: trimmed } : { page: 1 })) || [];
      setParentPage(1);
      setParentList(refreshed);

      // API adapters may return the created parent directly or wrapped in { data }
      const createdId =
        (newParent && (newParent as any).id) ||
        (newParent && (newParent as any).data && (newParent as any).data.id) ||
        null;

      // Try to find the parent in the refreshed list (covers cases where API wraps differently)
      const resolvedId =
        createdId ||
        refreshed.find((p) => p.phone_number === payload.phone_number)?.id ||
        refreshed[0]?.id ||
        null;

      if (resolvedId) setSelectedParent(resolvedId as number);

      toast({
        title: "Parent created",
        description: "Parent has been saved successfully.",
      });

      // Move to child creation for the newly created parent
      setCurrentStep("child-info");
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

  const handleSubmit = async () => {
    console.log("[Register] handleSubmit - start");
    const parent = parentList.find((p) => p.id === selectedParent);
    console.log(
      "[Register] handleSubmit - selectedParent",
      selectedParent,
      parent
    );
    if (!parent) {
      console.warn("[Register] handleSubmit - no parent selected");
      return;
    }
    // final validation before submit
    const childValidation = validateChildForm();
    setChildErrors(childValidation);
    console.log("[Register] handleSubmit - validation", { childValidation });
    if (Object.keys(childValidation).length > 0) return;

    // If user provided age but not dateOfBirth, convert age -> birthdate (approx)
    let birthdate = childForm.dateOfBirth;
    if (!birthdate && childForm.age) {
      const now = new Date();
      const year = now.getFullYear() - Number(childForm.age || 0);
      // set to same month/day as today for approximation
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

    console.log("[Register] handleSubmit - childPayload", childPayload);
    try {
      setIsSubmittingChild(true);
      const created = await createChild(childPayload as any);
      console.log("[Register] handleSubmit - created child", created);
      await fetchChildren();
      toast({ title: "Success!", description: "Child has been registered." });

      // Reset form and errors, clear selected parent, return to first step
      setChildForm(initialChildForm);
      setChildErrors({});
      setSelectedParent(null);
      setCurrentStep("select-parent");
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
    } finally {
      setIsSubmittingChild(false);
    }
  };

  const validateChildForm = () => {
    const errs: Record<string, string> = {};
    if (!childForm.firstName.trim()) errs.firstName = "First name is required";
    if (!childForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!childForm.dateOfBirth && !childForm.age)
      errs.dateOfBirth = "Provide date of birth or age";
    if (!childForm.gender) errs.gender = "Gender is required";
    if (!childForm.relationship) errs.relationship = "Relationship is required";
    return errs;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        {/* Step 1: Select Parent */}
        {currentStep === "select-parent" && (
          <ParentStep
            parents={parentList}
            onSelect={(id) => {
              setSelectedParent(id);
              setCurrentStep("child-info");
            }}
            onAddNew={() => setCurrentStep("add-parent")}
            onNext={
              parentSearch.trim()
                ? undefined
                : () => setParentPage((p) => p + 1)
            }
            onSearch={(q: string) => {
              setParentPage(1);
              setParentSearch(q || "");
            }}
            isLoading={parentsLoading || isLoadingMoreParents}
          />
        )}

        {/* Step 2: Add New Parent */}
        {currentStep === "add-parent" && (
          <NewParentStep
            onSave={handleAddParent}
            onCancel={() => setCurrentStep("select-parent")}
            isSaving={isSavingParent}
          />
        )}

        {/* Step 3: Child Information */}
        {currentStep === "child-info" && (
          <>
            <ChildInfoStep
              form={childForm}
              onChange={handleChildChange}
              errors={childErrors}
            />
            <div className="w-full flex">
              <Button
                className="flex-1 mr-2"
                onClick={() => setCurrentStep("select-parent")}
              >
                previous
              </Button>
              <Button
                className="flex-1"
                disabled={isSubmittingChild}
                onClick={async () => {
                  const errs = validateChildForm();
                  setChildErrors(errs);
                  if (Object.keys(errs).length === 0) await handleSubmit();
                }}
              >
                {isSubmittingChild ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderIcon className="w-4 h-4" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
