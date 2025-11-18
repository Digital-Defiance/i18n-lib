/**
 * Simple LRU Cache implementation for security
 */

/**
 * Least Recently Used (LRU) cache implementation.
 * Automatically evicts the oldest entries when the cache reaches maximum size.
 * @template K - The type of cache keys
 * @template V - The type of cached values
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  /**
   * Creates a new LRUCache instance.
   * @param maxSize - Maximum number of entries to store (default: 1000)
   */
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Retrieves a value from the cache by key.
   * Accessing an item moves it to the end (marks it as most recently used).
   * @param key - The key to look up
   * @returns The cached value, or undefined if not found
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  /**
   * Adds or updates a value in the cache.
   * If the cache is at capacity, the oldest entry is removed.
   * @param key - The key to store
   * @param value - The value to cache
   */
  set(key: K, value: V): void {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }

  /**
   * Removes all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the current number of entries in the cache.
   * @returns The number of cached entries
   */
  size(): number {
    return this.cache.size;
  }
}
