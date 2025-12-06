export const saveCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
};

export const loadCache = <T>(key: string, maxAgeMs: number): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (Date.now() - parsed.timestamp > maxAgeMs) return null;

  return parsed.data as T;
};
