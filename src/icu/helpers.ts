import { parse } from './parser';
import { validate, ValidationOptions } from './validator';
import { Compiler } from './compiler';
import { Runtime } from './runtime';
import { MessageNode } from './ast';

const defaultRuntime = new Runtime();

export function isICUMessage(message: string): boolean {
  return /\{[^}]+\}/.test(message);
}

export function parseICUMessage(message: string): MessageNode {
  return parse(message);
}

export function compileICUMessage(message: string): ReturnType<Compiler['compile']> {
  const ast = parse(message);
  const compiler = new Compiler();
  return compiler.compile(ast);
}

export function formatICUMessage(
  message: string,
  values: Record<string, any>,
  locale: string = 'en-US'
): string {
  return defaultRuntime.format(message, values, { locale });
}

export function validateICUMessage(message: string, options?: ValidationOptions): void {
  const ast = parse(message);
  validate(ast, options);
}
