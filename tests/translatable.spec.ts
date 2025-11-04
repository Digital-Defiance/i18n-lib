import { I18nEngine } from '../src/core/i18n-engine';
import { LanguageCodes } from '../src/language-codes';
import { TranslatableError } from '../src/errors/translatable';
import { LanguageDefinition } from '../src';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

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
