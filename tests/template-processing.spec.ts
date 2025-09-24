import { I18nEngine, DefaultLanguage, buildReasonMap, isTemplate } from '../src';

describe('Template Processing with buildReasonMap', () => {
  enum TestErrorType {
    SimpleError = 'SimpleError',
    TemplateError = 'TemplateError',
  }

  beforeEach(() => {
    I18nEngine.clearInstances();
  });

  it('should process template variables when Template suffix is used', () => {
    // Create reason map with template keys
    const templateKeys = new Set([TestErrorType.TemplateError]);
    const reasonMap = buildReasonMap(TestErrorType, ['Error', 'Test'], templateKeys);
    
    // Initialize engine with template translations
    const engine = new I18nEngine({
      stringNames: Object.values(reasonMap),
      strings: {
        [DefaultLanguage.EnglishUS]: {
          [reasonMap[TestErrorType.SimpleError]]: 'Simple error occurred',
          [reasonMap[TestErrorType.TemplateError]]: 'Template error: {message} with code {code}',
        }
      },
      defaultLanguage: DefaultLanguage.EnglishUS,
      defaultTranslationContext: 'user',
      defaultCurrencyCode: { code: 'USD' } as any,
      languageCodes: { [DefaultLanguage.EnglishUS]: 'en' },
      languages: [DefaultLanguage.EnglishUS],
      timezone: { name: 'UTC' } as any,
      adminTimezone: { name: 'UTC' } as any,
    });

    // Test simple error (no template processing)
    const simpleResult = engine.translate(reasonMap[TestErrorType.SimpleError]);
    expect(simpleResult).toBe('Simple error occurred');

    // Test template error (with variable processing)
    const templateResult = engine.translate(reasonMap[TestErrorType.TemplateError], {
      message: 'Connection failed',
      code: '500'
    });
    expect(templateResult).toBe('Template error: Connection failed with code 500');
  });

  it('should verify buildReasonMap creates correct Template suffix', () => {
    const templateKeys = new Set([TestErrorType.TemplateError]);
    const reasonMap = buildReasonMap(TestErrorType, ['Error', 'Test'], templateKeys);
    
    // Verify the keys are generated correctly
    expect(reasonMap[TestErrorType.SimpleError]).toBe('Error_Test_SimpleError');
    expect(reasonMap[TestErrorType.TemplateError]).toBe('Error_Test_TemplateErrorTemplate');
    
    // Verify isTemplate detection works
    expect(isTemplate(reasonMap[TestErrorType.SimpleError])).toBe(false);
    expect(isTemplate(reasonMap[TestErrorType.TemplateError])).toBe(true);
  });

  it('should handle multiple template keys', () => {
    enum MultiTestErrorType {
      Error1 = 'Error1',
      Error2Template = 'Error2Template', 
      Error3 = 'Error3',
      Error4Template = 'Error4Template',
    }

    const templateKeys = new Set([
      MultiTestErrorType.Error2Template,
      MultiTestErrorType.Error4Template
    ]);
    
    const reasonMap = buildReasonMap(MultiTestErrorType, ['Prefix'], templateKeys);
    
    expect(reasonMap[MultiTestErrorType.Error1]).toBe('Prefix_Error1');
    expect(reasonMap[MultiTestErrorType.Error2Template]).toBe('Prefix_Error2TemplateTemplate');
    expect(reasonMap[MultiTestErrorType.Error3]).toBe('Prefix_Error3');
    expect(reasonMap[MultiTestErrorType.Error4Template]).toBe('Prefix_Error4TemplateTemplate');
  });

  it('should work with empty template set', () => {
    const reasonMap = buildReasonMap(TestErrorType, ['Error'], new Set());
    
    expect(reasonMap[TestErrorType.SimpleError]).toBe('Error_SimpleError');
    expect(reasonMap[TestErrorType.TemplateError]).toBe('Error_TemplateError');
    
    // No Template suffix should be added
    expect(isTemplate(reasonMap[TestErrorType.TemplateError])).toBe(false);
  });
});