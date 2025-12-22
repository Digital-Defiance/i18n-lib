/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
/**
 * ICU MessageFormat Parser
 */

import {
  ArgumentNode,
  ASTNode,
  LiteralNode,
  MessageNode,
  NodeType,
  PluralNode,
  SelectNode,
  SelectOrdinalNode,
} from './ast';
import { Token, Tokenizer, TokenType } from './tokenizer';

export class ParseError extends Error {
  constructor(
    message: string,
    public position: number,
  ) {
    super(`Parse error at position ${position}: ${message}`);
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[];
  private position: number = 0;
  private depth: number = 0;
  private readonly MAX_DEPTH = 10;

  constructor(input: string) {
    if (input.length > 10000) {
      throw new ParseError('Input exceeds maximum length', 0);
    }
    this.tokens = new Tokenizer(input).tokenize();
  }

  parse(): MessageNode {
    return this.parseMessage();
  }

  private parseMessage(): MessageNode {
    if (++this.depth > this.MAX_DEPTH) {
      throw new ParseError(
        `Maximum nesting depth of ${this.MAX_DEPTH} exceeded`,
        this.position,
      );
    }

    const elements: ASTNode[] = [];

    while (!this.isAtEnd() && !this.check(TokenType.CLOSE_BRACE)) {
      if (this.check(TokenType.TEXT)) {
        elements.push(this.parseLiteral());
      } else if (this.check(TokenType.OPEN_BRACE)) {
        elements.push(this.parseArgument());
      } else if (this.check(TokenType.HASH)) {
        // # is treated as literal in message context
        this.advance();
        elements.push({ type: NodeType.LITERAL, value: '#' });
      } else {
        this.advance(); // Skip unexpected tokens
      }
    }

    this.depth--;
    return { type: NodeType.MESSAGE, elements };
  }

  private parseLiteral(): LiteralNode {
    const token = this.advance();
    return { type: NodeType.LITERAL, value: token.value };
  }

  private parseArgument():
    | ArgumentNode
    | PluralNode
    | SelectNode
    | SelectOrdinalNode {
    this.consume(TokenType.OPEN_BRACE, 'Expected {');

    const name = this.consume(
      TokenType.IDENTIFIER,
      'Expected argument name',
    ).value;

    // Simple argument: {name}
    if (this.check(TokenType.CLOSE_BRACE)) {
      this.advance();
      return { type: NodeType.ARGUMENT, name };
    }

    // Formatted argument: {name, type} or {name, type, style}
    this.consume(TokenType.COMMA, 'Expected ,');

    const format = this.consume(
      TokenType.IDENTIFIER,
      'Expected format type',
    ).value;

    // Check for plural/select/selectordinal
    if (format === 'plural') {
      return this.parsePlural(name);
    }
    if (format === 'select') {
      return this.parseSelect(name);
    }
    if (format === 'selectordinal') {
      return this.parseSelectOrdinal(name);
    }

    // Regular formatted argument: {name, type, style}
    let style: string | undefined;
    if (this.check(TokenType.COMMA)) {
      this.advance();
      style = this.consume(TokenType.IDENTIFIER, 'Expected style').value;
    }

    this.consume(TokenType.CLOSE_BRACE, 'Expected }');

    return { type: NodeType.ARGUMENT, name, format, style };
  }

  private parsePlural(name: string): PluralNode {
    this.consume(TokenType.COMMA, 'Expected ,');
    this.skipWhitespace();

    const cases: Record<string, MessageNode> = {};
    let offset: number | undefined;

    // Parse offset if present
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === 'offset') {
      this.advance(); // offset
      this.skipWhitespace();
      this.consume(TokenType.IDENTIFIER, 'Expected offset value'); // number
      offset = 0; // Simplified for now
      this.skipWhitespace();
    }

    // Parse cases
    while (!this.check(TokenType.CLOSE_BRACE) && !this.isAtEnd()) {
      this.skipWhitespace();
      if (this.check(TokenType.CLOSE_BRACE)) break;

      const caseKey = this.consume(
        TokenType.IDENTIFIER,
        'Expected case key',
      ).value;
      this.skipWhitespace();
      this.consume(TokenType.OPEN_BRACE, 'Expected {');
      const caseMessage = this.parseMessage();
      this.consume(TokenType.CLOSE_BRACE, 'Expected }');
      cases[caseKey] = caseMessage;
    }

    if (Object.keys(cases).length === 0) {
      throw new ParseError(
        'Plural must have at least one case',
        this.peek().position,
      );
    }

    this.consume(TokenType.CLOSE_BRACE, 'Expected }');

    return { type: NodeType.PLURAL, name, offset, cases };
  }

  private parseSelect(name: string): SelectNode {
    this.consume(TokenType.COMMA, 'Expected ,');
    this.skipWhitespace();

    const cases: Record<string, MessageNode> = {};

    // Parse cases
    while (!this.check(TokenType.CLOSE_BRACE) && !this.isAtEnd()) {
      this.skipWhitespace();
      if (this.check(TokenType.CLOSE_BRACE)) break;

      const caseKey = this.consume(
        TokenType.IDENTIFIER,
        'Expected case key',
      ).value;
      this.skipWhitespace();
      this.consume(TokenType.OPEN_BRACE, 'Expected {');
      const caseMessage = this.parseMessage();
      this.consume(TokenType.CLOSE_BRACE, 'Expected }');
      cases[caseKey] = caseMessage;
    }

    this.consume(TokenType.CLOSE_BRACE, 'Expected }');

    return { type: NodeType.SELECT, name, cases };
  }

  private parseSelectOrdinal(name: string): SelectOrdinalNode {
    this.consume(TokenType.COMMA, 'Expected ,');
    this.skipWhitespace();

    const cases: Record<string, MessageNode> = {};
    let offset: number | undefined;

    // Parse offset if present
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === 'offset') {
      this.advance(); // offset
      this.skipWhitespace();
      this.consume(TokenType.IDENTIFIER, 'Expected offset value'); // number
      offset = 0; // Simplified for now
      this.skipWhitespace();
    }

    // Parse cases
    while (!this.check(TokenType.CLOSE_BRACE) && !this.isAtEnd()) {
      this.skipWhitespace();
      if (this.check(TokenType.CLOSE_BRACE)) break;

      const caseKey = this.consume(
        TokenType.IDENTIFIER,
        'Expected case key',
      ).value;
      this.skipWhitespace();
      this.consume(TokenType.OPEN_BRACE, 'Expected {');
      const caseMessage = this.parseMessage();
      this.consume(TokenType.CLOSE_BRACE, 'Expected }');
      cases[caseKey] = caseMessage;
    }

    this.consume(TokenType.CLOSE_BRACE, 'Expected }');

    return { type: NodeType.SELECTORDINAL, name, offset, cases };
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.position++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParseError(message, this.peek().position);
  }

  private skipWhitespace(): void {
    while (this.check(TokenType.TEXT) && this.peek().value.trim() === '') {
      this.advance();
    }
  }
}

export function parse(input: string): MessageNode {
  return new Parser(input).parse();
}
