/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { MessageNode } from './ast';
import { Compiler } from './compiler';
import { parse } from './parser';
import { Runtime } from './runtime';
import { validate, ValidationOptions } from './validator';

const defaultRuntime = new Runtime();

export function isICUMessage(message: string): boolean {
  return /\{[^}]{1,100}\}/.test(message);
}

export function parseICUMessage(message: string): MessageNode {
  return parse(message);
}

export function compileICUMessage(
  message: string,
): ReturnType<Compiler['compile']> {
  const ast = parse(message);
  const compiler = new Compiler();
  return compiler.compile(ast);
}

export function formatICUMessage(
  message: string,
  values: Record<string, any>,
  locale: string = 'en-US',
): string {
  return defaultRuntime.format(message, values, { locale });
}

export function validateICUMessage(
  message: string,
  options?: ValidationOptions,
): void {
  const ast = parse(message);
  validate(ast, options);
}
