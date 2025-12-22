import { create } from "zustand";
import { persist } from "zustand/middleware";
import { branches } from "@/mock/api";
import { Branch } from "@/types/api.types";

interface BranchState {
  currentBranch: Branch;
  branches: Branch[];
  setBranch: (branch: Branch) => void;
  setFromUser: (branch?: Branch) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      currentBranch: branches[0],
      branches: branches,
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

