/**
 * ICU MessageFormat Abstract Syntax Tree (AST) types
 */

export enum NodeType {
  MESSAGE = 'MESSAGE',
  LITERAL = 'LITERAL',
  ARGUMENT = 'ARGUMENT',
  PLURAL = 'PLURAL',
  SELECT = 'SELECT',
  SELECTORDINAL = 'SELECTORDINAL',
}

export interface BaseNode {
  type: NodeType;
}

export interface MessageNode extends BaseNode {
  type: NodeType.MESSAGE;
  elements: Array<LiteralNode | ArgumentNode | PluralNode | SelectNode | SelectOrdinalNode>;
}

export interface LiteralNode extends BaseNode {
  type: NodeType.LITERAL;
  value: string;
}

export interface ArgumentNode extends BaseNode {
  type: NodeType.ARGUMENT;
  name: string;
  format?: string;
  style?: string;
}

export interface PluralNode extends BaseNode {
  type: NodeType.PLURAL;
  name: string;
  offset?: number;
  cases: Record<string, MessageNode>;
}

export interface SelectNode extends BaseNode {
  type: NodeType.SELECT;
  name: string;
  cases: Record<string, MessageNode>;
}

export interface SelectOrdinalNode extends BaseNode {
  type: NodeType.SELECTORDINAL;
  name: string;
  offset?: number;
  cases: Record<string, MessageNode>;
}

export type ASTNode = LiteralNode | ArgumentNode | PluralNode | SelectNode | SelectOrdinalNode;
export type ASTNodeOrMessage = MessageNode | ASTNode;
