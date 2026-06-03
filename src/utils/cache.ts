import { type ICacheAdapter } from './ICacheAdapter';

interface CacheEntry<T = any> {
  data: T;
  expiry: number;
}

export class MemoryCacheAdapter implements ICacheAdapter {
  private cache = new Map<string, CacheEntry>();

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;
      
      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return entry.data as T;
    } catch (error) {
      console.warn('MemoryCache get failed:', error);
      return null;
    }
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    try {
      if (this.cache.size > 100) {
        this.clearExpired();
      }
      const expiry = Date.now() + (ttlSeconds * 1000);
      this.cache.set(key, { data, expiry });
    } catch (error) {
      console.warn('MemoryCache set failed:', error);
    }
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}
