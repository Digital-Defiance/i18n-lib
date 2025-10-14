import { ContextErrorType } from './context-error-type';

export class ContextError extends Error {
  public readonly type: ContextErrorType;
  public readonly contextKey?: string;

  constructor(type: ContextErrorType, contextKey?: string) {
    const message = contextKey 
      ? `Invalid context: ${contextKey}`
      : 'Invalid context';
    super(message);
    this.name = 'ContextError';
    this.type = type;
    this.contextKey = contextKey;
  }
}
