import { parse } from './parser';
import { validate } from './validator';
import { Compiler, CompiledMessage } from './compiler';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';
import { LRUCache } from '../utils/lru-cache';

export class Runtime {
  private compiler: Compiler;
  private cache = new LRUCache<string, CompiledMessage>(1000);

  constructor(registry?: FormatterRegistry) {
    this.compiler = new Compiler(registry);
  }

  format(message: string, values: Record<string, any>, context: FormatterContext): string {
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
