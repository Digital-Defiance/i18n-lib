import { HandleableError } from '../src/errors/handleable';
import { HandleableErrorOptions } from '../src/interfaces/handleable-error-options';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';
import { LanguageCodes } from '../src/language-codes';
import { CompleteReasonMap } from '../src/errors/typed';
import { TypedHandleableError } from '../src/errors/typed-handleable';

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
    let engine: PluginI18nEngine<string>;
    try {
      engine = PluginI18nEngine.getInstance<string>('testEngine');
    } catch {
      const languages = [
        { id: LanguageCodes.EN_US, name: 'English (US)', code: 'en-US', isDefault: true },
        { id: LanguageCodes.EN_GB, name: 'English (UK)', code: 'en-GB' },
        { id: LanguageCodes.FR, name: 'French', code: 'fr' },
        { id: LanguageCodes.ES, name: 'Spanish', code: 'es' },
        { id: LanguageCodes.DE, name: 'German', code: 'de' },
        { id: LanguageCodes.JA, name: 'Japanese', code: 'ja' },
        { id: LanguageCodes.ZH_CN, name: 'Chinese', code: 'zh-CN' },
        { id: LanguageCodes.UK, name: 'Ukrainian', code: 'uk' },
      ];
      engine = PluginI18nEngine.createInstance<string>('testEngine', languages);
      engine.registerComponent({
        component: {
          id: 'test-component',
          name: 'Test Component',
          stringKeys: [TestStringKeys.Common_Test, TestStringKeys.Error_MissingTranslationTemplate],
        },
        strings: {
          [LanguageCodes.EN_US]: {
            [TestStringKeys.Common_Test]: 'This is a test error message.',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Missing template variable: {key} in language {language}.',
          },
          [LanguageCodes.EN_GB]: {
            [TestStringKeys.Common_Test]: 'This is a test error message (UK).',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Missing template variable: {key} in language {language} (UK).',
          },
          [LanguageCodes.FR]: {
            [TestStringKeys.Common_Test]: "Ceci est un message d'erreur de test.",
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Variable de modèle manquante : {key} dans la langue {language}.',
          },
          [LanguageCodes.ES]: {
            [TestStringKeys.Common_Test]: 'Este es un mensaje de error de prueba.',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Falta la variable de plantilla: {key} en el idioma {language}.',
          },
          [LanguageCodes.ZH_CN]: {
            [TestStringKeys.Common_Test]: '这是一个测试错误消息。',
            [TestStringKeys.Error_MissingTranslationTemplate]: '缺少模板变量：{key} 在语言 {language} 中。',
          },
          [LanguageCodes.JA]: {
            [TestStringKeys.Common_Test]: 'これはテストエラーメッセージです。',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'テンプレート変数がありません: {key} 言語 {language} で。',
          },
          [LanguageCodes.DE]: {
            [TestStringKeys.Common_Test]: 'Dies ist eine Testfehlermeldung.',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Fehlender Vorlagenvariable: {key} in Sprache {language}.',
          },
          [LanguageCodes.UK]: {
            [TestStringKeys.Common_Test]: 'Це тестове повідомлення про помилку.',
            [TestStringKeys.Error_MissingTranslationTemplate]: 'Відсутня змінна шаблону: {key} мовою {language}.',
          },
        },
      });
    }
    super(type, testReasonMap, 'test-component', language, otherVars, options);
    this.name = 'TestTypedError';
  }
}

describe('TypedError', () => {
  beforeEach(() => {
    PluginI18nEngine.resetAll();
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
});
