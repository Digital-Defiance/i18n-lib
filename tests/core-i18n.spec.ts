/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  CoreI18nComponentId,
  CoreStringKey,
  createCoreI18nEngine,
  getCoreTranslation,
  LanguageCodes,
  PluginI18nEngine,
  safeCoreTranslation,
} from '../src';

describe('core-i18n', () => {
  let engine: ReturnType<typeof createCoreI18nEngine>;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = createCoreI18nEngine('test-core');
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  describe('getCoreTranslation', () => {
    it('should translate core strings in English', () => {
      const result = getCoreTranslation(
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toBe('Yes');
    });

    it('should translate core strings in French', () => {
      const result = getCoreTranslation(
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.FR,
        'test-core',
      );
      expect(result).toBe('Oui');
    });

    it('should translate core strings in Spanish', () => {
      const result = getCoreTranslation(
        CoreStringKey.Common_Cancel,
        undefined,
        LanguageCodes.ES,
        'test-core',
      );
      expect(result).toBe('Cancelar');
    });

    it('should translate template strings with variables', () => {
      const result = getCoreTranslation(
        CoreStringKey.Error_ComponentNotFoundTemplate,
        { componentId: 'test-component' },
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toBe('Component "test-component" not found');
    });

    it('should translate template strings with multiple variables', () => {
      const result = getCoreTranslation(
        CoreStringKey.Error_StringKeyNotFoundTemplate,
        { componentId: 'my-component', stringKey: 'my-key' },
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toBe(
        'String key "my-key" not found for component "my-component"',
      );
    });

    it('should throw error for invalid string key', () => {
      expect(() => {
        getCoreTranslation(
          'InvalidKey' as CoreStringKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
      }).toThrow();
    });
  });

  describe('safeCoreTranslation', () => {
    describe('bracket formatting', () => {
      it('should return square bracket format for missing translations', () => {
        const result = safeCoreTranslation(
          'NonExistentKey' as CoreStringKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBe('[CoreStringKey.NonExistentKey]');
      });

      it('should use square brackets not curly braces', () => {
        const result = safeCoreTranslation(
          'InvalidKey' as CoreStringKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).not.toContain('{{');
        expect(result).not.toContain('}}');
        expect(result).toMatch(/^\[.*\]$/);
      });

      it('should include CoreStringKey prefix in fallback', () => {
        const result = safeCoreTranslation(
          'MissingKey' as CoreStringKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toContain('CoreStringKey.');
        expect(result).toBe('[CoreStringKey.MissingKey]');
      });

      it('should format fallback as [CoreStringKey.{key}]', () => {
        const testKey = 'TestKey' as CoreStringKey;
        const result = safeCoreTranslation(
          testKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBe(`[CoreStringKey.${testKey}]`);
      });
    });

    describe('successful translations', () => {
      it('should return translation for valid key', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Common_Yes,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBe('Yes');
      });

      it('should handle template strings with variables', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Error_ComponentNotFoundTemplate,
          { componentId: 'test' },
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBe('Component "test" not found');
      });

      it('should work across all supported languages', () => {
        const languages: string[] = [
          LanguageCodes.EN_US,
          LanguageCodes.EN_GB,
          LanguageCodes.FR,
          LanguageCodes.ES,
          LanguageCodes.UK,
        ];

        languages.forEach((lang) => {
          const result = safeCoreTranslation(
            CoreStringKey.Common_Yes,
            undefined,
            lang,
            'test-core',
          );
          expect(result).toBeTruthy();
          expect(result).not.toContain('[');
          expect(result).not.toContain(']');
        });
      });
    });

    describe('error handling', () => {
      it('should not throw for invalid keys', () => {
        expect(() => {
          safeCoreTranslation(
            'CompletelyInvalid' as CoreStringKey,
            undefined,
            LanguageCodes.EN_US,
            'test-core',
          );
        }).not.toThrow();
      });

      it('should return fallback for undefined variables in template', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Error_ComponentNotFoundTemplate,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        // Should still work, just with {componentId} placeholder
        expect(result).toContain('Component');
      });

      it('should handle missing instance gracefully', () => {
        PluginI18nEngine.resetAll();
        const result = safeCoreTranslation(
          CoreStringKey.Common_Yes,
          undefined,
          LanguageCodes.EN_US,
          'nonexistent-instance',
        );
        expect(result).toBe('[CoreStringKey.common_yes]');
      });
    });

    describe('default parameters', () => {
      it('should work without language parameter', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Common_Yes,
          undefined,
          undefined,
          'test-core',
        );
        expect(result).toBeTruthy();
      });

      it('should work without variables parameter', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Common_Cancel,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBe('Cancel');
      });

      it('should work with minimal parameters', () => {
        const result = safeCoreTranslation(
          CoreStringKey.Common_OK,
          undefined,
          undefined,
          'test-core',
        );
        expect(result).toBeTruthy();
      });
    });
  });

  describe('bracket format consistency', () => {
    it('should match engine safeTranslate format', () => {
      const engineResult = engine.safeTranslate(
        CoreI18nComponentId,
        'NonExistent',
      );
      const coreResult = safeCoreTranslation(
        'NonExistent' as CoreStringKey,
        undefined,
        LanguageCodes.EN_US,
        'test-core',
      );

      // Both should use square brackets
      expect(engineResult).toMatch(/^\[.*\]$/);
      expect(coreResult).toMatch(/^\[.*\]$/);
    });

    it('should use componentId.stringKey format', () => {
      const result = safeCoreTranslation(
        'TestKey' as CoreStringKey,
        undefined,
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toMatch(/^\[CoreStringKey\..+\]$/);
    });

    it('should not use double curly braces anywhere', () => {
      const testKeys = ['Invalid1', 'Invalid2', 'NonExistent', 'MissingKey'];

      testKeys.forEach((key) => {
        const result = safeCoreTranslation(
          key as CoreStringKey,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).not.toContain('{{');
        expect(result).not.toContain('}}');
      });
    });
  });

  describe('template variable replacement', () => {
    it('should replace single variable in template', () => {
      const result = safeCoreTranslation(
        CoreStringKey.Error_InvalidContextTemplate,
        { contextKey: 'myContext' },
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toContain('myContext');
      expect(result).not.toContain('{contextKey}');
    });

    it('should replace multiple variables in template', () => {
      const result = safeCoreTranslation(
        CoreStringKey.Error_IncompleteRegistrationTemplate,
        { componentId: 'test-comp', missingCount: 5 },
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toContain('test-comp');
      expect(result).toContain('5');
    });

    it('should handle numeric variables', () => {
      const result = safeCoreTranslation(
        CoreStringKey.Error_ValidationFailedTemplate,
        { componentId: 'validator', errorCount: 42 },
        LanguageCodes.EN_US,
        'test-core',
      );
      expect(result).toContain('validator');
      expect(result).toContain('42');
    });
  });

  describe('all core string keys', () => {
    it('should translate all Common_ keys', () => {
      const commonKeys = Object.values(CoreStringKey).filter((key) =>
        key.startsWith('Common_'),
      );

      commonKeys.forEach((key) => {
        const result = safeCoreTranslation(
          key,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBeTruthy();
        expect(result).not.toContain('[CoreStringKey.');
      });
    });

    it('should translate all Error_ keys', () => {
      const errorKeys = Object.values(CoreStringKey).filter((key) =>
        key.startsWith('Error_'),
      );

      errorKeys.forEach((key) => {
        const variables = key.includes('Template')
          ? {
              componentId: 'test',
              stringKey: 'key',
              language: 'en',
              missingCount: 1,
              errorCount: 1,
              contextKey: 'ctx',
              languageId: 'en',
            }
          : undefined;

        const result = safeCoreTranslation(
          key,
          variables,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBeTruthy();
        expect(result).not.toContain('[CoreStringKey.');
      });
    });

    it('should translate all System_ keys', () => {
      const systemKeys = Object.values(CoreStringKey).filter((key) =>
        key.startsWith('System_'),
      );

      systemKeys.forEach((key) => {
        const result = safeCoreTranslation(
          key,
          undefined,
          LanguageCodes.EN_US,
          'test-core',
        );
        expect(result).toBeTruthy();
        expect(result).not.toContain('[CoreStringKey.');
      });
    });
  });

  describe('createCoreI18nEngine', () => {
    it('should create engine with default instance key', () => {
      PluginI18nEngine.resetAll();
      const defaultEngine = createCoreI18nEngine();
      expect(defaultEngine).toBeDefined();
    });

    it('should create engine with custom instance key', () => {
      const customEngine = createCoreI18nEngine('custom-key');
      expect(customEngine).toBeDefined();
      expect(PluginI18nEngine.hasInstance('custom-key')).toBe(true);
    });

    it('should register core component automatically', () => {
      const testEngine = createCoreI18nEngine('auto-register');
      expect(testEngine.hasComponent(CoreI18nComponentId)).toBe(true);
    });
  });
});
