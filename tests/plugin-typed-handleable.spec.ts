import { HandleableErrorOptions } from '../src/i-handleable-error-options';
import { LanguageDefinition } from '../src/language-definition';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';
import { PluginTypedHandleableError } from '../src/plugin-typed-handleable';
import { CompleteReasonMap } from '../src/typed-error';

enum TestErrorType {
  Simple = 'simple',
  Templated = 'templated',
}

enum TestStringKey {
  SimpleError = 'simpleError',
  TemplatedErrorTemplate = 'templatedErrorTemplate',
}

const testReasonMap: CompleteReasonMap<typeof TestErrorType, TestStringKey> = {
  [TestErrorType.Simple]: TestStringKey.SimpleError,
  [TestErrorType.Templated]: TestStringKey.TemplatedErrorTemplate,
};

const testLanguages: LanguageDefinition[] = [
  { id: 'en', name: 'English', code: 'en', isDefault: true },
  { id: 'fr', name: 'French', code: 'fr', isDefault: false },
];

describe('PluginTypedHandleableError', () => {
  let engine: PluginI18nEngine<string>;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = new PluginI18nEngine(testLanguages);
    engine.registerComponent({
      component: {
        id: 'test-component',
        name: 'Test Component',
        stringKeys: [
          TestStringKey.SimpleError,
          TestStringKey.TemplatedErrorTemplate,
        ],
      },
      strings: {
        en: {
          [TestStringKey.SimpleError]: 'Simple error',
          [TestStringKey.TemplatedErrorTemplate]: 'Error with {key}',
        },
        fr: {
          [TestStringKey.SimpleError]: 'Erreur simple',
          [TestStringKey.TemplatedErrorTemplate]: 'Erreur avec {key}',
        },
      },
    });
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  it('should create error with basic properties', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
    );

    expect(error.type).toBe(TestErrorType.Simple);
    expect(error.cause).toBe(source);
    expect(error.statusCode).toBe(500);
    expect(error.handled).toBe(false);
    expect(error.componentId).toBe('test-component');
  });

  it('should create error with custom status code', () => {
    const source = new Error('Source error');
    const options: HandleableErrorOptions = { statusCode: 404 };
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
      options,
    );

    expect(error.statusCode).toBe(404);
  });

  it('should create error with handled flag', () => {
    const source = new Error('Source error');
    const options: HandleableErrorOptions = { handled: true };
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
      options,
    );

    expect(error.handled).toBe(true);
  });

  it('should allow setting handled property', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
    );

    expect(error.handled).toBe(false);
    error.handled = true;
    expect(error.handled).toBe(true);
  });

  it('should create error with source data', () => {
    const source = new Error('Source error');
    const sourceData = { userId: 123, action: 'login' };
    const options: HandleableErrorOptions = { sourceData };
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
      options,
    );

    expect(error.sourceData).toEqual(sourceData);
  });

  it('should translate message with variables', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Templated,
      testReasonMap,
      source,
      undefined,
      undefined,
      { key: 'value' },
    );

    expect(error.message).toBe('Error with value');
  });

  it('should translate message in different language', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
      undefined,
      'fr',
    );

    expect(error.message).toBe('Erreur simple');
  });

  it('should preserve source stack trace', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
    );

    expect(error.stack).toBe(source.stack);
  });

  it('should serialize to JSON correctly', () => {
    const source = new Error('Source error');
    const options: HandleableErrorOptions = {
      statusCode: 400,
      handled: true,
      sourceData: { test: 'data' },
    };
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
      options,
    );

    const json = error.toJSON();

    expect(json.name).toBe('PluginTypedHandleableError');
    expect(json.message).toBe('Simple error');
    expect(json.statusCode).toBe(400);
    expect(json.handled).toBe(true);
    expect(json.sourceData).toEqual({ test: 'data' });
    expect(json.cause).toBe('Source error');
  });

  it('should serialize nested PluginTypedHandleableError cause', () => {
    const innerSource = new Error('Inner error');
    const innerError = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      innerSource,
    );

    const outerSource = new Error('Outer error');
    const outerError = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Templated,
      testReasonMap,
      outerSource,
      { cause: innerError },
    );

    const json = outerError.toJSON();
    expect(json.cause).toBeDefined();
    expect(typeof json.cause).toBe('object');
  });

  it('should omit sourceData from JSON when undefined', () => {
    const source = new Error('Source error');
    const error = new PluginTypedHandleableError(
      engine,
      'test-component',
      TestErrorType.Simple,
      testReasonMap,
      source,
    );

    const json = error.toJSON();
    expect(json.sourceData).toBeUndefined();
  });
});
