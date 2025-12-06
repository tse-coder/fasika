import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { registerParent } from "@/api/parent.api";
import { createChild } from "@/api/child.api";
import { useParents } from "@/stores/parent.store";
import { useChildren } from "@/stores/children.store";
import type { Parent } from "@/types/parent.types";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, User, Wallet } from "lucide-react";
import { ParentStep } from "./sections/parentStep";
import { NewParentStep } from "./sections/parentCreation";
import { PaymentStep } from "./sections/paymentStep";
import { ChildInfoStep } from "./sections/childInfoStep";
import { Button } from "@/components/ui/button";
import { Child } from "@/types/child.types";

// ------------------------------
// Main Sequential Form
// ------------------------------
export default function RegisterSequential() {
  const { toast } = useToast();
  const { parents, fetchParents } = useParents();
  const { fetchChildren } = useChildren();
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState("select-parent");
  const [childForm, setChildForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    monthlyFee: "",
    gender: "",
    registrationAmount: "",
    bank: "",
  });

  const [childErrors, setChildErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetchParents();
  }, []);

  const handleChildChange = (e) => {
    setChildForm({ ...childForm, [e.target.name]: e.target.value });
  };

  const handleAddParent = async (data: {
    fullName: string;
    phone: string;
    email?: string;
  }) => {
    if (!data.phone || !data.fullName) return;
    const [fname = "", ...rest] = data.fullName.split(" ");
    const lname = rest.join(" ");
    const payload = {
      fname,
      lname,
      gender: "M",
      phone_number: data.phone,
      email: data.email || "",
      is_active: true,
    };
    console.log("[Register] handleAddParent - payload", payload);
    try {
      const newParent = await registerParent(payload as any);
      console.log("[Register] handleAddParent - created", newParent);
      await fetchParents();
      setSelectedParent(newParent.id);
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
    const paymentValidation = validatePaymentForm();
    setChildErrors(childValidation);
    setPaymentErrors(paymentValidation);
    console.log("[Register] handleSubmit - validation", {
      childValidation,
      paymentValidation,
    });
    if (
      Object.keys(childValidation).length > 0 ||
      Object.keys(paymentValidation).length > 0
    )
      return;

    const childPayload = {
      fname: childForm.firstName,
      lname: childForm.lastName,
      gender: childForm.gender || "M",
      birthdate: childForm.dateOfBirth,
      is_active: true,
      // monthlyFee: parseInt(childForm.monthlyFee || "0"),
      parents: [
        {
          parentId: parent.id,
          relationship: "guardian",
          isPrimary: true,
        },
      ],
    } as Omit<Child, "id" | "monthlyFee">;

    console.log("[Register] handleSubmit - childPayload", childPayload);
    try {
      const created = await createChild(childPayload as any);
      console.log("[Register] handleSubmit - created child", created);
      await fetchChildren();
      toast({ title: "Success!", description: "Child has been registered." });
      // optionally reset or navigate
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
    if (!childForm.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    if (!childForm.gender) errs.gender = "Gender is required";
    if (!childForm.monthlyFee || Number(childForm.monthlyFee) <= 0)
      errs.monthlyFee = "Monthly fee must be greater than 0";
    return errs;
  };

  const validatePaymentForm = () => {
    const errs: Record<string, string> = {};
    if (
      !childForm.registrationAmount ||
      Number(childForm.registrationAmount) <= 0
    )
      errs.registrationAmount = "Registration amount is required";
    if (!childForm.bank) errs.bank = "Select a bank";
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
                onClick={() => {
                  const errs = validateChildForm();
                  setChildErrors(errs);
                  if (Object.keys(errs).length === 0) setCurrentStep("payment");
                }}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Payment */}
        {currentStep === "payment" && (
          <>
            <PaymentStep
              form={childForm}
              onChange={handleChildChange}
              errors={paymentErrors}
            />
            <div className="w-full flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setCurrentStep("child-info")}
              >
                previous
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Register Child
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
