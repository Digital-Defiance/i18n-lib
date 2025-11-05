import { ContextError } from '../src/errors/context-error';
import { ContextErrorType } from '../src/context-error-type';
import { I18nEngine } from '../src/core/i18n-engine';
import { createCoreComponentConfig, createDefaultLanguages } from '../src/core-i18n';

describe('ContextError', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
    const engine = new I18nEngine(createDefaultLanguages());
    engine.register(createCoreComponentConfig());
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });
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
