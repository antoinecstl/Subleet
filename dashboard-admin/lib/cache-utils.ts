const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function setCache<T>(key: string, data: T): void {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheItem));
}

export function getCache<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const cacheItem: CacheItem<T> = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is fresh
    if (now - cacheItem.timestamp < CACHE_DURATION) {
      return cacheItem.data;
    }
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Clear all cache related to our app
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
