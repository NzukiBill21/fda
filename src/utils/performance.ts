// Advanced caching and performance optimization
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxMemoryCacheSize = 100; // Maximum items in memory cache

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Memory cache with TTL
  public set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public get(key: string): any | null {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data;
  }

  public delete(key: string): void {
    this.memoryCache.delete(key);
  }

  public clear(): void {
    this.memoryCache.clear();
  }

  // IndexedDB cache for larger data
  public async setIndexedDB(key: string, data: any, ttl: number = 3600000): Promise<void> { // 1 hour default
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl
      });
    } catch (error) {
      console.error('Failed to set IndexedDB cache:', error);
    }
  }

  public async getIndexedDB(key: string): Promise<any | null> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const result = await store.get(key);
      
      if (!result) {
        return null;
      }

      // Check if item has expired
      if (Date.now() - result.timestamp > result.ttl) {
        await this.deleteIndexedDB(key);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Failed to get IndexedDB cache:', error);
      return null;
    }
  }

  public async deleteIndexedDB(key: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.delete(key);
    } catch (error) {
      console.error('Failed to delete IndexedDB cache:', error);
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MondaCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }
}

export const cacheManager = CacheManager.getInstance();

// Optimized API client with caching
export class OptimizedApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  public async get<T>(
    endpoint: string,
    options: {
      cache?: boolean;
      ttl?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { cache = true, ttl = 300000, retries = 3 } = options;
    const cacheKey = `api:${endpoint}`;

    // Try cache first
    if (cache) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Make request with retries
    const data = await this.makeRequest<T>(endpoint, 'GET', undefined, retries);

    // Cache successful response
    if (cache && data) {
      cacheManager.set(cacheKey, data, ttl);
    }

    return data;
  }

  public async post<T>(
    endpoint: string,
    data: any,
    options: {
      cache?: boolean;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { cache = false, retries = 3 } = options;

    const result = await this.makeRequest<T>(endpoint, 'POST', data, retries);

    // Invalidate related cache entries
    if (cache) {
      this.invalidateCache(endpoint);
    }

    return result;
  }

  public async put<T>(
    endpoint: string,
    data: any,
    options: {
      cache?: boolean;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { cache = false, retries = 3 } = options;

    const result = await this.makeRequest<T>(endpoint, 'PUT', data, retries);

    // Invalidate related cache entries
    if (cache) {
      this.invalidateCache(endpoint);
    }

    return result;
  }

  public async delete<T>(
    endpoint: string,
    options: {
      cache?: boolean;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { cache = false, retries = 3 } = options;

    const result = await this.makeRequest<T>(endpoint, 'DELETE', undefined, retries);

    // Invalidate related cache entries
    if (cache) {
      this.invalidateCache(endpoint);
    }

    return result;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string,
    data?: any,
    retries: number = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private invalidateCache(endpoint: string): void {
    // Invalidate cache entries that might be affected by this operation
    const patterns = [
      `api:${endpoint}`,
      `api:${endpoint.split('/')[0]}/*`, // Invalidate all endpoints starting with the same prefix
    ];

    patterns.forEach(pattern => {
      if (pattern.includes('*')) {
        // Clear all cache entries matching the pattern
        cacheManager.clear();
      } else {
        cacheManager.delete(pattern);
      }
    });
  }
}

export const apiClient = new OptimizedApiClient();

// Image optimization and lazy loading
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private imageCache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  public async optimizeImage(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): Promise<string> {
    const { width = 800, height = 600, quality = 0.8 } = options;
    const cacheKey = `${url}-${width}-${height}-${quality}`;

    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    try {
      // Create canvas for image optimization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = width;
          canvas.height = height;

          // Draw and optimize image
          ctx?.drawImage(img, 0, 0, width, height);
          
          const optimizedUrl = canvas.toDataURL('image/jpeg', quality);
          this.imageCache.set(cacheKey, optimizedUrl);
          resolve(optimizedUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    } catch (error) {
      console.error('Image optimization failed:', error);
      return url; // Return original URL as fallback
    }
  }

  public preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
          img.src = url;
        });
      })
    );
  }
}

export const imageOptimizer = ImageOptimizer.getInstance();

// Bundle size optimization
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

// Memory management
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  public cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  public monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
}

export const memoryManager = MemoryManager.getInstance();

