/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { ContextErrorType } from '../src/context-error-type';
import {
  createCoreComponentConfig,
  createDefaultLanguages,
} from '../src/core-i18n';
import { I18nEngine } from '../src/core/i18n-engine';
import { ContextError } from '../src/errors/context-error';

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
