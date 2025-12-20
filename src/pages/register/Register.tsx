import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { useRegistrationFlow } from "./hooks/useRegistrationFlow";
import { ParentStep } from "./sections/parentStep";
import { NewParentStep } from "./sections/parentCreation";
import { ChildInfoStep } from "./sections/childInfoStep";

/**
 * Main Registration page component
 * Multi-step form for registering a new child with parent selection
 */
export default function RegisterSequential() {
  const {
    currentStep,
    parentSelection,
    childRegistration,
    parentCreation,
    handleNextFromParentSelection,
    handleAddNewParent,
    handleBackToParentSelection,
    handleSubmitChild,
  } = useRegistrationFlow();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Select Parent */}
        {currentStep === "select-parent" && (
          <ParentStep
            parents={parentSelection.parentList}
            onSelect={(id) => {
              parentSelection.setSelectedParent(id);
              handleNextFromParentSelection();
            }}
            onAddNew={handleAddNewParent}
            onNext={
              parentSelection.parentSearch.trim()
                ? undefined
                : () => parentSelection.setParentPage((p) => p + 1)
            }
            onSearch={(q: string) => {
              parentSelection.setParentPage(1);
              parentSelection.setParentSearch(q || "");
            }}
            isLoading={parentSelection.isLoading}
          />
        )}

        {/* Step 2: Add New Parent */}
        {currentStep === "add-parent" && (
          <NewParentStep
            onSave={parentCreation.handleAddParent}
            onCancel={handleBackToParentSelection}
            isSaving={parentCreation.isSavingParent}
          />
        )}

        {/* Step 3: Child Information */}
        {currentStep === "child-info" && (
          <>
            <ChildInfoStep
              form={childRegistration.childForm}
              onChange={childRegistration.handleChildChange}
              errors={childRegistration.childErrors}
            />
            <div className="w-full flex">
              <Button
                className="flex-1 mr-2"
                onClick={handleBackToParentSelection}
              >
                previous
              </Button>
              <Button
                className="flex-1"
                disabled={childRegistration.isSubmittingChild}
                onClick={async () => {
                  const errs = childRegistration.validateChildForm();
                  if (Object.keys(errs).length === 0) {
                    await handleSubmitChild();
                  }
                }}
              >
                {childRegistration.isSubmittingChild ? (
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
