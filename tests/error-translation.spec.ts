/**
 * Comprehensive tests for error translation
 * Ensures all error classes properly translate messages
 */

import { CoreI18nComponentId, CoreStringKey } from '../src';
import { I18nBuilder } from '../src/builders/i18n-builder';
import { I18nEngine } from '../src/core/i18n-engine';
import { I18nError, I18nErrorCode } from '../src/errors/i18n-error';
import { TranslatableError } from '../src/errors/translatable';
import { TranslatableGenericError } from '../src/errors/translatable-generic';
import { CompleteReasonMap } from '../src/errors/typed';
import { TypedHandleableError } from '../src/errors/typed-handleable';
import { HandleableErrorOptions } from '../src/interfaces/handleable-error-options';

describe('Error Translation - Comprehensive Tests', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
        { id: 'fr', name: 'French', code: 'fr' },
        { id: 'es', name: 'Spanish', code: 'es' },
      ])
      .build();

    // Register core component
    engine.register({
      id: CoreI18nComponentId,
      strings: {
        'en-US': {
          [CoreStringKey.Common_Test]: 'Test',
          [CoreStringKey.Error_InvalidInput]: 'Invalid input provided',
          [CoreStringKey.Error_NetworkError]: 'Network connection error',
          [CoreStringKey.Error_NotFound]: 'Resource not found',
          [CoreStringKey.Error_MissingTranslationKeyTemplate]:
            'Missing translation key: {stringKey}',
          [CoreStringKey.Error_ComponentNotFoundTemplate]:
            'Component "{componentId}" not found',
        },
        fr: {
          [CoreStringKey.Common_Test]: 'Test',
          [CoreStringKey.Error_InvalidInput]: 'Entrée invalide fournie',
          [CoreStringKey.Error_NetworkError]: 'Erreur de connexion réseau',
          [CoreStringKey.Error_NotFound]: 'Ressource non trouvée',
          [CoreStringKey.Error_MissingTranslationKeyTemplate]:
            'Clé de traduction manquante: {stringKey}',
          [CoreStringKey.Error_ComponentNotFoundTemplate]:
            'Composant "{componentId}" non trouvé',
        },
        es: {
          [CoreStringKey.Common_Test]: 'Test',
          [CoreStringKey.Error_InvalidInput]: 'Entrada inválida proporcionada',
          [CoreStringKey.Error_NetworkError]: 'Error de conexión de red',
          [CoreStringKey.Error_NotFound]: 'Recurso no encontrado',
          [CoreStringKey.Error_MissingTranslationKeyTemplate]:
            'Clave de traducción faltante: {stringKey}',
          [CoreStringKey.Error_ComponentNotFoundTemplate]:
            'Componente "{componentId}" no encontrado',
        },
      },
    });

    // Register test component
    engine.register({
      id: 'test-errors',
      strings: {
        'en-US': {
          simpleError: 'Simple error occurred',
          templateError: 'Error in {field}: {reason}',
          userNotFound: "User '{username}' not found",
        },
        fr: {
          simpleError: 'Erreur simple survenue',
          templateError: 'Erreur dans {field}: {reason}',
          userNotFound: "Utilisateur '{username}' introuvable",
        },
        es: {
          simpleError: 'Error simple ocurrido',
          templateError: 'Error en {field}: {reason}',
          userNotFound: "Usuario '{username}' no encontrado",
        },
      },
    });
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('I18nError Translation', () => {
    it('should create I18nError with translated message', () => {
      const error = I18nError.componentNotFound('test-component');
      expect(error.message).toContain('test-component');
      expect(error.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
    });

    it('should include metadata in I18nError', () => {
      const error = I18nError.componentNotFound('test-component');
      expect(error.metadata).toEqual({ componentId: 'test-component' });
    });

    it('should create different error types', () => {
      const notFoundError = I18nError.componentNotFound('comp1');
      const keyNotFoundError = I18nError.stringKeyNotFound('comp1', 'key1');
      const languageError = I18nError.languageNotFound('de');

      expect(notFoundError.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
      expect(keyNotFoundError.code).toBe(I18nErrorCode.STRING_KEY_NOT_FOUND);
      expect(languageError.code).toBe(I18nErrorCode.LANGUAGE_NOT_FOUND);
    });
  });

  describe('TypedError Translation', () => {
    enum TestErrorType {
      Simple = 'Simple',
      Network = 'Network',
      NotFound = 'NotFound',
    }

    const reasonMap: CompleteReasonMap<typeof TestErrorType, CoreStringKey> = {
      [TestErrorType.Simple]: CoreStringKey.Error_InvalidInput,
      [TestErrorType.Network]: CoreStringKey.Error_NetworkError,
      [TestErrorType.NotFound]: CoreStringKey.Error_NotFound,
    };

    class TestTypedError extends AbstractTypedError<
      typeof TestErrorType,
      CoreStringKey
    > {
      constructor(
        type: TestErrorType,
        language?: string,
        otherVars?: Record<string, string | number>,
      ) {
        super(CoreI18nComponentId, type, reasonMap, language, otherVars);
      }
    }

    it('should translate simple error message', () => {
      const error = new TestTypedError(TestErrorType.Simple);
      expect(error.message).toBe('Invalid input provided');
    });

    it('should translate error in different language', () => {
      const error = new TestTypedError(TestErrorType.Network, 'fr');
      expect(error.message).toBe('Erreur de connexion réseau');
    });

    it('should translate error in Spanish', () => {
      const error = new TestTypedError(TestErrorType.NotFound, 'es');
      expect(error.message).toBe('Recurso no encontrado');
    });

    it('should include error type in error object', () => {
      const error = new TestTypedError(TestErrorType.Simple);
      expect(error.type).toBe(TestErrorType.Simple);
      expect(error.componentId).toBe(CoreI18nComponentId);
    });

    it('should handle all error types', () => {
      const errors = [
        new TestTypedError(TestErrorType.Simple),
        new TestTypedError(TestErrorType.Network),
        new TestTypedError(TestErrorType.NotFound),
      ];

      expect(errors[0].message).toBe('Invalid input provided');
      expect(errors[1].message).toBe('Network connection error');
      expect(errors[2].message).toBe('Resource not found');
    });
  });

  describe('TypedHandleableError Translation', () => {
    enum TestErrorType {
      Simple = 'simple',
      Template = 'template',
      UserNotFound = 'userNotFound',
    }

    const reasonMap: CompleteReasonMap<typeof TestErrorType, string> = {
      [TestErrorType.Simple]: 'simpleError',
      [TestErrorType.Template]: 'templateError',
      [TestErrorType.UserNotFound]: 'userNotFound',
    };

    it('should translate simple handleable error', () => {
      const source = new Error('Source error');
      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.Simple,
        reasonMap,
        source,
      );

      expect(error.message).toBe('Simple error occurred');
      expect(error.type).toBe(TestErrorType.Simple);
      expect(error.cause).toBe(source);
    });

    it('should translate with template variables', () => {
      const source = new Error('Source error');
      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.Template,
        reasonMap,
        source,
        undefined,
        undefined,
        { field: 'email', reason: 'invalid format' },
      );

      expect(error.message).toBe('Error in email: invalid format');
    });

    it('should translate in different language', () => {
      const source = new Error('Source error');
      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.Simple,
        reasonMap,
        source,
        undefined,
        'fr',
      );

      expect(error.message).toBe('Erreur simple survenue');
    });

    it('should translate template in different language', () => {
      const source = new Error('Source error');
      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.UserNotFound,
        reasonMap,
        source,
        undefined,
        'es',
        { username: 'juan' },
      );

      expect(error.message).toBe("Usuario 'juan' no encontrado");
    });

    it('should preserve handleable properties', () => {
      const source = new Error('Source error');
      const options: HandleableErrorOptions = {
        statusCode: 404,
        handled: true,
        sourceData: { userId: 123 },
      };

      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.Simple,
        reasonMap,
        source,
        options,
      );

      expect(error.statusCode).toBe(404);
      expect(error.handled).toBe(true);
      expect(error.sourceData).toEqual({ userId: 123 });
    });

    it('should serialize with translated message', () => {
      const source = new Error('Source error');
      const error = new TypedHandleableError(
        'test-errors',
        TestErrorType.Simple,
        reasonMap,
        source,
      );

      const json = error.toJSON();
      expect(json.message).toBe('Simple error occurred');
      expect(json.type).toBe(TestErrorType.Simple);
    });
  });

  describe('TranslatableError Translation', () => {
    it('should translate simple message', () => {
      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_InvalidInput,
      );

      expect(error.message).toBe('Invalid input provided');
    });

    it('should translate with variables', () => {
      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_MissingTranslationKeyTemplate,
        { stringKey: 'testKey' },
      );

      expect(error.message).toBe('Missing translation key: testKey');
    });

    it('should translate in different language', () => {
      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_NetworkError,
        {},
        'fr',
      );

      expect(error.message).toBe('Erreur de connexion réseau');
    });

    it('should translate template in Spanish', () => {
      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_ComponentNotFoundTemplate,
        { componentId: 'auth' },
        'es',
      );

      expect(error.message).toBe('Componente "auth" no encontrado');
    });
  });

  describe('TranslatableGenericError Translation', () => {
    it('should translate generic error', () => {
      const error = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_InvalidInput,
      );

      expect(error.message).toBe('Invalid input provided');
    });

    it('should translate with variables', () => {
      const error = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_MissingTranslationKeyTemplate,
        { stringKey: 'myKey' },
      );

      expect(error.message).toBe('Missing translation key: myKey');
    });

    it('should translate in different languages', () => {
      const errorEn = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_NotFound,
        {},
        'en-US',
      );

      const errorFr = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_NotFound,
        {},
        'fr',
      );

      const errorEs = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_NotFound,
        {},
        'es',
      );

      expect(errorEn.message).toBe('Resource not found');
      expect(errorFr.message).toBe('Ressource non trouvée');
      expect(errorEs.message).toBe('Recurso no encontrado');
    });
  });

  describe('Error Translation with Engine Context', () => {
    it('should use current language from engine context', () => {
      engine.setLanguage('fr');

      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_InvalidInput,
      );

      expect(error.message).toBe('Entrée invalide fournie');
    });

    it('should override context language with explicit language', () => {
      engine.setLanguage('fr');

      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_InvalidInput,
        {},
        'es',
      );

      expect(error.message).toBe('Entrada inválida proporcionada');
    });

    it('should use admin language in admin context', () => {
      engine.setLanguage('fr');
      engine.setAdminLanguage('en-US');
      engine.switchToAdmin();

      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_InvalidInput,
      );

      expect(error.message).toBe('Invalid input provided');
    });
  });

  describe('Error Translation Edge Cases', () => {
    it('should handle missing translation gracefully', () => {
      const error = new TranslatableError(
        'missing-component',
        'missing-key' as any,
      );

      expect(error.message).toContain('missing-component');
      expect(error.message).toContain('missing-key');
    });

    it('should handle empty variables', () => {
      const error = new TranslatableError(
        CoreI18nComponentId,
        CoreStringKey.Error_MissingTranslationKeyTemplate,
        {},
      );

      expect(error.message).toContain('Missing translation key');
    });

    it('should handle numeric variables', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            countError: 'Found {count} errors',
          },
        },
      });

      const error = new TranslatableError('test', 'countError', { count: 42 });

      expect(error.message).toBe('Found 42 errors');
    });

    it('should handle special characters in variables', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            pathError: "Path '{path}' is invalid",
          },
        },
      });

      const error = new TranslatableError('test', 'pathError', {
        path: '/usr/local/bin',
      });

      expect(error.message).toBe("Path '/usr/local/bin' is invalid");
    });
  });

  describe('Error Translation Performance', () => {
    it('should handle many errors efficiently', () => {
      const errors = [];
      for (let i = 0; i < 100; i++) {
        errors.push(
          new TranslatableError(
            CoreI18nComponentId,
            CoreStringKey.Error_InvalidInput,
          ),
        );
      }

      expect(errors).toHaveLength(100);
      errors.forEach((error) => {
        expect(error.message).toBe('Invalid input provided');
      });
    });

    it('should handle errors in multiple languages efficiently', () => {
      const languages = ['en-US', 'fr', 'es'];
      const errors = [];

      for (let i = 0; i < 30; i++) {
        const lang = languages[i % 3];
        errors.push(
          new TranslatableError(
            CoreI18nComponentId,
            CoreStringKey.Error_NetworkError,
            {},
            lang,
          ),
        );
      }

      expect(errors).toHaveLength(30);
    });
  });
});
