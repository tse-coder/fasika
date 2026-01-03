import { Parent } from "@/types/parent.types";

export const filterParents = (
  parents: Parent[],
  activeFilter: string
): Parent[] => {
  if (activeFilter === "all") {
    return parents;
  }

  return parents.filter((parent) => {
    if (activeFilter === "active") {
      return parent.is_active;
    }
    if (activeFilter === "inactive") {
      return !parent.is_active;
    }
    return true;
  });
};
