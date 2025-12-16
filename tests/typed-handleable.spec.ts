/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nEngine } from '../src/core/i18n-engine';
import { HandleableError } from '../src/errors/handleable';
import { CompleteReasonMap } from '../src/errors/typed';
import { TypedHandleableError } from '../src/errors/typed-handleable';
import { HandleableErrorOptions } from '../src/interfaces/handleable-error-options';
import { LanguageCodes } from '../src/language-codes';

type TestLanguageCode =
  | typeof LanguageCodes.EN_US
  | typeof LanguageCodes.EN_GB
  | typeof LanguageCodes.FR
  | typeof LanguageCodes.ES
  | typeof LanguageCodes.DE
  | typeof LanguageCodes.JA
  | typeof LanguageCodes.ZH_CN
  | typeof LanguageCodes.UK;

enum TestErrorType {
  Simple = 'Simple',
  Templated = 'Templated',
}

enum TestStringKeys {
  Common_Test = 'Common_Test',
  Error_MissingTranslationTemplate = 'Error_MissingTranslationTemplate',
}

const testReasonMap: CompleteReasonMap<typeof TestErrorType, TestStringKeys> = {
  [TestErrorType.Simple]: TestStringKeys.Common_Test,
  [TestErrorType.Templated]: TestStringKeys.Error_MissingTranslationTemplate,
};

class TestTypedError extends TypedHandleableError<
  typeof TestErrorType,
  TestStringKeys
> {
  constructor(
    type: TestErrorType,
    language?: TestLanguageCode,
    otherVars?: Record<string, string | number>,
    options?: HandleableErrorOptions,
  ) {
    super(
      'test-component',
      type,
      testReasonMap,
      new Error(),
      options,
      language,
      otherVars,
    );
    this.name = 'TestTypedError';
  }
}

describe('TypedError', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
    const engine = new I18nEngine([
      {
        id: LanguageCodes.EN_US,
        name: 'English (US)',
        code: 'en-US',
        isDefault: true,
      },
      { id: LanguageCodes.FR, name: 'French', code: 'fr' },
    ]);

    engine.register({
      id: CoreI18nComponentId,
      strings: {
        [LanguageCodes.EN_US]: {
          [CoreStringKey.Error_MissingTranslationKeyTemplate]:
            'Missing translation key: {stringKey}',
        },
        [LanguageCodes.FR]: {
          [CoreStringKey.Error_MissingTranslationKeyTemplate]:
            'Clé de traduction manquante: {stringKey}',
        },
      },
    });

    engine.register({
      id: 'test-component',
      strings: {
        [LanguageCodes.EN_US]: {
          [TestStringKeys.Common_Test]: 'This is a test error message.',
          [TestStringKeys.Error_MissingTranslationTemplate]:
            'Missing template variable: {key} in language {language}.',
        },
        [LanguageCodes.FR]: {
          [TestStringKeys.Common_Test]: "Ceci est un message d'erreur de test.",
          [TestStringKeys.Error_MissingTranslationTemplate]:
            'Variable de modèle manquante : {key} dans la langue {language}.',
        },
      },
    });
  });
  it('should create typed error with simple translation', () => {
    const error = new TestTypedError(TestErrorType.Simple);

    expect(error.type).toBe(TestErrorType.Simple);
    expect(error.name).toBe('TestTypedError');
    expect(error.statusCode).toBe(500);
    expect(error.handled).toBe(false);
  });

  it('should create typed error with templated translation', () => {
    const error = new TestTypedError(
      TestErrorType.Templated,
      LanguageCodes.EN_US,
      { key: 'testKey', language: 'English' },
    );

    expect(error.type).toBe(TestErrorType.Templated);
  });

  it('should create typed error with handleable options', () => {
    const cause = new Error('Original error');
    const options: HandleableErrorOptions = {
      cause,
      statusCode: 400,
      handled: true,
      sourceData: { test: 'data' },
    };

    const error = new TestTypedError(
      TestErrorType.Simple,
      undefined,
      undefined,
      options,
    );

    expect(error.statusCode).toBe(400); // StatusCode from options
    expect(error.handled).toBe(true);
    expect(error.cause).toBe(cause);
    expect(error.sourceData).toEqual({ test: 'data' });
  });

  it('should be instanceof HandleableError', () => {
    const error = new TestTypedError(TestErrorType.Simple);

    expect(error instanceof HandleableError).toBe(true);
    expect(error instanceof TypedHandleableError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('should serialize to JSON with typed error properties', () => {
    const error = new TestTypedError(
      TestErrorType.Simple,
      undefined,
      undefined,
      { statusCode: 404, handled: true, sourceData: { key: 'value' } },
    );

    const json = error.toJSON();

    expect(json.name).toBe('TestTypedError');
    expect(json.statusCode).toBe(404); // StatusCode from options
    expect(json.handled).toBe(true);
    expect(json.sourceData).toEqual({ key: 'value' });
  });

  it('should handle nested TypedError cause in JSON', () => {
    const nestedError = new TestTypedError(TestErrorType.Simple);
    const error = new TestTypedError(
      TestErrorType.Templated,
      LanguageCodes.EN_US,
      { key: 'test', language: 'English' },
      { cause: nestedError },
    );

    const json = error.toJSON();
    expect(json.cause).toBeDefined();
  });

  it('should create error in different language', () => {
    const error = new TestTypedError(TestErrorType.Simple, LanguageCodes.FR);
    expect(error.type).toBe(TestErrorType.Simple);
  });

  it('should allow setting handled property', () => {
    const error = new TestTypedError(TestErrorType.Simple);
    expect(error.handled).toBe(false);

    error.handled = true;
    expect(error.handled).toBe(true);
  });

  it('should append cause stack to error stack', () => {
    const cause = new Error('Cause error');
    const error = new TestTypedError(
      TestErrorType.Simple,
      undefined,
      undefined,
      { cause },
    );

    expect(error.stack).toBeDefined();
    expect(error.cause).toBe(cause);
  });

  it('should create error with custom status code', () => {
    const error = new TestTypedError(
      TestErrorType.Simple,
      undefined,
      undefined,
      { statusCode: 404 },
    );

    expect(error.statusCode).toBe(404);
  });

  it('should create error with source data', () => {
    const sourceData = { userId: 123, action: 'login' };
    const error = new TestTypedError(
      TestErrorType.Simple,
      undefined,
      undefined,
      { sourceData },
    );

    expect(error.sourceData).toEqual(sourceData);
  });

  it('should preserve source stack trace', () => {
    const source = new Error('Source error');
    const error = new TypedHandleableError(
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
    );

    expect(error.stack).toBe(source.stack);
  });

  it('should omit sourceData from JSON when undefined', () => {
    const error = new TestTypedError(TestErrorType.Simple);

    const json = error.toJSON();
    expect(json.sourceData).toBeUndefined();
  });
});
