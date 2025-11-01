import { ContextError } from '../src/context-error';
import { ContextErrorType } from '../src/context-error-type';

describe('ContextError', () => {
  it('should create error with type and context key', () => {
    const error = new ContextError(ContextErrorType.InvalidContext, 'test-key');

    expect(error.type).toBe(ContextErrorType.InvalidContext);
    expect(error.contextKey).toBe('test-key');
    expect(error.message).toBe('Invalid context: test-key');
    expect(error.name).toBe('ContextError');
  });

  it('should create error without context key', () => {
    const error = new ContextError(ContextErrorType.InvalidContext);

    expect(error.type).toBe(ContextErrorType.InvalidContext);
    expect(error.contextKey).toBeUndefined();
    expect(error.message).toBe('Invalid context');
    expect(error.name).toBe('ContextError');
  });

  it('should be instanceof Error', () => {
    const error = new ContextError(ContextErrorType.InvalidContext);
    expect(error instanceof Error).toBe(true);
  });
});
