// Caching was removed from the project. These no-op helpers remain
// for backward-compatibility during the transition but do nothing.
// Remove this file entirely once all imports are gone.

export const saveCache = (_key: string, _data: any) => {
  // no-op: caching removed
  return;
};

export const loadCache = <T>(_key: string, _maxAgeMs: number): T | null => {
  // no-op: caching removed
  return null;
};
