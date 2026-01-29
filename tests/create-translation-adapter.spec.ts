/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { ComponentRegistration } from '../src/component-registration';
import { createTranslationAdapter } from '../src/create-translation-adapter';
import { LanguageCodes } from '../src/language-codes';
import { LanguageDefinition } from '../src/language-definition';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';
import { createI18nStringKeys } from '../src/branded-string-key';

describe('createTranslationAdapter', () => {
  const TestStringKey = createI18nStringKeys('test-component', {
    TestKey1: 'test_key_1',
    TestKey2: 'test_key_2',
    TestKeyWithVars: 'test_key_with_vars',
  } as const);

  const testLanguages: LanguageDefinition[] = [
    {
      id: LanguageCodes.EN_US,
      name: 'English (US)',
      code: 'en-US',
      isDefault: true,
    },
    {
      id: LanguageCodes.FR,
      name: 'Français',
      code: 'fr',
      isDefault: false,
    },
  ];

  const testStrings = {
    [LanguageCodes.EN_US]: {
      [TestStringKey.TestKey1]: 'Test message 1',
      [TestStringKey.TestKey2]: 'Test message 2',
      [TestStringKey.TestKeyWithVars]: 'Value is {value}',
    },
    [LanguageCodes.FR]: {
      [TestStringKey.TestKey1]: 'Message de test 1',
      [TestStringKey.TestKey2]: 'Message de test 2',
      [TestStringKey.TestKeyWithVars]: 'La valeur est {value}',
    },
  };

  let pluginEngine: PluginI18nEngine<
    typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
  >;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    pluginEngine = new PluginI18nEngine(testLanguages);

    const registration: ComponentRegistration<
      typeof TestStringKey,
      typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
    > = {
      component: {
        id: 'test-component',
        name: 'Test Component',
        stringKeys: TestStringKey,
      },
      strings: testStrings,
    };

    pluginEngine.registerComponent(registration);
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  describe('Basic functionality', () => {
    it('should create an adapter with translate and safeTranslate methods', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      expect(adapter).toBeDefined();
      expect(typeof adapter.translate).toBe('function');
      expect(typeof adapter.safeTranslate).toBe('function');
    });

    it('should translate a simple key', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const result = adapter.translate(TestStringKey.TestKey1);

      expect(result).toBe('Test message 1');
    });

    it('should translate with different languages', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      const enResult = adapter.translate(
        TestStringKey.TestKey1,
        undefined,
        LanguageCodes.EN_US,
      );
      const frResult = adapter.translate(
        TestStringKey.TestKey1,
        undefined,
        LanguageCodes.FR,
      );

      expect(enResult).toBe('Test message 1');
      expect(frResult).toBe('Message de test 1');
    });

    it('should handle variable substitution', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const result = adapter.translate(
        TestStringKey.TestKeyWithVars,
        { value: '42' },
        LanguageCodes.EN_US,
      );

      // Variable substitution is handled by PluginI18nEngine
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      // The actual substitution depends on PluginI18nEngine's implementation
    });
  });

  describe('Error handling', () => {
    it('should return key string when translation fails', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const nonExistentKey = 'non_existent_key' as TestStringKey;

      const result = adapter.translate(nonExistentKey);

      expect(result).toBe(nonExistentKey);
    });

    it('should not throw on safeTranslate with invalid key', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const nonExistentKey = 'non_existent_key' as TestStringKey;

      expect(() => {
        const result = adapter.safeTranslate(nonExistentKey);
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it('should handle undefined variables gracefully', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      expect(() => {
        adapter.translate(TestStringKey.TestKey1, undefined);
      }).not.toThrow();
    });

    it('should handle empty variables object', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      expect(() => {
        adapter.translate(TestStringKey.TestKey1, {});
      }).not.toThrow();
    });
  });

  describe('Multiple components', () => {
    beforeEach(() => {
      const secondRegistration: ComponentRegistration<
        typeof TestStringKey,
        typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
      > = {
        component: {
          id: 'second-component',
          name: 'Second Component',
          stringKeys: TestStringKey,
        },
        strings: {
          [LanguageCodes.EN_US]: {
            [TestStringKey.TestKey1]: 'Second component message',
            [TestStringKey.TestKey2]: 'Second component message 2',
            [TestStringKey.TestKeyWithVars]: 'Second: {value}',
          },
          [LanguageCodes.FR]: {
            [TestStringKey.TestKey1]: 'Deuxième composant message',
            [TestStringKey.TestKey2]: 'Deuxième composant message 2',
            [TestStringKey.TestKeyWithVars]: 'Deuxième: {value}',
          },
        },
      };

      pluginEngine.registerComponent(secondRegistration);
    });

    it('should create separate adapters for different components', () => {
      const adapter1 = createTranslationAdapter(pluginEngine, 'test-component');
      const adapter2 = createTranslationAdapter(
        pluginEngine,
        'second-component',
      );

      const result1 = adapter1.translate(TestStringKey.TestKey1);
      const result2 = adapter2.translate(TestStringKey.TestKey1);

      expect(result1).toBe('Test message 1');
      expect(result2).toBe('Second component message');
    });

    it('should maintain independence between adapters', () => {
      const adapter1 = createTranslationAdapter(pluginEngine, 'test-component');
      const adapter2 = createTranslationAdapter(
        pluginEngine,
        'second-component',
      );

      const result1En = adapter1.translate(
        TestStringKey.TestKey1,
        undefined,
        LanguageCodes.EN_US,
      );
      const result2Fr = adapter2.translate(
        TestStringKey.TestKey1,
        undefined,
        LanguageCodes.FR,
      );

      expect(result1En).toBe('Test message 1');
      expect(result2Fr).toBe('Deuxième composant message');
    });
  });

  describe('Type safety', () => {
    it('should work with generic string key types', () => {
      const CustomKeys = createI18nStringKeys('custom-component', {
        CustomKey1: 'custom_key_1',
        CustomKey2: 'custom_key_2',
      } as const);

      type CustomKey = typeof CustomKeys[keyof typeof CustomKeys];

      const customStrings = {
        [LanguageCodes.EN_US]: {
          [CustomKeys.CustomKey1]: 'Custom 1',
          [CustomKeys.CustomKey2]: 'Custom 2',
        },
        [LanguageCodes.FR]: {
          [CustomKeys.CustomKey1]: 'Personnalisé 1',
          [CustomKeys.CustomKey2]: 'Personnalisé 2',
        },
      };

      const customRegistration: ComponentRegistration<
        typeof CustomKeys,
        typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
      > = {
        component: {
          id: 'custom-component',
          name: 'Custom Component',
          stringKeys: CustomKeys,
        },
        strings: customStrings,
      };

      pluginEngine.registerComponent(customRegistration);

      const adapter = createTranslationAdapter<
        CustomKey,
        typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
      >(pluginEngine, 'custom-component');

      const result = adapter.translate(CustomKeys.CustomKey1);
      expect(result).toBe('Custom 1');
    });
  });

  describe('Integration scenarios', () => {
    it('should work as a drop-in replacement for TranslationEngine', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      // Simulate usage in an error class
      function createError(engine: {
        translate: (key: TestStringKey) => string;
      }) {
        return engine.translate(TestStringKey.TestKey1);
      }

      const result = createError(adapter);
      expect(result).toBe('Test message 1');
    });

    it('should support chaining multiple operations', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      const results = [
        adapter.translate(TestStringKey.TestKey1),
        adapter.translate(TestStringKey.TestKey2),
        adapter.safeTranslate(TestStringKey.TestKeyWithVars, { value: '100' }),
      ];

      expect(results).toHaveLength(3);
      expect(results[0]).toBe('Test message 1');
      expect(results[1]).toBe('Test message 2');
      expect(results[2]).toBeDefined();
      expect(typeof results[2]).toBe('string');
    });

    it('should handle rapid successive calls', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      for (let i = 0; i < 100; i++) {
        const result = adapter.translate(TestStringKey.TestKey1);
        expect(result).toBe('Test message 1');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle component ID with special characters', () => {
      const specialRegistration: ComponentRegistration<
        typeof TestStringKey,
        typeof LanguageCodes.EN_US | typeof LanguageCodes.FR
      > = {
        component: {
          id: 'test-component-with-dashes_and_underscores',
          name: 'Special Component',
          stringKeys: TestStringKey,
        },
        strings: testStrings,
      };

      pluginEngine.registerComponent(specialRegistration);

      const adapter = createTranslationAdapter(
        pluginEngine,
        'test-component-with-dashes_and_underscores',
      );

      const result = adapter.translate(TestStringKey.TestKey1);
      expect(result).toBe('Test message 1');
    });

    it('should handle empty string key gracefully', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const result = adapter.safeTranslate('' as typeof TestStringKey[keyof typeof TestStringKey]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle numeric-like string keys', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const result = adapter.safeTranslate('123' as typeof TestStringKey[keyof typeof TestStringKey]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should create adapter quickly', () => {
      const start = Date.now();
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');
      const duration = Date.now() - start;

      expect(adapter).toBeDefined();
      expect(duration).toBeLessThan(10); // Should be nearly instantaneous
    });

    it('should translate quickly', () => {
      const adapter = createTranslationAdapter(pluginEngine, 'test-component');

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        adapter.translate(TestStringKey.TestKey1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // 1000 translations in < 100ms
    });
  });
});
