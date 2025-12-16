/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import {
  ArgumentNode,
  LiteralNode,
  MessageNode,
  NodeType,
  PluralNode,
  SelectNode,
  SelectOrdinalNode,
} from './ast';
import { FormatterRegistry } from './formatter-registry';
import { FormatterContext } from './formatters/base-formatter';

export type CompiledMessage = (
  values: Record<string, any>,
  context: FormatterContext,
) => string;

export class Compiler {
  private registry: FormatterRegistry;

  constructor(registry?: FormatterRegistry) {
    this.registry = registry || new FormatterRegistry();
  }

  compile(ast: MessageNode): CompiledMessage {
    return (values: Record<string, any>, context: FormatterContext) => {
      return this.compileMessage(ast, values, context);
    };
  }

  private compileMessage(
    node: MessageNode,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    return node.elements
      .map((el) => this.compileNode(el, values, context))
      .join('');
  }

  private compileNode(
    node: any,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    switch (node.type) {
      case NodeType.LITERAL:
        return (node as LiteralNode).value;
      case NodeType.ARGUMENT:
        return this.compileArgument(node as ArgumentNode, values, context);
      case NodeType.PLURAL:
        return this.compilePlural(node as PluralNode, values, context);
      case NodeType.SELECT:
        return this.compileSelect(node as SelectNode, values, context);
      case NodeType.SELECTORDINAL:
        return this.compileSelectOrdinal(
          node as SelectOrdinalNode,
          values,
          context,
        );
      default:
        return '';
    }
  }

  private compileArgument(
    node: ArgumentNode,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    const value = values[node.name];
    if (value === undefined) return `{${node.name}}`;

    if (!node.format) return String(value);

    const formatter = this.registry.get(node.format);
    if (!formatter) return String(value);

    return formatter.format(value, node.style, context);
  }

  private compilePlural(
    node: PluralNode,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    const value = values[node.name];
    const num = Number(value);
    if (isNaN(num))
      return this.compileMessage(
        node.cases.other || node.cases.one,
        values,
        context,
      );

    const formatter = this.registry.get('plural');
    const category = formatter
      ? formatter.format(num, undefined, context)
      : 'other';
    const caseNode = node.cases[category] || node.cases.other;

    if (!caseNode) return '';

    const result = this.compileMessage(caseNode, values, context);
    // Format number with thousand separators using Intl.NumberFormat
    const locale = context.locale || 'en-US';
    const formattedNum = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(num);
    return result.replace(/#/g, formattedNum);
  }

  private compileSelect(
    node: SelectNode,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    const value = String(values[node.name] || '');
    const caseNode = node.cases[value] || node.cases.other;

    if (!caseNode) return '';
    return this.compileMessage(caseNode, values, context);
  }

  private compileSelectOrdinal(
    node: SelectOrdinalNode,
    values: Record<string, any>,
    context: FormatterContext,
  ): string {
    const value = values[node.name];
    const num = Number(value);
    if (isNaN(num))
      return this.compileMessage(node.cases.other, values, context);

    const formatter = this.registry.get('selectordinal');
    const category = formatter
      ? formatter.format(num, undefined, context)
      : 'other';
    const caseNode = node.cases[category] || node.cases.other;

    if (!caseNode) return '';

    const result = this.compileMessage(caseNode, values, context);
    // Format number with thousand separators using Intl.NumberFormat
    const locale = context.locale || 'en-US';
    const formattedNum = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(num);
    return result.replace(/#/g, formattedNum);
  }
}
