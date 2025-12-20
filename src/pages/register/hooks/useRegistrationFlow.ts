import { useState } from "react";
import { useParentSelection } from "./useParentSelection";
import { useChildRegistration } from "./useChildRegistration";
import { useParentCreation } from "./useParentCreation";
import { useParents } from "@/stores/parent.store";
import { Parent } from "@/types/parent.types";

export type RegistrationStep = "select-parent" | "add-parent" | "child-info";

/**
 * Custom hook to manage the entire registration flow
 */
export const useRegistrationFlow = () => {
  const [currentStep, setCurrentStep] =
    useState<RegistrationStep>("select-parent");
  const { fetchParents } = useParents();

  const parentSelection = useParentSelection();
  const childRegistration = useChildRegistration();

  const refreshParents = async (): Promise<Parent[]> => {
    const trimmed = parentSelection.parentSearch.trim();
    const refreshed =
      (await fetchParents(trimmed ? { query: trimmed } : { page: 1 })) || [];
    // Update parent list by triggering a re-fetch via setting page to 1
    parentSelection.setParentPage(1);
    return refreshed;
  };

  const parentCreation = useParentCreation((parentId) => {
    parentSelection.setSelectedParent(parentId);
    setCurrentStep("child-info");
  }, refreshParents);

  const handleNextFromParentSelection = () => {
    if (parentSelection.selectedParent) {
      setCurrentStep("child-info");
    }
  };

  const handleAddNewParent = () => {
    setCurrentStep("add-parent");
  };

  const handleBackToParentSelection = () => {
    setCurrentStep("select-parent");
  };

  const handleSubmitChild = async () => {
    const success = await childRegistration.handleSubmit(
      parentSelection.selectedParent,
      parentSelection.parentList
    );
    if (success) {
      parentSelection.setSelectedParent(null);
      childRegistration.resetForm();
      setCurrentStep("select-parent");
    }
  };

  return {
    currentStep,
    parentSelection,
    childRegistration,
    parentCreation,
    handleNextFromParentSelection,
    handleAddNewParent,
    handleBackToParentSelection,
    handleSubmitChild,
  };
};
