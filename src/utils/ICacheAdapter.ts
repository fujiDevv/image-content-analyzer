export interface ICacheAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttlSeconds: number): void;
  delete(key: string): void;
  clear(): void;
}
