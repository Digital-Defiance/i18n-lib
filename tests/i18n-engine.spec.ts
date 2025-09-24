import { I18nConfig, I18nEngine, createContext } from '../src';

enum TestStrings {
  Simple = 'simple',
  Template = 'template',
}

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
}

enum TestStatus {
  Active = 'active',
  Inactive = 'inactive',
}

describe('I18nEngine', () => {
  let i18n: I18nEngine<TestStrings, TestLanguages>;
  const testConfig: I18nConfig<TestStrings, TestLanguages> = {
    strings: {
      [TestLanguages.English]: {
        [TestStrings.Simple]: 'Hello',
        [TestStrings.Template]: 'Hello, {name}!',
      },
      [TestLanguages.Spanish]: {
        [TestStrings.Simple]: 'Hola',
        [TestStrings.Template]: '¡Hola, {name}!',
      },
    },
    stringNames: Object.values(TestStrings),
    defaultLanguage: TestLanguages.English,
    defaultContext: 'admin',
    languageCodes: {
      [TestLanguages.English]: 'en',
      [TestLanguages.Spanish]: 'es',
    },
    languages: Object.values(TestLanguages),
  };

  beforeEach(() => {
    // Clear any existing instances before each test
    I18nEngine.clearInstances();
    i18n = new I18nEngine(testConfig);
  });

  afterEach(() => {
    // Clean up after each test
    I18nEngine.clearInstances();
  });

  describe('translate', () => {
    it('should translate simple strings', () => {
      const result = i18n.translate(TestStrings.Simple);
      expect(result).toBe('Hello');
    });

    it('should translate with variables', () => {
      const result = i18n.translate(TestStrings.Template, {
        name: 'John',
      });
      expect(result).toBe('Hello, John!');
    });

    it('should use specified language', () => {
      const result = i18n.translate(
        TestStrings.Simple,
        undefined,
        TestLanguages.Spanish,
      );
      expect(result).toBe('Hola');
    });

    it('should fallback for missing strings', () => {
      const result = i18n.translate('missing' as TestStrings);
      expect(result).toBe('missing');
    });
  });

  describe('translateEnum', () => {
    beforeEach(() => {
      i18n.registerEnum(
        TestStatus,
        {
          [TestLanguages.English]: {
            [TestStatus.Active]: 'Active',
            [TestStatus.Inactive]: 'Inactive',
          },
          [TestLanguages.Spanish]: {
            [TestStatus.Active]: 'Activo',
            [TestStatus.Inactive]: 'Inactivo',
          },
        },
        'TestStatus',
      );
    });

    it('should translate enum values', () => {
      const result = i18n.translateEnum(
        TestStatus,
        TestStatus.Active,
        TestLanguages.English,
      );
      expect(result).toBe('Active');
    });
  });

  describe('language codes', () => {
    it('should get language code', () => {
      const result = i18n.getLanguageCode(TestLanguages.English);
      expect(result).toBe('en');
    });

    it('should get language from code', () => {
      const result = i18n.getLanguageFromCode('es');
      expect(result).toBe(TestLanguages.Spanish);
    });

    it('should return undefined for unknown code', () => {
      const result = i18n.getLanguageFromCode('unknown');
      expect(result).toBeUndefined();
    });

    it('should get all language codes', () => {
      const result = i18n.getAllLanguageCodes();
      expect(result).toEqual({
        [TestLanguages.English]: 'en',
        [TestLanguages.Spanish]: 'es',
      });
    });

    it('should fallback to language name if no code exists', () => {
      const configWithoutCodes = {
        ...testConfig,
        languageCodes: {},
      };
      I18nEngine.clearInstances();
      const engine = new I18nEngine(configWithoutCodes);
      
      const result = engine.getLanguageCode(TestLanguages.English);
      expect(result).toBe(TestLanguages.English);
    });
  });

  describe('context management', () => {
    it('should get current context', () => {
      const context = i18n.context;
      expect(context.language).toBe(TestLanguages.English);
      expect(context.adminLanguage).toBe(TestLanguages.English);
      expect(context.currentContext).toBe('admin');
    });

    it('should set context properties', () => {
      i18n.context = {
        language: TestLanguages.Spanish,
        currentContext: 'user',
      };
      
      expect(i18n.context.language).toBe(TestLanguages.Spanish);
      expect(i18n.context.currentContext).toBe('user');
      expect(i18n.context.adminLanguage).toBe(TestLanguages.English);
    });
  });

  describe('static methods', () => {
    it('should get instance by key', () => {
      const instance = I18nEngine.getInstance();
      expect(instance).toBe(i18n);
    });

    it('should throw error for non-existent instance', () => {
      expect(() => {
        I18nEngine.getInstance('nonexistent');
      }).toThrow();
    });
  });

  describe('instance management', () => {
    it('should prevent duplicate instances with same key', () => {
      expect(() => {
        new I18nEngine(testConfig);
      }).toThrow();
    });

    it('should allow instances with different keys', () => {
      expect(() => {
        new I18nEngine(testConfig, 'custom-key');
      }).not.toThrow();
    });
  });
});
