import {
  LanguageRegistry,
  createLanguageDefinition,
  createLanguageDefinitions,
} from '../src/language-registry';
import { LanguageDefinition } from '../src/language-definition';
import { RegistryError } from '../src/registry-error';
import { RegistryErrorType } from '../src/registry-error-type';

type TestLanguages = 'en' | 'es' | 'fr' | 'de' | 'zh';

describe('LanguageRegistry', () => {
  let registry: LanguageRegistry<TestLanguages>;

  beforeEach(() => {
    registry = new LanguageRegistry<TestLanguages>();
  });

  describe('registerLanguage', () => {
    it('should register a language', () => {
      const lang = createLanguageDefinition('en', 'English', 'en-US', true);
      registry.registerLanguage(lang);

      expect(registry.hasLanguage('en' as TestLanguages)).toBe(true);
      expect(registry.hasLanguageCode('en-US')).toBe(true);
    });

    it('should set first language as default', () => {
      const lang = createLanguageDefinition('en', 'English', 'en-US');
      registry.registerLanguage(lang);

      expect(registry.getDefaultLanguageId()).toBe('en');
    });

    it('should set language with isDefault flag as default', () => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
      registry.registerLanguage(createLanguageDefinition('es', 'Spanish', 'es-ES', true));

      expect(registry.getDefaultLanguageId()).toBe('es');
    });

    it('should throw error for duplicate language ID', () => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));

      expect(() => {
        registry.registerLanguage(createLanguageDefinition('en', 'English UK', 'en-GB'));
      }).toThrow(RegistryError);
      expect(() => {
        registry.registerLanguage(createLanguageDefinition('en', 'English UK', 'en-GB'));
      }).toThrow("Language 'en' is already registered");
    });

    it('should throw error for duplicate language code', () => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));

      expect(() => {
        registry.registerLanguage(createLanguageDefinition('en-uk', 'English UK', 'en-US'));
      }).toThrow(RegistryError);
      expect(() => {
        registry.registerLanguage(createLanguageDefinition('en-uk', 'English UK', 'en-US'));
      }).toThrow("Language code 'en-US' is already used by language 'en'");
    });
  });

  describe('registerLanguages', () => {
    it('should register multiple languages', () => {
      const languages = createLanguageDefinitions([
        { id: 'en', name: 'English', code: 'en-US', isDefault: true },
        { id: 'es', name: 'Spanish', code: 'es-ES' },
        { id: 'fr', name: 'French', code: 'fr-FR' },
      ]);

      registry.registerLanguages(languages);

      expect(registry.getLanguageCount()).toBe(3);
      expect(registry.hasLanguage('en' as TestLanguages)).toBe(true);
      expect(registry.hasLanguage('es' as TestLanguages)).toBe(true);
      expect(registry.hasLanguage('fr' as TestLanguages)).toBe(true);
    });
  });

  describe('getLanguage', () => {
    beforeEach(() => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return language by ID', () => {
      const lang = registry.getLanguage('en' as TestLanguages);
      expect(lang).toBeDefined();
      expect(lang?.id).toBe('en');
      expect(lang?.code).toBe('en-US');
    });

    it('should return undefined for non-existent language', () => {
      const lang = registry.getLanguage('de' as TestLanguages);
      expect(lang).toBeUndefined();
    });
  });

  describe('getLanguageByCode', () => {
    beforeEach(() => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return language by code', () => {
      const lang = registry.getLanguageByCode('en-US');
      expect(lang).toBeDefined();
      expect(lang?.id).toBe('en');
    });

    it('should return undefined for non-existent code', () => {
      const lang = registry.getLanguageByCode('de-DE');
      expect(lang).toBeUndefined();
    });
  });

  describe('getAllLanguages', () => {
    it('should return empty array when no languages registered', () => {
      expect(registry.getAllLanguages()).toEqual([]);
    });

    it('should return all registered languages', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const languages = registry.getAllLanguages();
      expect(languages).toHaveLength(2);
      expect(languages.map((l) => l.id)).toContain('en');
      expect(languages.map((l) => l.id)).toContain('es');
    });
  });

  describe('getLanguageIds', () => {
    it('should return all language IDs', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const ids = registry.getLanguageIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('en');
      expect(ids).toContain('es');
    });
  });

  describe('getLanguageCodes', () => {
    it('should return all language codes', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const codes = registry.getLanguageCodes();
      expect(codes).toHaveLength(2);
      expect(codes).toContain('en-US');
      expect(codes).toContain('es-ES');
    });
  });

  describe('hasLanguage', () => {
    beforeEach(() => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return true for registered language', () => {
      expect(registry.hasLanguage('en' as TestLanguages)).toBe(true);
    });

    it('should return false for unregistered language', () => {
      expect(registry.hasLanguage('de' as TestLanguages)).toBe(false);
    });
  });

  describe('hasLanguageCode', () => {
    beforeEach(() => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return true for registered code', () => {
      expect(registry.hasLanguageCode('en-US')).toBe(true);
    });

    it('should return false for unregistered code', () => {
      expect(registry.hasLanguageCode('de-DE')).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return null when no languages registered', () => {
      expect(registry.getDefaultLanguage()).toBeNull();
    });

    it('should return default language', () => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US', true));
      const defaultLang = registry.getDefaultLanguage();

      expect(defaultLang).toBeDefined();
      expect(defaultLang?.id).toBe('en');
    });
  });

  describe('getDefaultLanguageId', () => {
    it('should return null when no languages registered', () => {
      expect(registry.getDefaultLanguageId()).toBeNull();
    });

    it('should return default language ID', () => {
      registry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
      expect(registry.getDefaultLanguageId()).toBe('en');
    });
  });

  describe('setDefaultLanguage', () => {
    beforeEach(() => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US', true),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);
    });

    it('should change default language', () => {
      registry.setDefaultLanguage('es' as TestLanguages);
      expect(registry.getDefaultLanguageId()).toBe('es');
    });

    it('should throw error for non-existent language', () => {
      expect(() => {
        registry.setDefaultLanguage('de' as TestLanguages);
      }).toThrow(RegistryError);
      expect(() => {
        registry.setDefaultLanguage('de' as TestLanguages);
      }).toThrow("Language 'de' not found");
    });
  });

  describe('getLanguageCount', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.getLanguageCount()).toBe(0);
    });

    it('should return correct count', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);

      expect(registry.getLanguageCount()).toBe(3);
    });
  });

  describe('validateRequiredLanguages', () => {
    beforeEach(() => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);
    });

    it('should validate all languages present', () => {
      const result = registry.validateRequiredLanguages(['en', 'es'] as TestLanguages[]);

      expect(result.isValid).toBe(true);
      expect(result.missingLanguages).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing languages', () => {
      const result = registry.validateRequiredLanguages(['en', 'fr', 'de'] as TestLanguages[]);

      expect(result.isValid).toBe(false);
      expect(result.missingLanguages).toHaveLength(2);
      expect(result.missingLanguages).toContain('fr');
      expect(result.missingLanguages).toContain('de');
      expect(result.errors).toHaveLength(2);
    });

    it('should handle empty required list', () => {
      const result = registry.validateRequiredLanguages([]);

      expect(result.isValid).toBe(true);
      expect(result.missingLanguages).toHaveLength(0);
    });
  });

  describe('getLanguageDisplayNames', () => {
    it('should return mapping of IDs to names', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const names = registry.getLanguageDisplayNames();
      expect(names['en']).toBe('English');
      expect(names['es']).toBe('Spanish');
    });
  });

  describe('getLanguageCodeMapping', () => {
    it('should return mapping of IDs to codes', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const mapping = registry.getLanguageCodeMapping();
      expect(mapping['en']).toBe('en-US');
      expect(mapping['es']).toBe('es-ES');
    });
  });

  describe('findLanguagesByName', () => {
    beforeEach(() => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);
    });

    it('should find languages by partial name', () => {
      const results = registry.findLanguagesByName('Eng');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('en');
    });

    it('should be case-insensitive', () => {
      const results = registry.findLanguagesByName('spanish');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('es');
    });

    it('should return multiple matches', () => {
      const results = registry.findLanguagesByName('sh');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for no matches', () => {
      const results = registry.findLanguagesByName('xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear all languages', () => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      registry.clear();

      expect(registry.getLanguageCount()).toBe(0);
      expect(registry.getDefaultLanguageId()).toBeNull();
      expect(registry.hasLanguage('en' as TestLanguages)).toBe(false);
      expect(registry.hasLanguageCode('en-US')).toBe(false);
    });
  });

  describe('getMatchingLanguageCode', () => {
    beforeEach(() => {
      registry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US', true),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);
    });

    it('should return requested code when it exists', () => {
      const result = registry.getMatchingLanguageCode('es-ES');
      expect(result).toBe('es-ES');
    });

    it('should return user default when requested code does not exist', () => {
      const result = registry.getMatchingLanguageCode('de-DE', 'fr-FR');
      expect(result).toBe('fr-FR');
    });

    it('should return site default when neither requested nor user default exist', () => {
      const result = registry.getMatchingLanguageCode('de-DE', 'it-IT');
      expect(result).toBe('en-US');
    });

    it('should return site default when no parameters provided', () => {
      const result = registry.getMatchingLanguageCode();
      expect(result).toBe('en-US');
    });

    it('should return site default when only invalid requested code provided', () => {
      const result = registry.getMatchingLanguageCode('invalid');
      expect(result).toBe('en-US');
    });

    it('should return site default when only invalid user default provided', () => {
      const result = registry.getMatchingLanguageCode(undefined, 'invalid');
      expect(result).toBe('en-US');
    });

    it('should throw error when no default language configured', () => {
      const emptyRegistry = new LanguageRegistry<TestLanguages>();
      expect(() => emptyRegistry.getMatchingLanguageCode('en-US')).toThrow(RegistryError);
      expect(() => emptyRegistry.getMatchingLanguageCode('en-US')).toThrow(
        'No default language configured',
      );
    });

    it('should prioritize requested code over user default', () => {
      const result = registry.getMatchingLanguageCode('es-ES', 'fr-FR');
      expect(result).toBe('es-ES');
    });

    it('should prioritize user default over site default', () => {
      const result = registry.getMatchingLanguageCode(undefined, 'fr-FR');
      expect(result).toBe('fr-FR');
    });

    it('should handle empty string requested code', () => {
      const result = registry.getMatchingLanguageCode('', 'es-ES');
      expect(result).toBe('es-ES');
    });

    it('should handle empty string user default', () => {
      const result = registry.getMatchingLanguageCode('es-ES', '');
      expect(result).toBe('es-ES');
    });

    it('should handle both empty strings', () => {
      const result = registry.getMatchingLanguageCode('', '');
      expect(result).toBe('en-US');
    });

    it('should handle whitespace in codes', () => {
      const result = registry.getMatchingLanguageCode('  ', '  ');
      expect(result).toBe('en-US');
    });
  });

  describe('helper functions', () => {
    describe('createLanguageDefinition', () => {
      it('should create language definition with default flag', () => {
        const lang = createLanguageDefinition('en', 'English', 'en-US', true);
        expect(lang.id).toBe('en');
        expect(lang.name).toBe('English');
        expect(lang.code).toBe('en-US');
        expect(lang.isDefault).toBe(true);
      });

      it('should create language definition without default flag', () => {
        const lang = createLanguageDefinition('es', 'Spanish', 'es-ES');
        expect(lang.isDefault).toBe(false);
      });
    });

    describe('createLanguageDefinitions', () => {
      it('should create multiple language definitions', () => {
        const languages = createLanguageDefinitions([
          { id: 'en', name: 'English', code: 'en-US', isDefault: true },
          { id: 'es', name: 'Spanish', code: 'es-ES' },
        ]);

        expect(languages).toHaveLength(2);
        expect(languages[0].id).toBe('en');
        expect(languages[0].isDefault).toBe(true);
        expect(languages[1].id).toBe('es');
        expect(languages[1].isDefault).toBe(false);
      });
    });
  });
});
