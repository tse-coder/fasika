import { apiGet } from './http';

export const fetchBranches = async (): Promise<string[]> => {
  const response = await apiGet<string[]>('/api/branches');
  return response;
};
