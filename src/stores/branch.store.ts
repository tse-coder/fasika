import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branch } from "@/types/user.types";
import { mockBranches } from "@/mock/api";

interface BranchState {
  currentBranch: Branch;
  branches: Branch[];
  setBranch: (branch: Branch) => void;
  setFromUser: (branch?: Branch) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      currentBranch: mockBranches[0],
      branches: mockBranches,
      setBranch: (branch: Branch) => set({ currentBranch: branch }),
      setFromUser: (branch?: Branch) => {
        if (branch) set({ currentBranch: branch });
      },
    }),
    {
      name: "branch-storage",
    }
  )
);

