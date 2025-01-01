interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface Cache {
  [key: string]: CacheItem<any>;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let cache: Cache = {};

export function getCachedData<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;

  const now = Date.now();
  if (now - item.timestamp > CACHE_DURATION) {
    // Cache expired
    delete cache[key];
    return null;
  }

  return item.data;
}

export function setCachedData<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

export function clearCache(): void {
  cache = {};
}

export function removeCachedItem(key: string): void {
  delete cache[key];
}
