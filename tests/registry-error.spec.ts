import { LanguageCodes } from '../src';
import { RegistryError } from '../src/registry-error';
import { RegistryErrorType } from '../src/registry-error-type';
import { TranslationEngine } from '../src/typed-error';

describe('RegistryError', () => {
  describe('createSimple', () => {
    it('should create simple registry error', () => {
      const error = RegistryError.createSimple(
        RegistryErrorType.ComponentNotFound,
        'Component "test" not found',
        { componentId: 'test' },
      );

      expect(error).toBeInstanceOf(RegistryError);
      expect(error.message).toBe('Component "test" not found');
      expect(error.type).toBe(RegistryErrorType.ComponentNotFound);
      expect(error.metadata).toEqual({ componentId: 'test' });
      expect(error.name).toBe('RegistryError');
    });

    it('should work without metadata', () => {
      const error = RegistryError.createSimple(
        RegistryErrorType.ValidationFailed,
        'Validation failed',
      );

      expect(error.message).toBe('Validation failed');
      expect(error.type).toBe(RegistryErrorType.ValidationFailed);
      expect(error.metadata).toBeUndefined();
    });
  });

  describe('createWithEngine', () => {
    let mockEngine: TranslationEngine;

    beforeEach(() => {
      mockEngine = {
        translate: jest.fn((key, variables, language) => {
          if (key === 'error_componentNotFoundTemplate') {
            return `Component '${variables?.componentId}' not found`;
          }
          if (key === 'error_validationFailedTemplate') {
            return `Validation failed: ${variables?.errors}`;
          }
          return 'Unknown error';
        }),
        safeTranslate: jest.fn((key, variables, language) => {
          if (key === 'error_componentNotFoundTemplate') {
            return `Component '${variables?.componentId}' not found`;
          }
          if (key === 'error_validationFailedTemplate') {
            return `Validation failed: ${variables?.errors}`;
          }
          return 'Unknown error';
        }),
      };
    });

    it('should create registry error with translation', () => {
      const error = RegistryError.createWithEngine(
        mockEngine,
        RegistryErrorType.ComponentNotFound,
        { componentId: 'test-component' },
        LanguageCodes.EN_US,
        { componentId: 'test-component' },
      );

      expect(error).toBeInstanceOf(RegistryError);
      expect(error.type).toBe(RegistryErrorType.ComponentNotFound);
      expect(error.metadata).toEqual({ componentId: 'test-component' });
      expect(mockEngine.safeTranslate).toHaveBeenCalledWith(
        'error_componentNotFoundTemplate',
        { componentId: 'test-component' },
        LanguageCodes.EN_US,
      );
    });

    it('should handle translation with variables', () => {
      const error = RegistryError.createWithEngine(
        mockEngine,
        RegistryErrorType.ValidationFailed,
        { errors: 'Missing required fields' },
        LanguageCodes.EN_US,
        { validationErrors: ['field1', 'field2'] },
      );

      expect(error.type).toBe(RegistryErrorType.ValidationFailed);
      expect(mockEngine.safeTranslate).toHaveBeenCalledWith(
        'error_validationFailedTemplate',
        { errors: 'Missing required fields' },
        LanguageCodes.EN_US,
      );
    });

    it('should fallback when engine fails', () => {
      const failingEngine: TranslationEngine = {
        translate: () => {
          throw new Error('Translation failed');
        },
        safeTranslate: () => {
          throw new Error('Translation failed');
        },
      };

      const error = RegistryError.createWithEngine(
        failingEngine,
        RegistryErrorType.DuplicateComponent,
        undefined,
        LanguageCodes.EN_US,
        { componentId: 'test' },
      );

      expect(error.type).toBe(RegistryErrorType.DuplicateComponent);
      expect(error.message).toBe(
        'Error: DUPLICATE_COMPONENT - {"componentId":"test"}',
      );
    });

    it('should work without engine', () => {
      const error = RegistryError.createWithEngine(
        null as any,
        RegistryErrorType.LanguageNotFound,
        undefined,
        LanguageCodes.EN_US,
        { languageId: 'missing' },
      );

      expect(error.type).toBe(RegistryErrorType.LanguageNotFound);
      expect(error.message).toBe(
        'Error: LANGUAGE_NOT_FOUND - {"languageId":"missing"}',
      );
    });
  });

  describe('error types coverage', () => {
    it('should have reason map entries for all error types', () => {
      const error = RegistryError.createSimple(
        RegistryErrorType.ComponentNotFound,
        'test',
      );

      // Test that all enum values are covered by creating errors with each type
      const errorTypes = Object.values(RegistryErrorType);
      errorTypes.forEach((errorType) => {
        expect(() => {
          RegistryError.createSimple(errorType, `Test ${errorType}`);
        }).not.toThrow();
      });
    });
  });
});
