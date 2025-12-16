/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Comprehensive tests for I18nBuilder
 */

import { I18nBuilder } from '../src/builders/i18n-builder';
import { I18nEngine } from '../src/core/i18n-engine';

describe('I18nBuilder', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('Basic Builder Pattern', () => {
    it('should create builder instance', () => {
      const builder = I18nBuilder.create();
      expect(builder).toBeInstanceOf(I18nBuilder);
    });

    it('should build engine with languages', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });

    it('should throw if no languages provided', () => {
      expect(() => {
        I18nBuilder.create().build();
      }).toThrow('At least one language must be provided');
    });
  });

  describe('Language Configuration', () => {
    it('should set default language', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US' },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .withDefaultLanguage('fr')
        .build();

      expect(engine.getCurrentLanguage()).toBe('fr');
    });

    it('should set fallback language', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .withFallbackLanguage('en-US')
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });

    it('should use first language as default if not specified', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'fr', name: 'French', code: 'fr' },
          { id: 'en-US', name: 'English', code: 'en-US' },
        ])
        .build();

      expect(engine.getCurrentLanguage()).toBe('fr');
    });

    it('should use language marked as default', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'fr', name: 'French', code: 'fr' },
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      expect(engine.getCurrentLanguage()).toBe('en-US');
    });
  });

  describe('Constants Configuration', () => {
    it('should set constants', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({ AppName: 'TestApp', Version: '1.0.0' })
        .build();

      engine.register({
        id: 'test',
        strings: {
          'en-US': { message: 'Welcome to {AppName} v{Version}' },
        },
      });

      expect(engine.translate('test', 'message')).toBe(
        'Welcome to TestApp v1.0.0',
      );
    });

    it('should handle empty constants', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({})
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });
  });

  describe('Validation Configuration', () => {
    it('should set validation options', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withValidation({
          requireCompleteStrings: true,
          allowPartialRegistration: false,
        })
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });

    it('should handle partial validation config', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withValidation({ requireCompleteStrings: true })
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });
  });

  describe('Instance Configuration', () => {
    it('should set instance key', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('custom-instance')
        .build();

      expect(I18nEngine.hasInstance('custom-instance')).toBe(true);
      expect(I18nEngine.getInstance('custom-instance')).toBe(engine);
    });

    it('should register instance by default', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      expect(I18nEngine.hasInstance('default')).toBe(true);
    });

    it('should not register instance if disabled', () => {
      I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('no-register')
        .withRegisterInstance(false)
        .build();

      expect(I18nEngine.hasInstance('no-register')).toBe(false);
    });

    it('should set as default instance', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('my-default')
        .withSetAsDefault(true)
        .build();

      expect(I18nEngine.getInstance()).toBe(engine);
    });

    it('should not set as default if disabled', () => {
      const firstEngine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('first')
        .build();

      I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('second')
        .withSetAsDefault(false)
        .build();

      expect(I18nEngine.getInstance()).toBe(firstEngine);
    });
  });

  describe('Method Chaining', () => {
    it('should support full method chaining', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .withDefaultLanguage('en-US')
        .withFallbackLanguage('en-US')
        .withConstants({ AppName: 'MyApp' })
        .withValidation({ requireCompleteStrings: false })
        .withInstanceKey('chained')
        .withRegisterInstance(true)
        .withSetAsDefault(true)
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
      expect(I18nEngine.getInstance()).toBe(engine);
    });

    it('should allow partial chaining', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({ Version: '1.0.0' })
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });
  });

  describe('Multiple Instances', () => {
    it('should create multiple independent instances', () => {
      const engine1 = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withInstanceKey('instance1')
        .withConstants({ AppName: 'App1' })
        .build();

      const engine2 = I18nBuilder.create()
        .withLanguages([
          { id: 'fr', name: 'French', code: 'fr', isDefault: true },
        ])
        .withInstanceKey('instance2')
        .withConstants({ AppName: 'App2' })
        .build();

      expect(engine1).not.toBe(engine2);
      expect(I18nEngine.getInstance('instance1')).toBe(engine1);
      expect(I18nEngine.getInstance('instance2')).toBe(engine2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single language', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      expect(engine.getLanguages()).toHaveLength(1);
    });

    it('should handle many languages', () => {
      const languages = [];
      for (let i = 0; i < 20; i++) {
        languages.push({
          id: `lang-${i}`,
          name: `Language ${i}`,
          code: `lang-${i}`,
          isDefault: i === 0,
        });
      }

      const engine = I18nBuilder.create().withLanguages(languages).build();

      expect(engine.getLanguages()).toHaveLength(20);
    });

    it('should handle complex constants', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({
          string: 'value',
          number: 42,
          boolean: true,
          nested: { key: 'value' },
        })
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });
  });
});
