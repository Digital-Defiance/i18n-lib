/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Comprehensive tests for typed.ts helper functions and classes
 */

import { CoreI18nComponentId, CoreStringKey } from '../src';
import { I18nEngine } from '../src/core/i18n-engine';
import {
  BaseTypedError,
  CompleteReasonMap,
  CoreTypedError,
  createComponentTypedError,
  createCoreTypedError,
  createTranslatedError,
  PluginTypedError,
  TranslationEngine,
} from '../src/errors/typed';

describe('Typed Error Helpers', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = new I18nEngine(
      [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        { id: 'fr', name: 'French', code: 'fr' },
      ],
      {},
      { instanceKey: 'default' },
    );

    engine.register({
      id: CoreI18nComponentId,
      strings: {
        'en-US': {
          [CoreStringKey.Error_InvalidInput]: 'Invalid input',
          [CoreStringKey.Error_NetworkError]: 'Network error',
          [CoreStringKey.Error_NotFound]: 'Not found',
        },
        fr: {
          [CoreStringKey.Error_InvalidInput]: 'Entrée invalide',
          [CoreStringKey.Error_NetworkError]: 'Erreur réseau',
          [CoreStringKey.Error_NotFound]: 'Non trouvé',
        },
      },
    });

    engine.register({
      id: 'test-component',
      strings: {
        'en-US': {
          simpleError: 'Simple error',
          templateError: 'Error: {message}',
        },
        fr: {
          simpleError: 'Erreur simple',
          templateError: 'Erreur: {message}',
        },
      },
    });
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('BaseTypedError', () => {
    enum TestType {
      Simple = 'Simple',
      Complex = 'Complex',
    }

    class TestBaseError extends BaseTypedError<typeof TestType> {
      constructor(
        type: TestType,
        message: string,
        metadata?: Record<string, any>,
      ) {
        super(type, message, metadata);
      }
    }

    it('should create error with type and message', () => {
      const error = new TestBaseError(TestType.Simple, 'Test message');
      expect(error.type).toBe(TestType.Simple);
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('TestBaseError');
    });

    it('should create error with metadata', () => {
      const metadata = { userId: 123, action: 'login' };
      const error = new TestBaseError(
        TestType.Complex,
        'Complex error',
        metadata,
      );
      expect(error.metadata).toEqual(metadata);
    });

    it('should create simple error using static method', () => {
      const error = TestBaseError.createSimple(
        TestType.Simple,
        'Static message',
        { context: 'test' },
      );
      expect(error.type).toBe(TestType.Simple);
      expect(error.message).toBe('Static message');
      expect(error.metadata).toEqual({ context: 'test' });
    });

    it('should create translated error using static method', () => {
      const mockEngine: TranslationEngine = {
        translate: () => 'Translated message',
        safeTranslate: () => 'Translated message',
      };

      const reasonMap = {
        [TestType.Simple]: 'simpleKey',
        [TestType.Complex]: 'complexKey',
      };

      const error = TestBaseError.createTranslated(
        mockEngine,
        'test-component',
        TestType.Simple,
        reasonMap,
        {},
        'en-US',
        { context: 'test' },
      );

      expect(error.message).toBe('Translated message');
      expect(error.type).toBe(TestType.Simple);
    });

    it('should fallback when engine is null', () => {
      const reasonMap = {
        [TestType.Simple]: 'simpleKey',
        [TestType.Complex]: 'complexKey',
      };

      const error = TestBaseError.createTranslated(
        null as any,
        'test-component',
        TestType.Simple,
        reasonMap,
        {},
        'en-US',
        { userId: 123 },
      );

      expect(error.message).toContain('Simple');
      expect(error.message).toContain('userId');
    });
  });

  describe('PluginTypedError', () => {
    enum TestErrorType {
      Simple = 'simple',
      Template = 'template',
    }

    const reasonMap: CompleteReasonMap<typeof TestErrorType, string> = {
      [TestErrorType.Simple]: 'simpleError',
      [TestErrorType.Template]: 'templateError',
    };

    class TestPluginError extends PluginTypedError<
      typeof TestErrorType,
      string
    > {
      constructor(
        type: TestErrorType,
        language?: string,
        otherVars?: Record<string, string | number>,
      ) {
        super('test-component', type, reasonMap, language, otherVars);
      }
    }

    it('should create plugin error with translation', () => {
      const error = new TestPluginError(TestErrorType.Simple);
      expect(error.message).toBe('Simple error');
      expect(error.type).toBe(TestErrorType.Simple);
      expect(error.componentId).toBe('test-component');
    });

    it('should create plugin error with variables', () => {
      const error = new TestPluginError(TestErrorType.Template, undefined, {
        message: 'test message',
      });
      expect(error.message).toBe('Error: test message');
    });

    it('should create plugin error in different language', () => {
      const error = new TestPluginError(TestErrorType.Simple, 'fr');
      expect(error.message).toBe('Erreur simple');
    });

    it('should throw when key not found in reason map', () => {
      const badReasonMap: any = {};

      expect(() => {
        new (class extends PluginTypedError<typeof TestErrorType, string> {
          constructor() {
            super('test-component', TestErrorType.Simple, badReasonMap);
          }
        })();
      }).toThrow();
    });
  });

  describe('CoreTypedError', () => {
    enum CoreErrorType {
      Invalid = 'Invalid',
      Network = 'Network',
      NotFound = 'NotFound',
    }

    const reasonMap: CompleteReasonMap<typeof CoreErrorType, CoreStringKey> = {
      [CoreErrorType.Invalid]: CoreStringKey.Error_InvalidInput,
      [CoreErrorType.Network]: CoreStringKey.Error_NetworkError,
      [CoreErrorType.NotFound]: CoreStringKey.Error_NotFound,
    };

    class TestCoreError extends CoreTypedError<typeof CoreErrorType> {
      constructor(
        type: CoreErrorType,
        language?: string,
        otherVars?: Record<string, string | number>,
      ) {
        super(type, reasonMap, language, otherVars);
      }
    }

    it('should create core error with translation', () => {
      const error = new TestCoreError(CoreErrorType.Invalid);
      expect(error.message).toBe('Invalid input');
      expect(error.type).toBe(CoreErrorType.Invalid);
    });

    it('should create core error in different language', () => {
      const error = new TestCoreError(CoreErrorType.Network, 'fr');
      expect(error.message).toBe('Erreur réseau');
    });

    it('should throw when key not found in reason map', () => {
      const badReasonMap: any = {};

      expect(() => {
        new (class extends CoreTypedError<typeof CoreErrorType> {
          constructor() {
            super(CoreErrorType.Invalid, badReasonMap);
          }
        })();
      }).toThrow();
    });
  });

  describe('createComponentTypedError', () => {
    enum TestErrorType {
      Simple = 'simple',
      Template = 'template',
    }

    const reasonMap: CompleteReasonMap<typeof TestErrorType, string> = {
      [TestErrorType.Simple]: 'simpleError',
      [TestErrorType.Template]: 'templateError',
    };

    it('should create component error using helper', () => {
      const error = createComponentTypedError(
        'test-component',
        TestErrorType.Simple,
        reasonMap,
      );

      expect(error.message).toBe('Simple error');
    });

    it('should create component error with variables', () => {
      const error = createComponentTypedError(
        'test-component',
        TestErrorType.Template,
        reasonMap,
        { message: 'custom message' },
      );

      expect(error.message).toBe('Error: custom message');
    });

    it('should create component error in different language', () => {
      const error = createComponentTypedError(
        'test-component',
        TestErrorType.Simple,
        reasonMap,
        {},
        'fr',
      );

      expect(error.message).toBe('Erreur simple');
    });

    it('should use custom instance key', () => {
      const customEngine = I18nEngine.createInstance('custom', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      customEngine.register({
        id: 'test-component',
        strings: {
          'en-US': {
            simpleError: 'Custom simple error',
          },
        },
      });

      const error = createComponentTypedError(
        'test-component',
        TestErrorType.Simple,
        reasonMap,
        {},
        undefined,
        'custom',
      );

      expect(error.message).toBe('Custom simple error');
    });
  });

  describe('createCoreTypedError', () => {
    enum CoreErrorType {
      Invalid = 'Invalid',
      Network = 'Network',
    }

    const reasonMap: CompleteReasonMap<typeof CoreErrorType, CoreStringKey> = {
      [CoreErrorType.Invalid]: CoreStringKey.Error_InvalidInput,
      [CoreErrorType.Network]: CoreStringKey.Error_NetworkError,
    };

    it('should create core error using helper', () => {
      const error = createCoreTypedError(CoreErrorType.Invalid, reasonMap);
      expect(error.message).toBe('Invalid input');
    });

    it('should create core error in different language', () => {
      const error = createCoreTypedError(
        CoreErrorType.Network,
        reasonMap,
        {},
        'fr',
      );
      expect(error.message).toBe('Erreur réseau');
    });

    it('should use custom instance key', () => {
      const customEngine = I18nEngine.createInstance('custom-core', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      customEngine.register({
        id: CoreI18nComponentId,
        strings: {
          'en-US': {
            [CoreStringKey.Error_InvalidInput]: 'Custom invalid input',
          },
        },
      });

      const error = createCoreTypedError(
        CoreErrorType.Invalid,
        reasonMap,
        {},
        undefined,
        'custom-core',
      );

      expect(error.message).toBe('Custom invalid input');
    });
  });

  describe('createTranslatedError', () => {
    enum CustomErrorType {
      Network = 'Network',
      Validation = 'Validation',
    }

    const reasonMap = {
      [CustomErrorType.Network]: 'networkKey',
      [CustomErrorType.Validation]: 'validationKey',
    };

    it('should create translated error with engine', () => {
      const mockEngine: TranslationEngine = {
        translate: (componentId, key) => {
          if (key === 'networkKey') return 'Network error occurred';
          return 'Unknown error';
        },
        safeTranslate: (componentId, key) => {
          if (key === 'networkKey') return 'Network error occurred';
          return 'Unknown error';
        },
      };

      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.Network,
        reasonMap,
      );

      expect(error.message).toBe('Network error occurred');
      expect((error as any).type).toBe(CustomErrorType.Network);
    });

    it('should create error with variables', () => {
      const mockEngine: TranslationEngine = {
        translate: (componentId, key, variables) => {
          return `Error code: ${variables?.code}`;
        },
        safeTranslate: (componentId, key, variables) => {
          return `Error code: ${variables?.code}`;
        },
      };

      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.Network,
        reasonMap,
        { code: 500 },
      );

      expect(error.message).toBe('Error code: 500');
    });

    it('should create error with metadata', () => {
      const mockEngine: TranslationEngine = {
        translate: () => 'Error message',
        safeTranslate: () => 'Error message',
      };

      const metadata = { timestamp: Date.now(), userId: 123 };
      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.Network,
        reasonMap,
        {},
        'en-US',
        metadata,
      );

      expect((error as any).metadata).toEqual(metadata);
    });

    it('should create error with custom name', () => {
      const mockEngine: TranslationEngine = {
        translate: () => 'Error message',
        safeTranslate: () => 'Error message',
      };

      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.Network,
        reasonMap,
        {},
        'en-US',
        {},
        'CustomNetworkError',
      );

      expect(error.name).toBe('CustomNetworkError');
    });

    it('should fallback when translation fails', () => {
      const failingEngine: TranslationEngine = {
        translate: () => {
          throw new Error('Translation failed');
        },
        safeTranslate: () => {
          throw new Error('Translation failed');
        },
      };

      const error = createTranslatedError(
        failingEngine,
        'test-component',
        CustomErrorType.Network,
        reasonMap,
        {},
        'en-US',
        { userId: 123 },
      );

      expect(error.message).toContain('Network');
      expect(error.message).toContain('userId');
    });

    it('should fallback when engine is null', () => {
      const error = createTranslatedError(
        null as any,
        'test-component',
        CustomErrorType.Validation,
        reasonMap,
        {},
        'en-US',
        { field: 'email' },
      );

      expect(error.message).toContain('Validation');
      expect(error.message).toContain('field');
    });

    it('should fallback when key not in reason map', () => {
      const mockEngine: TranslationEngine = {
        translate: () => 'Error message',
        safeTranslate: () => 'Error message',
      };

      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.Network,
        {} as any,
        {},
        'en-US',
        { code: 404 },
      );

      expect(error.message).toContain('Network');
    });
  });
});
