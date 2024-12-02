interface CacheData<T> {
    data: T;
    timestamp: number;
  }
  
  class Cache {
    private static instance: Cache;
    private cache: Map<string, any>;
  
    private constructor() {
      this.cache = new Map();
    }
  
    public static getInstance(): Cache {
      if (!Cache.instance) {
        Cache.instance = new Cache();
      }
      return Cache.instance;
    }
  
    set<T>(key: string, data: T): void {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  
    get<T>(key: string): T | null {
      const cached = this.cache.get(key) as CacheData<T> | undefined;
      return cached ? cached.data : null;
    }
  
    has(key: string): boolean {
      return this.cache.has(key);
    }
  
    clear(): void {
      this.cache.clear();
    }
  }
  
  export const cache = Cache.getInstance();