export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ChildParentLink {
  id: number;
  relationship: string;    // "father", "mother", etc
  isPrimary: boolean;
}

export type Branch =
  | "pre school summit"
  | "day care summit"
  | "daycare Hayat"
  | "daycare Bulbula"
  | "Nany center Megenagna"