import { TranslatableError } from '../src/translatable';
import { I18nEngine } from '../src/i18n-engine';
import { Language } from '../src/default-config';
import { LanguageCodes } from '../src/language-codes';
import { Timezone } from '../src/timezone';
import { CurrencyCode } from '../src/currency-code';
import { I18nConfig } from '../src/i18n-config';

enum TestStringKey {
  ErrorKey = 'ErrorKey',
  ErrorTemplate = 'ErrorTemplate',
}

describe('TranslatableError', () => {
  let engine: I18nEngine<TestStringKey, Language, any, any>;

  beforeEach(() => {
    I18nEngine.removeInstance('testEngine');
    const config: I18nConfig<TestStringKey, Language> = {
      stringNames: [TestStringKey.ErrorKey, TestStringKey.ErrorTemplate],
      strings: {
        [LanguageCodes.EN_US]: {
          [TestStringKey.ErrorKey]: 'An error occurred',
          [TestStringKey.ErrorTemplate]: 'Error: {message}',
        },
        [LanguageCodes.FR]: {
          [TestStringKey.ErrorKey]: 'Une erreur est survenue',
          [TestStringKey.ErrorTemplate]: 'Erreur: {message}',
        },
      },
      defaultLanguage: LanguageCodes.EN_US,
      adminTimezone: new Timezone('UTC'),
      timezone: new Timezone('UTC'),
      defaultCurrencyCode: new CurrencyCode('USD'),
      defaultTranslationContext: 'admin',
      languageCodes: {
        [LanguageCodes.EN_US]: 'en-US',
        [LanguageCodes.FR]: 'fr',
      },
      languages: [LanguageCodes.EN_US, LanguageCodes.FR],
      enumName: 'TestStringKey',
      constants: {},
    };
    engine = new I18nEngine(config, 'testEngine');
  });

  afterEach(() => {
    I18nEngine.removeInstance('testEngine');
  });

  it('should create error with string key', () => {
    const error = new TranslatableError(engine, TestStringKey.ErrorKey);

    expect(error.message).toBe('An error occurred');
    expect(error.name).toBe('TranslatableError');
  });

  it('should create error with variables', () => {
    const error = new TranslatableError(engine, TestStringKey.ErrorTemplate, {
      message: 'test',
    });

    expect(error.message).toBe('Error: test');
  });

  it('should create error with language', () => {
    const error = new TranslatableError(
      engine,
      TestStringKey.ErrorKey,
      undefined,
      LanguageCodes.FR
    );

    expect(error.message).toBe('Une erreur est survenue');
  });

  it('should create error with variables and language', () => {
    const error = new TranslatableError(
      engine,
      TestStringKey.ErrorTemplate,
      { message: 'test' },
      LanguageCodes.FR
    );

    expect(error.message).toBe('Erreur: test');
  });

  it('should be instanceof Error', () => {
    const error = new TranslatableError(engine, TestStringKey.ErrorKey);
    expect(error instanceof Error).toBe(true);
  });
});
