import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const api = async (
  url: string,
  params: Record<string, any> = {}
) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    )
  );

  const res = await fetch(`${url}?${qs.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const calculateAge = (birthdate: string): number | "N/A" => {
  if (!birthdate) return "N/A";
  const birthDateObj = new Date(birthdate);
  const ageDifMs = Date.now() - birthDateObj.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatYear(date: Date) {
  return date.getFullYear().toString();
}
