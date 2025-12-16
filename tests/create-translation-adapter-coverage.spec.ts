/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { createDefaultLanguages } from '../src/core-i18n';
import { createTranslationAdapter } from '../src/create-translation-adapter';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';

enum TestStringKey {
  Key1 = 'key1',
  Key2 = 'key2',
}

describe('createTranslationAdapter coverage', () => {
  let engine: PluginI18nEngine<string>;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = PluginI18nEngine.createInstance('test', createDefaultLanguages());
    engine.registerComponent({
      component: {
        id: 'test-comp',
        name: 'Test',
        stringKeys: Object.values(TestStringKey),
      },
      strings: {
        'en-US': {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        'en-GB': {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        fr: {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        es: {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        de: {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        'zh-CN': {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        ja: {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
        uk: {
          [TestStringKey.Key1]: 'Value 1',
          [TestStringKey.Key2]: 'Value 2',
        },
      },
    });
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  describe('translate method', () => {
    it('should handle 4-argument call (full TranslationEngine interface)', () => {
      const adapter = createTranslationAdapter(engine, 'test-comp');
      const result = adapter.translate(
        'test-comp',
        TestStringKey.Key1,
        {},
        'en-US',
      );
      expect(result).toBe('Value 1');
    });

    it('should handle 3-argument call with simplified interface', () => {
      const adapter = createTranslationAdapter(engine, 'test-comp');
      const result = adapter.translate(TestStringKey.Key1, {}, 'en-US');
      expect(result).toBe('Value 1');
    });

    it('should catch errors and return key as string', () => {
      const adapter = createTranslationAdapter(engine, 'invalid-comp');
      const result = adapter.translate(TestStringKey.Key1);
      expect(result).toBe(TestStringKey.Key1);
    });
  });

  describe('safeTranslate method', () => {
    it('should handle 4-argument call (full TranslationEngine interface)', () => {
      const adapter = createTranslationAdapter(engine, 'test-comp');
      const result = adapter.safeTranslate(
        'test-comp',
        TestStringKey.Key1,
        {},
        'en-US',
      );
      expect(result).toBe('Value 1');
    });

    it('should handle 3-argument call with simplified interface', () => {
      const adapter = createTranslationAdapter(engine, 'test-comp');
      const result = adapter.safeTranslate(TestStringKey.Key1, {}, 'en-US');
      expect(result).toBe('Value 1');
    });

    it('should not throw on invalid component', () => {
      const adapter = createTranslationAdapter(engine, 'invalid-comp');
      expect(() => adapter.safeTranslate(TestStringKey.Key1)).not.toThrow();
    });
  });
});
