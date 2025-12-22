/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/order */
// prettier-ignore
const LRUCache = require('lru-cache');
import { Compiler } from './compiler';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';
import { parse } from './parser';
import { validate } from './validator';

// Wrapper to provide consistent API across lru-cache versions
class CacheWrapper {
  private cache: any;

  constructor(options: { max: number }) {
    this.cache = new LRUCache(options);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  clear(): void {
    if (typeof this.cache.clear === 'function') {
      this.cache.clear();
    } else if (typeof this.cache.reset === 'function') {
      this.cache.reset();
    }
  }

  get size(): number {
    return this.cache.length !== undefined
      ? this.cache.length
      : this.cache.size;
  }
}

export class Runtime {
  private compiler: Compiler;
  private cache: CacheWrapper = new CacheWrapper({ max: 1000 });

  constructor(registry?: FormatterRegistry) {
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
