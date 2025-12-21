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

export type Branch = "bulbula" | "semit" | "hayat" | "megenagna";