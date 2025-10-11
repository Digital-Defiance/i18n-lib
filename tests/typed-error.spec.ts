import {
  DefaultLanguage,
  DefaultStringKey,
  getDefaultI18nEngine,
} from '../src/default-config';
import { I18nEngine } from '../src/i18n-engine';
import {
  BaseTypedError,
  CompleteReasonMap,
  TranslationEngine,
  TypedError,
  createTranslatedError,
} from '../src/typed-error';
import {
  buildTypeSafeReasonMap,
  createCompleteReasonMap,
  validateReasonMap,
} from '../src/utils';

enum TestErrorType {
  Basic = 'Basic',
  Template = 'Template',
}

const reasonMap: CompleteReasonMap<typeof TestErrorType, DefaultStringKey> = {
  [TestErrorType.Basic]: DefaultStringKey.Common_Test,
  [TestErrorType.Template]: DefaultStringKey.Error_MissingTranslationTemplate,
};

class TestError extends TypedError<typeof TestErrorType, DefaultStringKey> {
  constructor(
    type: TestErrorType,
    language?: DefaultLanguage,
    otherVars?: Record<string, string | number>,
  ) {
    const engine = getDefaultI18nEngine({}, undefined, undefined);
    super(engine, type, reasonMap, language, otherVars);
  }
}

describe('TypedError', () => {
  beforeEach(() => {
    // Clear singleton instances before each test
    (I18nEngine as any)._instances.clear();
  });

  it('should create error with simple translation', () => {
    const error = new TestError(TestErrorType.Basic);
    expect(error.message).toBe('Test');
    expect(error.type).toBe(TestErrorType.Basic);
    expect(error.name).toBe('TestError');
  });

  it('should create error with templated translation', () => {
    const error = new TestError(
      TestErrorType.Template,
      DefaultLanguage.EnglishUS,
      { key: 'testKey', language: 'English' },
    );
    expect(error.message).toBe(
      "Missing translation for key 'testKey' in language 'English'",
    );
  });

  it('should work with different languages', () => {
    const error = new TestError(TestErrorType.Basic, DefaultLanguage.French);
    expect(error.message).toBe('Test');
  });

  it('should create templated error in different language', () => {
    const error = new TestError(
      TestErrorType.Template,
      DefaultLanguage.French,
      { key: 'testKey', language: 'Français' },
    );
    expect(error.message).toBe(
      "Traduction manquante pour la clé 'testKey' dans la langue 'Français'",
    );
  });

  describe('Type Safety Utils', () => {
    it('should validate complete reason map', () => {
      const completeMap = {
        [TestErrorType.Basic]: DefaultStringKey.Common_Test,
        [TestErrorType.Template]:
          DefaultStringKey.Error_MissingTranslationTemplate,
      };

      expect(validateReasonMap(TestErrorType, completeMap)).toBe(true);
    });

    it('should detect incomplete reason map', () => {
      const incompleteMap = {
        [TestErrorType.Basic]: DefaultStringKey.Common_Test,
        // Missing TestErrorType.Template
      };

      expect(validateReasonMap(TestErrorType, incompleteMap)).toBe(false);
    });

    it('should create complete reason map with validation', () => {
      const reasonMap = createCompleteReasonMap(
        TestErrorType,
        ['Error', 'Test'],
        new Set([TestErrorType.Template]),
      );

      expect(reasonMap[TestErrorType.Basic]).toBe('Error_Test_Basic');
      expect(reasonMap[TestErrorType.Template]).toBe(
        'Error_Test_TemplateTemplate',
      );
    });

    it('should throw error for incomplete reason map creation', () => {
      enum IncompleteEnum {
        One = 'One',
        Two = 'Two',
      }

      const incompleteMap = {
        [IncompleteEnum.One]: 'Error_One' as DefaultStringKey,
      };

      expect(() => {
        if (!validateReasonMap(IncompleteEnum, incompleteMap)) {
          const missing = Object.values(IncompleteEnum).filter(
            (value) => !(value in incompleteMap),
          );
          throw new Error(
            `Missing reason map entries for: ${missing.join(', ')}`,
          );
        }
      }).toThrow('Missing reason map entries for: Two');
    });

    it('should build type-safe reason map', () => {
      const reasonMap = buildTypeSafeReasonMap(
        TestErrorType,
        ['Error', 'Safe'] as const,
        new Set([TestErrorType.Template]),
      );

      expect(reasonMap[TestErrorType.Basic]).toBe('Error_Safe_Basic');
      expect(reasonMap[TestErrorType.Template]).toBe(
        'Error_Safe_TemplateTemplate',
      );
    });
  });

  describe('TranslationEngine and generalized patterns', () => {
    enum CustomErrorType {
      NetworkError = 'NetworkError',
      ValidationError = 'ValidationError',
    }

    const customReasonMap = {
      [CustomErrorType.NetworkError]: 'networkErrorKey',
      [CustomErrorType.ValidationError]: 'validationErrorKey',
    };

    it('should create translated error with engine', () => {
      const mockEngine: TranslationEngine = {
        safeTranslate: (componentId, key, variables, language) => {
          if (key === 'networkErrorKey') {
            return `Network error: ${variables?.code || 'unknown'}`;
          }
          return 'Fallback message';
        },
      };

      const error = createTranslatedError(
        mockEngine,
        'test-component',
        CustomErrorType.NetworkError,
        customReasonMap,
        { code: '500' },
        'en',
        { timestamp: Date.now() },
        'CustomError',
      );

      expect(error.message).toBe('Network error: 500');
      expect(error.name).toBe('CustomError');
      expect((error as any).type).toBe(CustomErrorType.NetworkError);
      expect((error as any).metadata).toEqual({
        timestamp: expect.any(Number),
      });
    });

    it('should fallback when engine fails', () => {
      const failingEngine: TranslationEngine = {
        safeTranslate: () => {
          throw new Error('Translation failed');
        },
      };

      const error = createTranslatedError(
        failingEngine,
        'test-component',
        CustomErrorType.ValidationError,
        customReasonMap,
        undefined,
        'en',
        { field: 'email' },
      );

      expect(error.message).toBe('Error: ValidationError - {"field":"email"}');
      expect((error as any).type).toBe(CustomErrorType.ValidationError);
    });

    it('should work without engine', () => {
      const error = createTranslatedError(
        null as any,
        'test-component',
        CustomErrorType.NetworkError,
        customReasonMap,
        undefined,
        'en',
        { code: 404 },
      );

      expect(error.message).toBe('Error: NetworkError - {"code":404}');
    });
  });

  describe('BaseTypedError', () => {
    enum SimpleErrorType {
      Basic = 'Basic',
      Advanced = 'Advanced',
    }

    class SimpleError extends BaseTypedError<typeof SimpleErrorType, string> {
      constructor(
        type: SimpleErrorType,
        message: string,
        metadata?: Record<string, any>,
      ) {
        super(type, message, metadata);
      }
    }

    it('should create simple typed error', () => {
      const error = new SimpleError(
        SimpleErrorType.Basic,
        'Simple error message',
        { context: 'test' },
      );

      expect(error.message).toBe('Simple error message');
      expect(error.type).toBe(SimpleErrorType.Basic);
      expect(error.metadata).toEqual({ context: 'test' });
      expect(error.name).toBe('SimpleError');
    });
  });
});
