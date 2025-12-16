/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  CoreI18nComponentId,
  coreI18nEngine,
  corePluginI18nEngine,
  CoreStringKey,
  getCoreI18nEngine,
  getCorePluginI18nEngine,
  getCorePluginTranslation,
  getCoreTranslation,
  I18nEngine,
  LanguageCodes,
  PluginI18nEngine,
  resetCoreI18nEngine,
  resetCorePluginI18nEngine,
  safeCorePluginTranslation,
  safeCoreTranslation,
} from '../src';

describe('core-i18n coverage', () => {
  describe('PluginI18nEngine (1.x) lazy initialization', () => {
    beforeEach(() => {
      PluginI18nEngine.resetAll();
      resetCorePluginI18nEngine();
    });

    afterEach(() => {
      PluginI18nEngine.resetAll();
      resetCorePluginI18nEngine();
    });

    it('should lazily initialize getCorePluginI18nEngine on first access', () => {
      const engine = getCorePluginI18nEngine();
      expect(engine).toBeDefined();
      expect(engine.hasComponent(CoreI18nComponentId)).toBe(true);
    });

    it('should return same instance on subsequent calls', () => {
      const engine1 = getCorePluginI18nEngine();
      const engine2 = getCorePluginI18nEngine();
      expect(engine1).toBe(engine2);
    });

    it('should re-initialize if instance was cleared', () => {
      const engine1 = getCorePluginI18nEngine();
      PluginI18nEngine.resetAll();
      const engine2 = getCorePluginI18nEngine();
      expect(engine2).toBeDefined();
      expect(engine2.hasComponent(CoreI18nComponentId)).toBe(true);
    });

    it('should work via proxy', () => {
      const result = corePluginI18nEngine.translate(
        CoreI18nComponentId,
        CoreStringKey.Common_Yes,
      );
      expect(result).toBe('Yes');
    });

    it('should handle getCorePluginTranslation without instanceKey', () => {
      const result = getCorePluginTranslation(
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.EN_US,
      );
      expect(result).toBe('Yes');
    });

    it('should handle safeCorePluginTranslation fallback', () => {
      const result = safeCorePluginTranslation(
        'InvalidKey' as CoreStringKey,
        undefined,
        LanguageCodes.EN_US,
      );
      expect(result).toBe('[CoreStringKey.InvalidKey]');
    });
  });

  describe('I18nEngine (2.x) lazy initialization', () => {
    beforeEach(() => {
      I18nEngine.resetAll();
      resetCoreI18nEngine();
    });

    afterEach(() => {
      I18nEngine.resetAll();
      resetCoreI18nEngine();
    });

    it('should lazily initialize getCoreI18nEngine on first access', () => {
      const engine = getCoreI18nEngine();
      expect(engine).toBeDefined();
      expect(engine.hasComponent(CoreI18nComponentId)).toBe(true);
    });

    it('should return same instance on subsequent calls', () => {
      const engine1 = getCoreI18nEngine();
      const engine2 = getCoreI18nEngine();
      expect(engine1).toBe(engine2);
    });

    it('should re-initialize if instance was cleared', () => {
      const engine1 = getCoreI18nEngine();
      I18nEngine.resetAll();
      const engine2 = getCoreI18nEngine();
      expect(engine2).toBeDefined();
      expect(engine2.hasComponent(CoreI18nComponentId)).toBe(true);
    });

    it('should use existing instance if available', () => {
      const engine1 = getCoreI18nEngine();
      const engine2 = getCoreI18nEngine();
      expect(engine1).toBe(engine2);
    });

    it('should work via proxy', () => {
      const result = coreI18nEngine.translate(
        CoreI18nComponentId,
        CoreStringKey.Common_Yes,
      );
      expect(result).toBe('Yes');
    });

    it('should handle getCoreTranslation', () => {
      const result = getCoreTranslation(
        CoreStringKey.Common_Yes,
        undefined,
        LanguageCodes.EN_US,
      );
      expect(result).toBe('Yes');
    });

    it('should handle safeCoreTranslation fallback', () => {
      const result = safeCoreTranslation(
        'InvalidKey' as CoreStringKey,
        undefined,
        LanguageCodes.EN_US,
      );
      expect(result).toMatch(/\[.*InvalidKey.*\]/);
    });
  });
});
