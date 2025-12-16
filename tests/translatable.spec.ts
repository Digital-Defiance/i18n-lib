/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { LanguageDefinition } from '../src';
import { I18nEngine } from '../src/core/i18n-engine';
import { TranslatableError } from '../src/errors/translatable';

enum TestStringKey {
  ErrorKey = 'ErrorKey',
  ErrorTemplate = 'ErrorTemplate',
}

describe('TranslatableError', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    const langs: LanguageDefinition[] = [
      { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      { id: 'fr', name: 'French', code: 'fr' },
    ];
    engine = new I18nEngine(langs);
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  it('should create error with string key', () => {
    const error = new TranslatableError(TestStringKey.ErrorKey);

    expect(error.message).toContain('ErrorKey');
    expect(error.name).toBe('TranslatableError');
  });

  it('should create error with variables', () => {
    const error = new TranslatableError(TestStringKey.ErrorTemplate, {
      message: 'test',
    });

    expect(error.message).toContain('ErrorTemplate');
  });

  it('should create error with language', () => {
    const error = new TranslatableError(
      TestStringKey.ErrorKey,
      undefined,
      'fr',
    );

    expect(error.message).toContain('ErrorKey');
  });

  it('should create error with variables and language', () => {
    const error = new TranslatableError(
      TestStringKey.ErrorTemplate,
      { message: 'test' },
      'fr',
    );

    expect(error.message).toContain('ErrorTemplate');
  });

  it('should be instanceof Error', () => {
    const error = new TranslatableError(TestStringKey.ErrorKey);
    expect(error instanceof Error).toBe(true);
  });
});
