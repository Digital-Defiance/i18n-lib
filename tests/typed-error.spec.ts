import { DefaultLanguage, DefaultStringKey, getDefaultI18nEngine } from '../src/default-config';
import { TypedError, CompleteReasonMap } from '../src/typed-error';
import { I18nEngine } from '../src/i18n-engine';
import { buildTypeSafeReasonMap, createCompleteReasonMap, validateReasonMap } from '../src/utils';

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
    otherVars?: Record<string, string | number>
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
      { key: 'testKey', language: 'English' }
    );
    expect(error.message).toBe("Missing translation for key 'testKey' in language 'English'");
  });

  it('should work with different languages', () => {
    const error = new TestError(TestErrorType.Basic, DefaultLanguage.French);
    expect(error.message).toBe('Test');
  });

  it('should create templated error in different language', () => {
    const error = new TestError(
      TestErrorType.Template,
      DefaultLanguage.French,
      { key: 'testKey', language: 'Français' }
    );
    expect(error.message).toBe("Traduction manquante pour la clé 'testKey' dans la langue 'Français'");
  });

  describe('Type Safety Utils', () => {
    it('should validate complete reason map', () => {
      const completeMap = {
        [TestErrorType.Basic]: DefaultStringKey.Common_Test,
        [TestErrorType.Template]: DefaultStringKey.Error_MissingTranslationTemplate,
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
        new Set([TestErrorType.Template])
      );
      
      expect(reasonMap[TestErrorType.Basic]).toBe('Error_Test_Basic');
      expect(reasonMap[TestErrorType.Template]).toBe('Error_Test_TemplateTemplate');
    });

    it('should throw error for incomplete reason map creation', () => {
      enum IncompleteEnum {
        One = 'One',
        Two = 'Two',
      }
      
      const incompleteMap = { [IncompleteEnum.One]: 'Error_One' as DefaultStringKey };
      
      expect(() => {
        if (!validateReasonMap(IncompleteEnum, incompleteMap)) {
          const missing = Object.values(IncompleteEnum).filter(value => !(value in incompleteMap));
          throw new Error(`Missing reason map entries for: ${missing.join(', ')}`);
        }
      }).toThrow('Missing reason map entries for: Two');
    });

    it('should build type-safe reason map', () => {
      const reasonMap = buildTypeSafeReasonMap(
        TestErrorType,
        ['Error', 'Safe'] as const,
        new Set([TestErrorType.Template])
      );
      
      expect(reasonMap[TestErrorType.Basic]).toBe('Error_Safe_Basic');
      expect(reasonMap[TestErrorType.Template]).toBe('Error_Safe_TemplateTemplate');
    });
  });
});