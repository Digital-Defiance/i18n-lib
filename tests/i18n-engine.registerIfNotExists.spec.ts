/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { createDefaultLanguages, I18nEngine, LanguageCodes } from '../src';

describe('I18nEngine.registerIfNotExists', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  describe('static registerIfNotExists', () => {
    it('should create instance if it does not exist', () => {
      const engine = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );

      expect(engine).toBeDefined();
      expect(I18nEngine.hasInstance('test')).toBe(true);
    });

    it('should return existing instance if it already exists', () => {
      const engine1 = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );
      const engine2 = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );

      expect(engine1).toBe(engine2);
    });

    it('should not throw error when called multiple times', () => {
      expect(() => {
        I18nEngine.registerIfNotExists('test', createDefaultLanguages());
        I18nEngine.registerIfNotExists('test', createDefaultLanguages());
        I18nEngine.registerIfNotExists('test', createDefaultLanguages());
      }).not.toThrow();
    });

    it('should work with default instance key', () => {
      const engine1 = I18nEngine.registerIfNotExists(
        'default',
        createDefaultLanguages(),
      );
      const engine2 = I18nEngine.registerIfNotExists(
        'default',
        createDefaultLanguages(),
      );

      expect(engine1).toBe(engine2);
      expect(I18nEngine.hasInstance('default')).toBe(true);
    });
  });

  describe('instance registerIfNotExists', () => {
    it('should register component if it does not exist', () => {
      const engine = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );

      const result = engine.registerIfNotExists({
        id: 'test-component',
        strings: {
          [LanguageCodes.EN_US]: {
            'test.key': 'Test Value',
          },
        },
      });

      expect(result.isValid).toBe(true);
      expect(engine.hasComponent('test-component')).toBe(true);
    });

    it('should not register component if it already exists', () => {
      const engine = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );

      engine.registerIfNotExists({
        id: 'test-component',
        strings: {
          [LanguageCodes.EN_US]: {
            'test.key': 'Original Value',
          },
        },
      });

      const result = engine.registerIfNotExists({
        id: 'test-component',
        strings: {
          [LanguageCodes.EN_US]: {
            'test.key': 'New Value',
          },
        },
      });

      expect(result.isValid).toBe(true);
      expect(engine.translate('test-component', 'test.key')).toBe(
        'Original Value',
      );
    });

    it('should not throw error when registering same component multiple times', () => {
      const engine = I18nEngine.registerIfNotExists(
        'test',
        createDefaultLanguages(),
      );

      const config = {
        id: 'test-component',
        strings: {
          [LanguageCodes.EN_US]: {
            'test.key': 'Test Value',
          },
        },
      };

      expect(() => {
        engine.registerIfNotExists(config);
        engine.registerIfNotExists(config);
        engine.registerIfNotExists(config);
      }).not.toThrow();
    });
  });

  describe('integration with multiple modules', () => {
    it('should handle multiple modules initializing the same instance', () => {
      // Simulate module 1 initializing
      const engine1 = I18nEngine.registerIfNotExists(
        'default',
        createDefaultLanguages(),
      );
      engine1.registerIfNotExists({
        id: 'module1',
        strings: {
          [LanguageCodes.EN_US]: {
            'module1.key': 'Module 1 Value',
          },
        },
      });

      // Simulate module 2 initializing (should get same instance)
      const engine2 = I18nEngine.registerIfNotExists(
        'default',
        createDefaultLanguages(),
      );
      engine2.registerIfNotExists({
        id: 'module2',
        strings: {
          [LanguageCodes.EN_US]: {
            'module2.key': 'Module 2 Value',
          },
        },
      });

      expect(engine1).toBe(engine2);
      expect(engine1.hasComponent('module1')).toBe(true);
      expect(engine1.hasComponent('module2')).toBe(true);
      expect(engine1.translate('module1', 'module1.key')).toBe(
        'Module 1 Value',
      );
      expect(engine1.translate('module2', 'module2.key')).toBe(
        'Module 2 Value',
      );
    });
  });
});
