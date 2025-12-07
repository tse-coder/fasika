import { useState, useEffect } from "react";
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

// ------------------------------
// Main Sequential Form
// ------------------------------
export default function RegisterSequential() {
  const { toast } = useToast();
  const { parents = [], fetchParents } = useParents();
  const { fetchChildren } = useChildren();
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState("select-parent");
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
    fetchParents();
  }, []);

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
    if (!data.phone || !data.fname) return;
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
      await fetchParents();

      // API adapters may return the created parent directly or wrapped in { data }
      const createdId =
        (newParent && (newParent as any).id) ||
        (newParent && (newParent as any).data && (newParent as any).data.id) ||
        null;

      if (createdId) setSelectedParent(createdId as number);
      // Move to child creation for the newly created parent
      setCurrentStep("child-info");
    } catch (err: any) {
      console.error("[Register] handleAddParent - error", err);
      toast({
        title: "Error",
        description: "Failed to create parent",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    console.log("[Register] handleSubmit - start");
    const parent = parents.find((p) => p.id === selectedParent);
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
      toast({
        title: "Error",
        description: "Failed to register child",
        variant: "destructive",
      });
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="dashboard-title">Register New Child</h1>
            <p className="text-muted-foreground">
              Add a new child information and submit
            </p>
          </div>
        </div>

        {/* Step 1: Select Parent */}
        {currentStep === "select-parent" && (
          <ParentStep
            parents={parents}
            onSelect={(id) => {
              setSelectedParent(id);
              setCurrentStep("child-info");
            }}
            onAddNew={() => setCurrentStep("add-parent")}
          />
        )}

        {/* Step 2: Add New Parent */}
        {currentStep === "add-parent" && (
          <NewParentStep
            onSave={handleAddParent}
            onCancel={() => setCurrentStep("select-parent")}
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
                onClick={async () => {
                  const errs = validateChildForm();
                  setChildErrors(errs);
                  if (Object.keys(errs).length === 0) await handleSubmit();
                }}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
