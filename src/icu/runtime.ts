import { parse } from './parser';
import { validate } from './validator';
import { Compiler, CompiledMessage } from './compiler';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';

export class Runtime {
  private compiler: Compiler;
  private cache = new Map<string, CompiledMessage>();

  constructor(registry?: FormatterRegistry) {
    this.compiler = new Compiler(registry);
  }

  format(message: string, values: Record<string, any>, context: FormatterContext): string {
    let compiled = this.cache.get(message);
    
    if (!compiled) {
      const ast = parse(message);
      validate(ast);
      compiled = this.compiler.compile(ast);
      this.cache.set(message, compiled);
    }

    return compiled(values, context);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
