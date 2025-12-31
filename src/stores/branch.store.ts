import { create } from "zustand";
import { Branch } from "@/types/api.types";
import { fetchBranches } from "@/api/branch.api";

interface BranchState {
  currentBranch: Branch;
  branches: Branch[];
  isLoading: boolean;
  setBranch: (branch: Branch) => void;
  setFromUser: (branch?: Branch) => void;
  loadBranches: () => Promise<void>;
}

// Fallback branches in case API fails
const fallbackBranches: Branch[] = ["pre school summit", "day care summit", "daycare Hayat", "daycare Bulbula", "Nany center Megenagna"];

export const useBranchStore = create<BranchState>()(
  (set, get) => ({
    currentBranch: "daycare Hayat", // Default branch
    branches: fallbackBranches,
    isLoading: false,
    setBranch: (branch: Branch) => set({ currentBranch: branch }),
    setFromUser: (branch?: Branch) => {
      if (branch) set({ currentBranch: branch });
    },
    loadBranches: async () => {
      const { isLoading } = get();
      if (isLoading) return; // Prevent multiple simultaneous loads
      
      set({ isLoading: true });
      try {
        const branches = await fetchBranches();
        if (branches && branches.length > 0) {
          set({ 
            branches: branches as Branch[],
            currentBranch: branches[0] as Branch,
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Failed to load branches from API, using fallback:', error);
        set({ isLoading: false });
      }
    },
  })
);

