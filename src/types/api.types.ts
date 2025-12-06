export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ChildParentLink {
  parentId: number;
  relationship: string;    // "father", "mother", etc
  isPrimary: boolean;
}