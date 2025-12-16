/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  CoreI18nComponentId,
  CoreStringKey,
  LanguageCodes,
  TranslatableGenericError,
} from '../src';
import { I18nEngine } from '../src/core/i18n-engine';

describe('TranslatableGenericError', () => {
  enum TestStringKey {
    UserNotFound = 'userNotFound',
    InvalidCredentials = 'invalidCredentials',
    AccountLocked = 'accountLocked',
  }

  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = new I18nEngine(
      [
        { id: 'en', name: 'English', code: 'en', isDefault: true },
        { id: 'fr', name: 'French', code: 'fr' },
      ],
      {},
      { instanceKey: 'test-errors' },
    );

    engine.register({
      id: 'test-errors',
      name: 'Test Errors',
      stringKeys: Object.values(TestStringKey),
      strings: {
        en: {
          [TestStringKey.UserNotFound]: 'User "{username}" not found',
          [TestStringKey.InvalidCredentials]: 'Invalid credentials provided',
          [TestStringKey.AccountLocked]: 'Account locked until {unlockTime}',
        },
        fr: {
          [TestStringKey.UserNotFound]: 'Utilisateur "{username}" introuvable',
          [TestStringKey.InvalidCredentials]: 'Identifiants invalides fournis',
          [TestStringKey.AccountLocked]:
            "Compte verrouillé jusqu'à {unlockTime}",
        },
      },
    });
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('constructor', () => {
    it('should create error with translated message', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toBe('Invalid credentials provided');
      expect(error.stringKey).toBe(TestStringKey.InvalidCredentials);
      expect(error.componentId).toBe('test-errors');
    });

    it('should translate with variables', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.UserNotFound,
        { username: 'john_doe' },
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toContain('User');
      expect(error.message).toContain('not found');
      expect(error.variables).toEqual({ username: 'john_doe' });
    });

    it('should translate in different languages', () => {
      const errorEn = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      const errorFr = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'fr',
        undefined,
        'test-errors',
      );

      expect(errorEn.message).toBe('Invalid credentials provided');
      expect(errorFr.message).toBe('Identifiants invalides fournis');
    });

    it('should store metadata', () => {
      const metadata = { userId: 123, attemptCount: 3 };
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.AccountLocked,
        { unlockTime: '2025-01-01' },
        'en',
        metadata,
        'test-errors',
      );

      expect(error.metadata).toEqual(metadata);
    });

    it('should use fallback format for missing component', () => {
      const error = new TranslatableGenericError(
        'nonexistent',
        'someKey',
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toBe('[nonexistent.someKey]');
    });

    it('should use fallback format for missing string key', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        'nonexistentKey',
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toBe('[test-errors.nonexistentKey]');
    });

    it('should use fallback format when engine not found', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.UserNotFound,
        undefined,
        'en',
        undefined,
        'nonexistent-engine',
      );

      expect(error.message).toBe('[test-errors.userNotFound]');
    });
  });

  describe('withEngine static method', () => {
    it('should create error with explicit engine', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
      );

      expect(error.message).toBe('Invalid credentials provided');
      expect(error instanceof TranslatableGenericError).toBe(true);
    });

    it('should handle variables with explicit engine', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'test-errors',
        TestStringKey.UserNotFound,
        { username: 'alice' },
        'en',
      );

      expect(error.message).toContain('User');
      expect(error.message).toContain('not found');
    });

    it('should use safeTranslate for missing keys', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'test-errors',
        'missingKey' as TestStringKey,
        undefined,
        'en',
      );

      expect(error.message).toMatch(/^\[test-errors\..*\]$/);
    });
  });

  describe('retranslate method', () => {
    it('should retranslate error in different language', () => {
      const error = new TranslatableGenericError<TestStringKey, 'en' | 'fr'>(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toBe('Invalid credentials provided');

      const frenchMessage = error.retranslate('fr', 'test-errors');
      expect(frenchMessage).toBe('Identifiants invalides fournis');
    });

    it('should retranslate with variables', () => {
      const error = new TranslatableGenericError<TestStringKey, 'en' | 'fr'>(
        'test-errors',
        TestStringKey.UserNotFound,
        { username: 'bob' },
        'en',
        undefined,
        'test-errors',
      );

      const frenchMessage = error.retranslate('fr', 'test-errors');
      expect(frenchMessage).toContain('Utilisateur');
      expect(frenchMessage).toContain('introuvable');
    });

    it('should return fallback for missing engine', () => {
      const error = new TranslatableGenericError<TestStringKey, 'en' | 'fr'>(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      const result = error.retranslate('fr', 'nonexistent-engine');
      expect(result).toBe('[test-errors.invalidCredentials]');
    });
  });

  describe('error properties', () => {
    it('should have correct name', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.name).toBe('TranslatableGenericError');
    });

    it('should be instanceof Error', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error instanceof Error).toBe(true);
    });

    it('should be instanceof TranslatableGenericError', () => {
      const error = new TranslatableGenericError(
        'test-errors',
        TestStringKey.InvalidCredentials,
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error instanceof TranslatableGenericError).toBe(true);
    });

    it('should be throwable', () => {
      expect(() => {
        throw new TranslatableGenericError(
          'test-errors',
          TestStringKey.InvalidCredentials,
          undefined,
          'en',
          undefined,
          'test-errors',
        );
      }).toThrow('Invalid credentials provided');
    });

    it('should be catchable', () => {
      try {
        throw new TranslatableGenericError(
          'test-errors',
          TestStringKey.UserNotFound,
          { username: 'test' },
          'en',
          undefined,
          'test-errors',
        );
      } catch (error) {
        expect(error instanceof TranslatableGenericError).toBe(true);
        expect((error as TranslatableGenericError).stringKey).toBe(
          TestStringKey.UserNotFound,
        );
      }
    });
  });

  describe('integration with core strings', () => {
    let coreEngine: I18nEngine;

    beforeEach(() => {
      coreEngine = new I18nEngine(
        [
          {
            id: LanguageCodes.EN_US,
            name: 'English (US)',
            code: 'en-US',
            isDefault: true,
          },
          { id: LanguageCodes.FR, name: 'Français', code: 'fr' },
        ],
        {},
        { instanceKey: 'core-errors' },
      );

      coreEngine.register({
        id: CoreI18nComponentId,
        name: 'Core',
        stringKeys: Object.values(CoreStringKey),
        strings: {
          [LanguageCodes.EN_US]: {
            [CoreStringKey.Common_Yes]: 'Yes',
            [CoreStringKey.Error_AccessDenied]: 'Access denied',
            [CoreStringKey.Error_ComponentNotFoundTemplate]:
              'Component "{componentId}" not found',
          },
          [LanguageCodes.FR]: {
            [CoreStringKey.Common_Yes]: 'Oui',
            [CoreStringKey.Error_AccessDenied]: 'Accès refusé',
            [CoreStringKey.Error_ComponentNotFoundTemplate]:
              'Composant "{componentId}" non trouvé',
          },
        },
      });
    });

    it('should work with core component', () => {
      const error = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_AccessDenied,
        undefined,
        LanguageCodes.EN_US,
        undefined,
        'core-errors',
      );

      expect(error.message).toBe('Access denied');
    });

    it('should work with core template strings', () => {
      const error = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Error_ComponentNotFoundTemplate,
        { componentId: 'my-component' },
        LanguageCodes.EN_US,
        undefined,
        'core-errors',
      );

      expect(error.message).toBe('Component "my-component" not found');
    });

    it('should translate core strings in multiple languages', () => {
      const errorEn = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.EN_US,
        undefined,
        'core-errors',
      );

      const errorFr = new TranslatableGenericError(
        CoreI18nComponentId,
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.FR,
        undefined,
        'core-errors',
      );

      expect(errorEn.message).toBe('Yes');
      expect(errorFr.message).toBe('Oui');
    });
  });

  describe('bracket format consistency', () => {
    it('should use square brackets for fallback', () => {
      const error = new TranslatableGenericError(
        'missing',
        'key',
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      expect(error.message).toMatch(/^\[.*\]$/);
      expect(error.message).not.toContain('{{');
      expect(error.message).not.toContain('}}');
    });

    it('should match engine safeTranslate format', () => {
      const error = new TranslatableGenericError(
        'nonexistent',
        'key',
        undefined,
        'en',
        undefined,
        'test-errors',
      );

      const engineResult = engine.safeTranslate('nonexistent', 'key');

      expect(error.message).toBe(engineResult);
      expect(error.message).toBe('[nonexistent.key]');
    });
  });
});
