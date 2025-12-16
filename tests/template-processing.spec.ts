/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { buildReasonMap, I18nEngine, isTemplate } from '../src';

describe('Template Processing with buildReasonMap', () => {
  enum TestErrorType {
    SimpleError = 'SimpleError',
    TemplateError = 'TemplateError',
  }

  beforeEach(() => {
    I18nEngine.resetAll();
  });

  it('should process template variables when Template suffix is used', () => {
    // Create reason map with template keys
    const templateKeys = new Set([TestErrorType.TemplateError]);
    const reasonMap = buildReasonMap(
      TestErrorType,
      ['Error', 'Test'],
      templateKeys,
    );

    // Initialize engine with template translations
    const langs = [
      { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    ];
    const engine = new I18nEngine(langs);

    engine.register({
      id: 'test',
      name: 'Test',
      stringKeys: Object.values(reasonMap),
      strings: {
        'en-US': {
          [reasonMap[TestErrorType.SimpleError]]: 'Simple error occurred',
          [reasonMap[TestErrorType.TemplateError]]:
            'Template error: {message} with code {code}',
        },
      },
    });

    // Test simple error (no template processing)
    const simpleResult = engine.translate(
      'test',
      reasonMap[TestErrorType.SimpleError],
    );
    expect(simpleResult).toBe('Simple error occurred');

    // Test template error (with variable processing)
    const templateResult = engine.translate(
      'test',
      reasonMap[TestErrorType.TemplateError],
      {
        message: 'Connection failed',
        code: '500',
      },
    );
    expect(templateResult).toBe(
      'Template error: Connection failed with code 500',
    );
  });

  it('should verify buildReasonMap creates correct Template suffix', () => {
    const templateKeys = new Set([TestErrorType.TemplateError]);
    const reasonMap = buildReasonMap(
      TestErrorType,
      ['Error', 'Test'],
      templateKeys,
    );

    // Verify the keys are generated correctly
    expect(reasonMap[TestErrorType.SimpleError]).toBe('Error_Test_SimpleError');
    expect(reasonMap[TestErrorType.TemplateError]).toBe(
      'Error_Test_TemplateErrorTemplate',
    );

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
      MultiTestErrorType.Error4Template,
    ]);

    const reasonMap = buildReasonMap(
      MultiTestErrorType,
      ['Prefix'],
      templateKeys,
    );

    expect(reasonMap[MultiTestErrorType.Error1]).toBe('Prefix_Error1');
    expect(reasonMap[MultiTestErrorType.Error2Template]).toBe(
      'Prefix_Error2TemplateTemplate',
    );
    expect(reasonMap[MultiTestErrorType.Error3]).toBe('Prefix_Error3');
    expect(reasonMap[MultiTestErrorType.Error4Template]).toBe(
      'Prefix_Error4TemplateTemplate',
    );
  });

  it('should work with empty template set', () => {
    const reasonMap = buildReasonMap(TestErrorType, ['Error'], new Set());

    expect(reasonMap[TestErrorType.SimpleError]).toBe('Error_SimpleError');
    expect(reasonMap[TestErrorType.TemplateError]).toBe('Error_TemplateError');

    // No Template suffix should be added
    expect(isTemplate(reasonMap[TestErrorType.TemplateError])).toBe(false);
  });
});
