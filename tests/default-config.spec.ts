import {
  DefaultLanguageCode,
  DefaultLanguageCodes,
  DefaultStringKey,
  Language,
  StringKey,
  getDefaultI18nEngine,
  getI18nEngine,
} from '../src/default-config';
import { LanguageCodes } from '../src';
import { I18nEngine } from '../src/i18n-engine';

describe('DefaultConfig', () => {
  beforeEach(() => {
    I18nEngine.clearInstances();
  });

  describe('Type Aliases', () => {
    it('should export correct type aliases', () => {
      expect(DefaultStringKey.Common_Test).toBe('common_test');
      expect(LanguageCodes.EN_US).toBe('en-US');
      expect(DefaultLanguageCodes[LanguageCodes.EN_US]).toBe('en-US');
    });
  });

  describe('Global Interface Extension', () => {
    it('should allow StringKey to be used as DefaultStringKey', () => {
      const key: StringKey = DefaultStringKey.Common_Test;
      expect(key).toBe('common_test');
    });

    it('should allow Language to be used as DefaultLanguage', () => {
      const lang: Language = LanguageCodes.EN_US;
      expect(lang).toBe('en-US');
    });
  });

  describe('getDefaultI18nEngine', () => {
    it('should create engine with default configuration', () => {
      const engine = getDefaultI18nEngine({});
      expect(engine).toBeInstanceOf(I18nEngine);
      expect(engine.config.defaultLanguage).toBe(LanguageCodes.EN_US);
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
