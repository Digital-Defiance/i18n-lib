/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/order */
import { Compiler } from './compiler';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';
import { parse } from './parser';
import { validate } from './validator';

// Simple LRU cache implementation to avoid dependency issues in tests
class SimpleLRUCache {
  private cache: Map<string, any>;
  private max: number;

  constructor(options: { max: number }) {
    this.cache = new Map();
    this.max = options.max;
  }

  get(key: string): any {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: any): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Wrapper to provide consistent API across cache implementations
class CacheWrapper {
  private cache: SimpleLRUCache;

  constructor(options: { max: number }) {
    this.cache = new SimpleLRUCache(options);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export class Runtime {
  private compiler: Compiler;
  private cache: CacheWrapper;

  constructor(registry?: FormatterRegistry) {
    this.cache = new CacheWrapper({ max: 1000 });
    this.compiler = new Compiler(registry);
  }

  format(
    message: string,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    if (message.length > 10000) {
      throw new Error('Message exceeds maximum length');
    }

    const cacheKey = `${context.locale}:${message}`;
    let compiled = this.cache.get(cacheKey);

    if (!compiled) {
      const ast = parse(message);
      validate(ast);
      compiled = this.compiler.compile(ast);
      this.cache.set(cacheKey, compiled);
    }

    return compiled(values, context);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
