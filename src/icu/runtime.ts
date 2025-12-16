/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { LRUCache } from 'lru-cache';
import { CompiledMessage, Compiler } from './compiler';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';
import { parse } from './parser';
import { validate } from './validator';

export class Runtime {
  private compiler: Compiler;
  private cache = new LRUCache<string, CompiledMessage>({ max: 1000 });

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
