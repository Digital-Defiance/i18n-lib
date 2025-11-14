import { MessageNode, NodeType, ArgumentNode, PluralNode, SelectNode, SelectOrdinalNode } from './ast';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationOptions {
  requireOtherCase?: boolean;
  allowCircularReferences?: boolean;
  maxDepth?: number;
}

const DEFAULT_OPTIONS: ValidationOptions = {
  requireOtherCase: true,
  allowCircularReferences: false,
  maxDepth: 10,
};

export function validate(ast: MessageNode, options: ValidationOptions = {}): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const context = new ValidationContext(opts);
  validateMessage(ast, context);
}

class ValidationContext {
  private argumentNames = new Set<string>();
  private currentDepth = 0;

  constructor(public options: ValidationOptions) {}

  addArgument(name: string): void {
    this.argumentNames.add(name);
  }

  hasArgument(name: string): boolean {
    return this.argumentNames.has(name);
  }

  enterDepth(): void {
    this.currentDepth++;
    if (this.currentDepth > this.options.maxDepth!) {
      throw new ValidationError(`Maximum nesting depth of ${this.options.maxDepth} exceeded`);
    }
  }

  exitDepth(): void {
    this.currentDepth--;
  }
}

function validateMessage(node: MessageNode, context: ValidationContext): void {
  for (const element of node.elements) {
    validateNode(element, context);
  }
}

function validateNode(node: any, context: ValidationContext): void {
  switch (node.type) {
    case NodeType.LITERAL:
      break;
    case NodeType.ARGUMENT:
      validateArgument(node, context);
      break;
    case NodeType.PLURAL:
      validatePlural(node, context);
      break;
    case NodeType.SELECT:
      validateSelect(node, context);
      break;
    case NodeType.SELECTORDINAL:
      validateSelectOrdinal(node, context);
      break;
    default:
      throw new ValidationError(`Unknown node type: ${node.type}`);
  }
}

function validateArgument(node: ArgumentNode, context: ValidationContext): void {
  if (!node.name || node.name.trim() === '') {
    throw new ValidationError('Argument name cannot be empty');
  }
  context.addArgument(node.name);
}

function validatePlural(node: PluralNode, context: ValidationContext): void {
  if (!node.name || node.name.trim() === '') {
    throw new ValidationError('Plural variable name cannot be empty');
  }
  context.addArgument(node.name);

  if (!node.cases || Object.keys(node.cases).length === 0) {
    throw new ValidationError(`Plural '${node.name}' must have at least one case`);
  }

  if (context.options.requireOtherCase && !node.cases.other) {
    throw new ValidationError(`Plural '${node.name}' must have an 'other' case`);
  }

  const validCases = ['zero', 'one', 'two', 'few', 'many', 'other'];
  for (const caseName of Object.keys(node.cases)) {
    if (!validCases.includes(caseName)) {
      throw new ValidationError(`Invalid plural case '${caseName}' in '${node.name}'`);
    }
  }

  context.enterDepth();
  for (const caseMessage of Object.values(node.cases)) {
    validateMessage(caseMessage, context);
  }
  context.exitDepth();
}

function validateSelect(node: SelectNode, context: ValidationContext): void {
  if (!node.name || node.name.trim() === '') {
    throw new ValidationError('Select variable name cannot be empty');
  }
  context.addArgument(node.name);

  if (!node.cases || Object.keys(node.cases).length === 0) {
    throw new ValidationError(`Select '${node.name}' must have at least one case`);
  }

  if (context.options.requireOtherCase && !node.cases.other) {
    throw new ValidationError(`Select '${node.name}' must have an 'other' case`);
  }

  context.enterDepth();
  for (const caseMessage of Object.values(node.cases)) {
    validateMessage(caseMessage, context);
  }
  context.exitDepth();
}

function validateSelectOrdinal(node: SelectOrdinalNode, context: ValidationContext): void {
  if (!node.name || node.name.trim() === '') {
    throw new ValidationError('SelectOrdinal variable name cannot be empty');
  }
  context.addArgument(node.name);

  if (!node.cases || Object.keys(node.cases).length === 0) {
    throw new ValidationError(`SelectOrdinal '${node.name}' must have at least one case`);
  }

  if (context.options.requireOtherCase && !node.cases.other) {
    throw new ValidationError(`SelectOrdinal '${node.name}' must have an 'other' case`);
  }

  const validCases = ['zero', 'one', 'two', 'few', 'many', 'other'];
  for (const caseName of Object.keys(node.cases)) {
    if (!validCases.includes(caseName)) {
      throw new ValidationError(`Invalid selectordinal case '${caseName}' in '${node.name}'`);
    }
  }

  context.enterDepth();
  for (const caseMessage of Object.values(node.cases)) {
    validateMessage(caseMessage, context);
  }
  context.exitDepth();
}
