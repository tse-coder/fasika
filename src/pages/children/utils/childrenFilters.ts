import { calculateAge } from "@/lib/utils";
import { Child } from "@/types/child.types";

/**
 * Filter children by age range
 */
export const filterByAge = (
  children: Child[],
  minAge?: string,
  maxAge?: string
): Child[] => {
  if (!minAge && !maxAge) return children;

  return children.filter((child) => {
    const age = calculateAge(child.birthdate);
    if (minAge && (age as number) < parseInt(minAge)) return false;
    if (maxAge && (age as number) > parseInt(maxAge)) return false;
    return true;
  });
};
