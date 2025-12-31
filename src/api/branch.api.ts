import { apiGet } from './http';

export const fetchBranches = async (): Promise<string[]> => {
  const response = await apiGet<string[]>('/branches');
  return response;
};
