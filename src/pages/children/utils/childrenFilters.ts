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

/**
 * Filter children by status (active/inactive)
 */
export const filterByStatus = (
  children: Child[],
  activeFilter?: string
): Child[] => {
  if (!activeFilter || activeFilter === "all") return children;

  return children.filter((child) => {
    return activeFilter === "active" ? child.is_active : !child.is_active;
  });
};

/**
 * Filter children by both age range and status
 */
export const filterChildren = (
  children: Child[],
  minAge?: string,
  maxAge?: string,
  activeFilter?: string
): Child[] => {
  let filtered = children;
  
  // Apply status filter first
  filtered = filterByStatus(filtered, activeFilter);
  
  // Then apply age filter
  filtered = filterByAge(filtered, minAge, maxAge);
  
  return filtered;
};
