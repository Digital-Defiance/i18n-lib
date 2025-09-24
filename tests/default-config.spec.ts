import { DefaultStringKey, DefaultLanguage, DefaultLanguageCodes, StringKey, Language, getI18nEngine, getDefaultI18nEngine } from '../src/default-config';
import { I18nEngine } from '../src/i18n-engine';

describe('DefaultConfig', () => {
  beforeEach(() => {
    I18nEngine.clearInstances();
  });

  describe('Type Aliases', () => {
    it('should export correct type aliases', () => {
      expect(DefaultStringKey.Common_Test).toBe('common_test');
      expect(DefaultLanguage.EnglishUS).toBe('English (US)');
      expect(DefaultLanguageCodes[DefaultLanguage.EnglishUS]).toBe('en');
    });
  });

  describe('Global Interface Extension', () => {
    it('should allow StringKey to be used as DefaultStringKey', () => {
      const key: StringKey = DefaultStringKey.Common_Test;
      expect(key).toBe('common_test');
    });

    it('should allow Language to be used as DefaultLanguage', () => {
      const lang: Language = DefaultLanguage.EnglishUS;
      expect(lang).toBe('English (US)');
    });
  });

  describe('getDefaultI18nEngine', () => {
    it('should create engine with default configuration', () => {
      const engine = getDefaultI18nEngine({});
      expect(engine).toBeInstanceOf(I18nEngine);
      expect(engine.config.defaultLanguage).toBe(DefaultLanguage.EnglishUS);
    });

    it('should use provided constants', () => {
      const constants = { TEST_CONST: 'test' };
      const engine = getDefaultI18nEngine(constants);
      expect(engine.config.constants).toBe(constants);
      expect(engine.translate(DefaultStringKey.Common_Test)).toBe('Test');
    });
  });

  describe('getI18nEngine', () => {
    it('should return singleton instance', () => {
      const engine1 = getDefaultI18nEngine({});
      const engine2 = getI18nEngine();
      expect(engine1).toBe(engine2);
    });
  });
});