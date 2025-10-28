import {
  LanguageRegistry,
  createLanguageDefinition,
  createLanguageDefinitions,
} from '../src/language-registry';
import { LanguageDefinition } from '../src/language-definition';
import { RegistryError } from '../src/registry-error';
import { RegistryErrorType } from '../src/registry-error-type';

describe('LanguageRegistry', () => {
  beforeEach(() => {
    LanguageRegistry.clear();
  });

  afterEach(() => {
    LanguageRegistry.clear();
  });

  describe('registerLanguage', () => {
    it('should register a language', () => {
      const lang = createLanguageDefinition('en', 'English', 'en-US', true);
      LanguageRegistry.registerLanguage(lang);

      expect(LanguageRegistry.hasLanguage('en')).toBe(true);
      expect(LanguageRegistry.hasLanguageCode('en-US')).toBe(true);
    });

    it('should set first language as default', () => {
      const lang = createLanguageDefinition('en', 'English', 'en-US');
      LanguageRegistry.registerLanguage(lang);

      expect(LanguageRegistry.getDefaultLanguageId()).toBe('en');
    });

    it('should set language with isDefault flag as default', () => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
      LanguageRegistry.registerLanguage(createLanguageDefinition('es', 'Spanish', 'es-ES', true));

      expect(LanguageRegistry.getDefaultLanguageId()).toBe('es');
    });

    it('should throw error for duplicate language ID', () => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));

      expect(() => {
        LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English UK', 'en-GB'));
      }).toThrow(RegistryError);
      expect(() => {
        LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English UK', 'en-GB'));
      }).toThrow("Language 'en' is already registered");
    });

    it('should throw error for duplicate language code', () => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));

      expect(() => {
        LanguageRegistry.registerLanguage(createLanguageDefinition('en-uk', 'English UK', 'en-US'));
      }).toThrow(RegistryError);
      expect(() => {
        LanguageRegistry.registerLanguage(createLanguageDefinition('en-uk', 'English UK', 'en-US'));
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

      LanguageRegistry.registerLanguages(languages);

      expect(LanguageRegistry.getLanguageCount()).toBe(3);
      expect(LanguageRegistry.hasLanguage('en')).toBe(true);
      expect(LanguageRegistry.hasLanguage('es')).toBe(true);
      expect(LanguageRegistry.hasLanguage('fr')).toBe(true);
    });
  });

  describe('getLanguage', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return language by ID', () => {
      const lang = LanguageRegistry.getLanguage('en');
      expect(lang).toBeDefined();
      expect(lang?.id).toBe('en');
      expect(lang?.code).toBe('en-US');
    });

    it('should return undefined for non-existent language', () => {
      const lang = LanguageRegistry.getLanguage('de');
      expect(lang).toBeUndefined();
    });
  });

  describe('getLanguageByCode', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return language by code', () => {
      const lang = LanguageRegistry.getLanguageByCode('en-US');
      expect(lang).toBeDefined();
      expect(lang?.id).toBe('en');
    });

    it('should return undefined for non-existent code', () => {
      const lang = LanguageRegistry.getLanguageByCode('de-DE');
      expect(lang).toBeUndefined();
    });
  });

  describe('getAllLanguages', () => {
    it('should return empty array when no languages registered', () => {
      expect(LanguageRegistry.getAllLanguages()).toEqual([]);
    });

    it('should return all registered languages', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const languages = LanguageRegistry.getAllLanguages();
      expect(languages).toHaveLength(2);
      expect(languages.map((l) => l.id)).toContain('en');
      expect(languages.map((l) => l.id)).toContain('es');
    });
  });

  describe('getLanguageIds', () => {
    it('should return all language IDs', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const ids = LanguageRegistry.getLanguageIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain('en');
      expect(ids).toContain('es');
    });
  });

  describe('getLanguageCodes', () => {
    it('should return all language codes', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const codes = LanguageRegistry.getLanguageCodes();
      expect(codes).toHaveLength(2);
      expect(codes).toContain('en-US');
      expect(codes).toContain('es-ES');
    });
  });

  describe('hasLanguage', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return true for registered language', () => {
      expect(LanguageRegistry.hasLanguage('en')).toBe(true);
    });

    it('should return false for unregistered language', () => {
      expect(LanguageRegistry.hasLanguage('de')).toBe(false);
    });
  });

  describe('hasLanguageCode', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
    });

    it('should return true for registered code', () => {
      expect(LanguageRegistry.hasLanguageCode('en-US')).toBe(true);
    });

    it('should return false for unregistered code', () => {
      expect(LanguageRegistry.hasLanguageCode('de-DE')).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return null when no languages registered', () => {
      expect(LanguageRegistry.getDefaultLanguage()).toBeNull();
    });

    it('should return default language', () => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US', true));
      const defaultLang = LanguageRegistry.getDefaultLanguage();

      expect(defaultLang).toBeDefined();
      expect(defaultLang?.id).toBe('en');
    });
  });

  describe('getDefaultLanguageId', () => {
    it('should return null when no languages registered', () => {
      expect(LanguageRegistry.getDefaultLanguageId()).toBeNull();
    });

    it('should return default language ID', () => {
      LanguageRegistry.registerLanguage(createLanguageDefinition('en', 'English', 'en-US'));
      expect(LanguageRegistry.getDefaultLanguageId()).toBe('en');
    });
  });

  describe('setDefaultLanguage', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US', true),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);
    });

    it('should change default language', () => {
      LanguageRegistry.setDefaultLanguage('es');
      expect(LanguageRegistry.getDefaultLanguageId()).toBe('es');
    });

    it('should throw error for non-existent language', () => {
      expect(() => {
        LanguageRegistry.setDefaultLanguage('de');
      }).toThrow(RegistryError);
      expect(() => {
        LanguageRegistry.setDefaultLanguage('de');
      }).toThrow("Language 'de' not found");
    });
  });

  describe('getLanguageCount', () => {
    it('should return 0 for empty registry', () => {
      expect(LanguageRegistry.getLanguageCount()).toBe(0);
    });

    it('should return correct count', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);

      expect(LanguageRegistry.getLanguageCount()).toBe(3);
    });
  });

  describe('validateRequiredLanguages', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);
    });

    it('should validate all languages present', () => {
      const result = LanguageRegistry.validateRequiredLanguages(['en', 'es']);

      expect(result.isValid).toBe(true);
      expect(result.missingLanguages).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing languages', () => {
      const result = LanguageRegistry.validateRequiredLanguages(['en', 'fr', 'de']);

      expect(result.isValid).toBe(false);
      expect(result.missingLanguages).toHaveLength(2);
      expect(result.missingLanguages).toContain('fr');
      expect(result.missingLanguages).toContain('de');
      expect(result.errors).toHaveLength(2);
    });

    it('should handle empty required list', () => {
      const result = LanguageRegistry.validateRequiredLanguages([]);

      expect(result.isValid).toBe(true);
      expect(result.missingLanguages).toHaveLength(0);
    });
  });

  describe('getLanguageDisplayNames', () => {
    it('should return mapping of IDs to names', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const names = LanguageRegistry.getLanguageDisplayNames();
      expect(names['en']).toBe('English');
      expect(names['es']).toBe('Spanish');
    });
  });

  describe('getLanguageCodeMapping', () => {
    it('should return mapping of IDs to codes', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      const mapping = LanguageRegistry.getLanguageCodeMapping();
      expect(mapping['en']).toBe('en-US');
      expect(mapping['es']).toBe('es-ES');
    });
  });

  describe('findLanguagesByName', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);
    });

    it('should find languages by partial name', () => {
      const results = LanguageRegistry.findLanguagesByName('Eng');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('en');
    });

    it('should be case-insensitive', () => {
      const results = LanguageRegistry.findLanguagesByName('spanish');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('es');
    });

    it('should return multiple matches', () => {
      const results = LanguageRegistry.findLanguagesByName('sh');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for no matches', () => {
      const results = LanguageRegistry.findLanguagesByName('xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear all languages', () => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US'),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
      ]);

      LanguageRegistry.clear();

      expect(LanguageRegistry.getLanguageCount()).toBe(0);
      expect(LanguageRegistry.getDefaultLanguageId()).toBeNull();
      expect(LanguageRegistry.hasLanguage('en')).toBe(false);
      expect(LanguageRegistry.hasLanguageCode('en-US')).toBe(false);
    });
  });

  describe('getMatchingLanguageCode', () => {
    beforeEach(() => {
      LanguageRegistry.registerLanguages([
        createLanguageDefinition('en', 'English', 'en-US', true),
        createLanguageDefinition('es', 'Spanish', 'es-ES'),
        createLanguageDefinition('fr', 'French', 'fr-FR'),
      ]);
    });

    it('should return requested code when it exists', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('es-ES');
      expect(result).toBe('es-ES');
    });

    it('should return user default when requested code does not exist', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('de-DE', 'fr-FR');
      expect(result).toBe('fr-FR');
    });

    it('should return site default when neither requested nor user default exist', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('de-DE', 'it-IT');
      expect(result).toBe('en-US');
    });

    it('should return site default when no parameters provided', () => {
      const result = LanguageRegistry.getMatchingLanguageCode();
      expect(result).toBe('en-US');
    });

    it('should return site default when only invalid requested code provided', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('invalid');
      expect(result).toBe('en-US');
    });

    it('should return site default when only invalid user default provided', () => {
      const result = LanguageRegistry.getMatchingLanguageCode(undefined, 'invalid');
      expect(result).toBe('en-US');
    });

    it('should throw error when no default language configured', () => {
      LanguageRegistry.clear();
      expect(() => LanguageRegistry.getMatchingLanguageCode('en-US')).toThrow(RegistryError);
      expect(() => LanguageRegistry.getMatchingLanguageCode('en-US')).toThrow(
        'No default language configured',
      );
    });

    it('should prioritize requested code over user default', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('es-ES', 'fr-FR');
      expect(result).toBe('es-ES');
    });

    it('should prioritize user default over site default', () => {
      const result = LanguageRegistry.getMatchingLanguageCode(undefined, 'fr-FR');
      expect(result).toBe('fr-FR');
    });

    it('should handle empty string requested code', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('', 'es-ES');
      expect(result).toBe('es-ES');
    });

    it('should handle empty string user default', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('es-ES', '');
      expect(result).toBe('es-ES');
    });

    it('should handle both empty strings', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('', '');
      expect(result).toBe('en-US');
    });

    it('should handle whitespace in codes', () => {
      const result = LanguageRegistry.getMatchingLanguageCode('  ', '  ');
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
