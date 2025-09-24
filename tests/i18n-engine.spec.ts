import { CurrencyCode, I18nConfig, I18nEngine, Timezone } from '../src';

enum TestStrings {
  Simple = 'simple',
  Template = 'template',
}

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
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
      [TestLanguages.French]: {
        [TestStrings.Simple]: 'Bonjour',
        [TestStrings.Template]: 'Bonjour, {name}!',
      },
    },
    stringNames: Object.values(TestStrings),
    defaultLanguage: TestLanguages.English,
    defaultCurrencyCode: new CurrencyCode('USD'),
    defaultTranslationContext: 'admin',
    languageCodes: {
      [TestLanguages.English]: 'en',
      [TestLanguages.Spanish]: 'es',
      [TestLanguages.French]: 'fr',
    },
    languages: Object.values(TestLanguages),
    timezone: new Timezone('UTC'),
    adminTimezone: new Timezone('UTC'),
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

    it('should always return a string type', () => {
      const result = i18n.translate(TestStrings.Simple);
      expect(typeof result).toBe('string');
      expect(result).not.toBe('[object Object]');
    });

    it('should handle object variables by converting to string', () => {
      const result = i18n.translate(TestStrings.Template, {
        name: { toString: () => 'ObjectName' } as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello, ObjectName!');
    });

    it('should handle null/undefined variables gracefully', () => {
      const result = i18n.translate(TestStrings.Template, {
        name: null as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello, null!');
    });

    it('should convert non-string translation results to strings', () => {
      // Mock a scenario where getString might return a non-string
      const originalGetString = (i18n as any).getString;
      (i18n as any).getString = jest.fn().mockReturnValue({ toString: () => 'MockedString' });
      
      const result = i18n.translate(TestStrings.Simple);
      expect(typeof result).toBe('string');
      expect(result).toBe('MockedString');
      
      // Restore original method
      (i18n as any).getString = originalGetString;
    });

    it('should handle objects without custom toString as [object Object]', () => {
      // Mock a scenario where getString returns a plain object
      const originalGetString = (i18n as any).getString;
      (i18n as any).getString = jest.fn().mockReturnValue({ someProperty: 'value' });
      
      const result = i18n.translate(TestStrings.Simple);
      expect(typeof result).toBe('string');
      expect(result).toBe('[object Object]');
      
      // Restore original method
      (i18n as any).getString = originalGetString;
    });

    it('should handle template processing that returns objects', () => {
      const result = i18n.translate(TestStrings.Template, {
        complexVar: { nested: { value: 'test' } } as any,
      });
      
      expect(typeof result).toBe('string');
      expect(result).not.toBe('[object Object]');
      expect(result).toContain('Hello');
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

    it('should validate enum languages against engine languages', () => {
      const invalidEnum = { Test: 'test' };
      const invalidTranslations = {
        German: { Test: 'Test' },
      };

      expect(() => {
        i18n.registerEnum(invalidEnum, invalidTranslations as any, 'InvalidEnum');
      }).toThrow('Error_EnumLanguageNotAvailableTemplate');
    });
  });

  describe('enumRegistry', () => {
    it('should expose the enum registry', () => {
      expect(i18n.enumRegistry).toBeDefined();
      expect(typeof i18n.enumRegistry.register).toBe('function');
      expect(typeof i18n.enumRegistry.translate).toBe('function');
      expect(typeof i18n.enumRegistry.has).toBe('function');
    });

    it('should use engine translation for enum error messages', () => {
      I18nEngine.clearInstances();
      const configWithEnumErrors = {
        ...testConfig,
        stringNames: [...Object.values(TestStrings), 'Error_EnumNotFoundTemplate'] as any,
        strings: {
          [TestLanguages.English]: {
            ...testConfig.strings[TestLanguages.English],
            Error_EnumNotFoundTemplate: 'Custom enum error: {enumName}',
          },
          [TestLanguages.Spanish]: {
            ...testConfig.strings[TestLanguages.Spanish],
            Error_EnumNotFoundTemplate: 'Error de enum personalizado: {enumName}',
          },
          [TestLanguages.French]: {
            ...testConfig.strings[TestLanguages.French],
            Error_EnumNotFoundTemplate: 'Erreur enum personnalisée: {enumName}',
          },
        },
      };
      
      const engineWithErrors = new I18nEngine(configWithEnumErrors);
      
      expect(() => {
        engineWithErrors.enumRegistry.translate({ Unknown: 'unknown' }, 'unknown' as any, TestLanguages.English);
      }).toThrow('Custom enum error: UnknownEnum');
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
        [TestLanguages.French]: 'fr',
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

  describe('template processing (t function)', () => {
    beforeEach(() => {
      I18nEngine.clearInstances();
      const configWithEnum = {
        ...testConfig,
        enumName: 'TestStrings',
        enumObj: TestStrings,
      };
      i18n = new I18nEngine(configWithEnum);
    });

    it('should process enum patterns', () => {
      const result = i18n.t('{{TestStrings.Simple}}');
      expect(result).toBe('Hello');
    });

    it('should process enum patterns with variables', () => {
      const result = i18n.t('{{TestStrings.Template}}', TestLanguages.English, { name: 'John' });
      expect(result).toBe('Hello, John!');
    });

    it('should process multiple enum patterns', () => {
      const result = i18n.t('{{TestStrings.Simple}} {{TestStrings.Template}}', TestLanguages.English, { name: 'World' });
      expect(result).toBe('Hello Hello, World!');
    });

    it('should use specified language', () => {
      const result = i18n.t('{{TestStrings.Simple}}', TestLanguages.Spanish);
      expect(result).toBe('Hola');
    });

    it('should handle plain text without patterns', () => {
      const result = i18n.t('Plain text');
      expect(result).toBe('Plain text');
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

  describe('validation errors', () => {
    beforeEach(() => {
      I18nEngine.clearInstances();
    });

    it('should throw error for missing translation key', () => {
      const invalidConfig = {
        ...testConfig,
        strings: {
          [TestLanguages.English]: {
            [TestStrings.Simple]: 'Hello',
            // Missing Template key
          },
          [TestLanguages.Spanish]: testConfig.strings[TestLanguages.Spanish],
          [TestLanguages.French]: testConfig.strings[TestLanguages.French],
        },
      };
      
      expect(() => {
        new I18nEngine(invalidConfig);
      }).toThrow("Missing translation for key 'template' in language 'English'");
    });



    it('should throw error for missing default language collection', () => {
      const invalidConfig = {
        ...testConfig,
        strings: {
          [TestLanguages.Spanish]: testConfig.strings[TestLanguages.Spanish],
          // Missing English (default) strings
        },
      };
      
      expect(() => {
        new I18nEngine(invalidConfig);
      }).toThrow("Default language 'English' has no string collection");
    });

    it('should use localized error messages when available', () => {
      const configWithErrorMessages = {
        ...testConfig,
        stringNames: [...Object.values(TestStrings), 'Error_DefaultLanguageNoCollectionTemplate'] as any,
        strings: {
          [TestLanguages.Spanish]: testConfig.strings[TestLanguages.Spanish],
          [TestLanguages.French]: testConfig.strings[TestLanguages.French],
          // Missing English (default) strings to trigger error
        },
        defaultLanguage: TestLanguages.English,
      };
      
      expect(() => {
        new I18nEngine(configWithErrorMessages);
      }).toThrow("Default language 'English' has no string collection");
    });
  });
});
