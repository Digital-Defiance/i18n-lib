import { CoreI18nComponentId, CoreStringKey } from '../src';
import { I18nEngine } from '../src/core';
import {
  BaseTypedError,
  CompleteReasonMap,
  ComponentTypedError,
  CoreTypedError,
  PluginTypedError,
  createComponentTypedError,
  createCoreTypedError,
  createPluginTypedError,
  createTranslatedError,
} from '../src/errors/typed';

enum TestErrorType {
  Error1 = 'error1',
  Error2 = 'error2',
}

const testReasonMap: CompleteReasonMap<typeof TestErrorType, CoreStringKey> = {
  [TestErrorType.Error1]: CoreStringKey.Error_InvalidInput,
  [TestErrorType.Error2]: CoreStringKey.Error_NetworkError,
};

class TestTypedError extends AbstractTypedError<
  typeof TestErrorType,
  CoreStringKey
> {
  constructor(
    type: TestErrorType,
    language?: string,
    vars?: Record<string, string | number>,
  ) {
    super(CoreI18nComponentId, type, testReasonMap, language, vars);
  }
}

class TestBaseTypedError extends BaseTypedError<typeof TestErrorType> {
  constructor(
    type: TestErrorType,
    message: string,
    metadata?: Record<string, any>,
  ) {
    super(type, message, metadata);
  }
}

describe('typed error coverage', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('TypedError translate fallback', () => {
    it('should fallback to safeTranslate when translate fails', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: { 'en-US': {} }, // Empty strings to trigger fallback
      });

      const error = new TestTypedError(TestErrorType.Error1, 'en-US');
      expect(error.message).toContain('core');
    });
  });

  describe('BaseTypedError.createTranslated', () => {
    it('should create error with translation', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: {
          'en-US': {
            [CoreStringKey.Error_InvalidInput]: 'Invalid input',
          },
        },
      });

      const error = TestBaseTypedError.createTranslated(
        engine,
        CoreI18nComponentId,
        TestErrorType.Error1,
        testReasonMap,
        undefined,
        'en-US',
      );

      expect(error.message).toBe('Invalid input');
      expect(error.type).toBe(TestErrorType.Error1);
    });

    it('should fallback when key not in reasonMap', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      const incompleteMap = {} as CompleteReasonMap<
        typeof TestErrorType,
        CoreStringKey
      >;
      const error = TestBaseTypedError.createTranslated(
        engine,
        CoreI18nComponentId,
        TestErrorType.Error1,
        incompleteMap,
        undefined,
        'en-US',
      );

      expect(error.message).toContain('error1');
    });

    it('should include metadata in fallback message', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      const incompleteMap = {} as CompleteReasonMap<
        typeof TestErrorType,
        CoreStringKey
      >;
      const metadata = { detail: 'test' };
      const error = TestBaseTypedError.createTranslated(
        engine,
        CoreI18nComponentId,
        TestErrorType.Error1,
        incompleteMap,
        undefined,
        'en-US',
        metadata,
      );

      expect(error.message).toContain('error1');
      expect(error.message).toContain('test');
    });
  });

  describe('PluginTypedError', () => {
    it('should throw when key not in reasonMap', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: {
          'en-US': {
            [CoreStringKey.Error_StringKeyNotFoundTemplate]: 'Key not found',
          },
        },
      });

      class TestPluginError extends PluginTypedError<
        typeof TestErrorType,
        CoreStringKey
      > {
        constructor(type: TestErrorType) {
          super(CoreI18nComponentId, type, {} as any, 'en-US');
        }
      }

      expect(() => new TestPluginError(TestErrorType.Error1)).toThrow();
    });
  });

  describe('ComponentTypedError', () => {
    it('should throw when key not in reasonMap', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: {
          'en-US': {
            [CoreStringKey.Error_StringKeyNotFoundTemplate]: 'Key not found',
          },
        },
      });

      class TestComponentError extends ComponentTypedError<
        typeof TestErrorType,
        CoreStringKey
      > {
        constructor(type: TestErrorType) {
          super(CoreI18nComponentId, type, {} as any, 'en-US');
        }
      }

      expect(() => new TestComponentError(TestErrorType.Error1)).toThrow();
    });
  });

  describe('CoreTypedError', () => {
    it('should throw when key not in reasonMap', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: {
          'en-US': {
            [CoreStringKey.Error_StringKeyNotFoundTemplate]: 'Key not found',
          },
        },
      });

      class TestCoreError extends CoreTypedError<typeof TestErrorType> {
        constructor(type: TestErrorType) {
          super(type, {} as any, 'en-US');
        }
      }

      expect(() => new TestCoreError(TestErrorType.Error1)).toThrow();
    });
  });

  describe('createPluginTypedError', () => {
    it('should create error using deprecated function', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: CoreI18nComponentId,
        strings: { 'en-US': { [CoreStringKey.Error_InvalidInput]: 'Invalid' } },
      });

      const error = createPluginTypedError(
        CoreI18nComponentId,
        TestErrorType.Error1,
        testReasonMap,
        undefined,
        'en-US',
      );

      expect(error.message).toBe('Invalid');
      expect(error.name).toBe('PluginTypedError');
    });
  });

  describe('createComponentTypedError', () => {
    it('should throw when key missing', () => {
      I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      expect(() => {
        createComponentTypedError(
          CoreI18nComponentId,
          TestErrorType.Error1,
          {} as any,
          undefined,
          'en-US',
        );
      }).toThrow('Missing key');
    });
  });

  describe('createCoreTypedError', () => {
    it('should throw when key missing', () => {
      I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      expect(() => {
        createCoreTypedError(
          TestErrorType.Error1,
          {} as any,
          undefined,
          'en-US',
        );
      }).toThrow('Missing key');
    });
  });

  describe('createTranslatedError', () => {
    it('should handle translation error gracefully', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);
      engine.registerIfNotExists({
        id: 'test-comp',
        strings: { 'en-US': {} },
      });

      const error = createTranslatedError(
        engine,
        'test-comp',
        TestErrorType.Error1,
        testReasonMap,
        undefined,
        'en-US',
      );

      expect(error.message).toBeDefined();
    });

    it('should use custom error name', () => {
      const engine = I18nEngine.registerIfNotExists('default', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      const error = createTranslatedError(
        engine,
        CoreI18nComponentId,
        TestErrorType.Error1,
        testReasonMap,
        undefined,
        'en-US',
        { test: 'data' },
        'CustomError',
      );

      expect(error.name).toBe('CustomError');
      expect((error as any).metadata).toEqual({ test: 'data' });
    });

    it('should fallback when engine is null', () => {
      const error = createTranslatedError(
        null as any,
        CoreI18nComponentId,
        TestErrorType.Error1,
        testReasonMap,
        undefined,
        'en-US',
        { test: 'data' },
      );

      expect(error.message).toContain('error1');
      expect(error.message).toContain('test');
    });
  });
});
