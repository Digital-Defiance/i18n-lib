/**
 * Integration tests for branded enum translation support
 *
 * Tests the full workflow of registering and translating branded enums
 * through I18nEngine and PluginI18nEngine.
 */

import { createBrandedEnum } from '@digitaldefiance/branded-enum';
import {
  isBrandedEnum,
  getBrandedEnumComponentId,
  getBrandedEnumId,
} from '../src/branded-enum-utils';
import { createI18nStringKeys } from '../src/branded-string-key';
import { EnumRegistry } from '../src/core/enum-registry';
import { I18nEngine } from '../src/core/i18n-engine';
import { EnumTranslationRegistry } from '../src/enum-registry';
import type { LanguageDefinition } from '../src/language-definition';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';

describe('Branded Enum Translation Integration', () => {
  // Test fixtures
  const brandedStatus = createBrandedEnum('status', {
    Active: 'active',
    Inactive: 'inactive',
    Pending: 'pending',
  });

  const i18nBrandedStatus = createI18nStringKeys('status-component', {
    Active: 'active',
    Inactive: 'inactive',
    Pending: 'pending',
  });

  const traditionalStatus = {
    Active: 'active',
    Inactive: 'inactive',
    Pending: 'pending',
  } as const;

  const statusTranslations = {
    'en-US': {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
    },
    es: {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
    },
    de: {
      active: 'Aktiv',
      inactive: 'Inaktiv',
      pending: 'Ausstehend',
    },
  };

  describe('EnumRegistry (v2)', () => {
    let registry: EnumRegistry;

    beforeEach(() => {
      registry = new EnumRegistry();
    });

    describe('branded enum registration', () => {
      it('should register branded enum with explicit name', () => {
        registry.register(brandedStatus, statusTranslations, 'Status');
        expect(registry.has(brandedStatus)).toBe(true);
      });

      it('should register branded enum with inferred name', () => {
        registry.register(brandedStatus, statusTranslations);
        expect(registry.has(brandedStatus)).toBe(true);
      });

      it('should register i18n branded enum with inferred name', () => {
        registry.register(i18nBrandedStatus, statusTranslations);
        expect(registry.has(i18nBrandedStatus)).toBe(true);
      });

      it('should maintain backward compatibility with traditional enums', () => {
        registry.register(traditionalStatus, statusTranslations, 'Status');
        expect(registry.has(traditionalStatus)).toBe(true);
      });
    });

    describe('branded enum translation', () => {
      beforeEach(() => {
        registry.register(brandedStatus, statusTranslations);
        registry.register(i18nBrandedStatus, statusTranslations);
        registry.register(
          traditionalStatus,
          statusTranslations,
          'TraditionalStatus',
        );
      });

      it('should translate branded enum values', () => {
        expect(
          registry.translate(brandedStatus, brandedStatus.Active, 'en-US'),
        ).toBe('Active');
        expect(
          registry.translate(brandedStatus, brandedStatus.Inactive, 'en-US'),
        ).toBe('Inactive');
        expect(
          registry.translate(brandedStatus, brandedStatus.Pending, 'en-US'),
        ).toBe('Pending');
      });

      it('should translate i18n branded enum values', () => {
        expect(
          registry.translate(
            i18nBrandedStatus,
            i18nBrandedStatus.Active,
            'en-US',
          ),
        ).toBe('Active');
        expect(
          registry.translate(
            i18nBrandedStatus,
            i18nBrandedStatus.Inactive,
            'es',
          ),
        ).toBe('Inactivo');
        expect(
          registry.translate(
            i18nBrandedStatus,
            i18nBrandedStatus.Pending,
            'de',
          ),
        ).toBe('Ausstehend');
      });

      it('should translate traditional enum values', () => {
        expect(
          registry.translate(
            traditionalStatus,
            traditionalStatus.Active,
            'en-US',
          ),
        ).toBe('Active');
        expect(
          registry.translate(
            traditionalStatus,
            traditionalStatus.Inactive,
            'es',
          ),
        ).toBe('Inactivo');
      });

      it('should translate across multiple languages', () => {
        expect(
          registry.translate(brandedStatus, brandedStatus.Active, 'en-US'),
        ).toBe('Active');
        expect(
          registry.translate(brandedStatus, brandedStatus.Active, 'es'),
        ).toBe('Activo');
        expect(
          registry.translate(brandedStatus, brandedStatus.Active, 'de'),
        ).toBe('Aktiv');
      });

      it('should throw error for unregistered enum', () => {
        const unregisteredEnum = createBrandedEnum('unregistered', { A: 'a' });
        expect(() =>
          registry.translate(unregisteredEnum, 'a', 'en-US'),
        ).toThrow();
      });

      it('should throw error for missing language', () => {
        expect(() =>
          registry.translate(brandedStatus, brandedStatus.Active, 'fr'),
        ).toThrow();
      });

      it('should throw error for missing value', () => {
        expect(() =>
          registry.translate(brandedStatus, 'nonexistent' as string, 'en-US'),
        ).toThrow();
      });
    });
  });

  describe('EnumTranslationRegistry (legacy)', () => {
    let registry: EnumTranslationRegistry<string, 'en-US' | 'es' | 'de'>;

    beforeEach(() => {
      registry = new EnumTranslationRegistry(['en-US', 'es', 'de']);
    });

    describe('branded enum registration', () => {
      it('should register branded enum with explicit name', () => {
        registry.register(brandedStatus, statusTranslations, 'Status');
        expect(registry.has(brandedStatus)).toBe(true);
      });

      it('should register branded enum with inferred name', () => {
        registry.register(brandedStatus, statusTranslations);
        expect(registry.has(brandedStatus)).toBe(true);
      });

      it('should validate languages for branded enums', () => {
        const invalidTranslations = {
          'en-US': {
            active: 'Active',
            inactive: 'Inactive',
            pending: 'Pending',
          },
          fr: { active: 'Actif', inactive: 'Inactif', pending: 'En attente' }, // 'fr' is not in available languages
        } as Record<string, Record<string, string>>;
        expect(() =>
          registry.register(
            brandedStatus,
            invalidTranslations as Record<
              'en-US' | 'es' | 'de',
              Record<string, string>
            >,
          ),
        ).toThrow();
      });
    });

    describe('branded enum translation', () => {
      beforeEach(() => {
        registry.register(brandedStatus, statusTranslations);
      });

      it('should translate branded enum values', () => {
        expect(
          registry.translate(brandedStatus, brandedStatus.Active, 'en-US'),
        ).toBe('Active');
        expect(
          registry.translate(brandedStatus, brandedStatus.Inactive, 'es'),
        ).toBe('Inactivo');
        expect(
          registry.translate(brandedStatus, brandedStatus.Pending, 'de'),
        ).toBe('Ausstehend');
      });
    });
  });

  describe('I18nEngine', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      I18nEngine.resetAll();
      engine = new I18nEngine(
        [
          { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
          { id: 'es', name: 'Spanish', code: 'es' },
          { id: 'de', name: 'German', code: 'de' },
        ],
        { defaultLanguage: 'en-US' },
        {
          instanceKey: 'test-engine',
          registerInstance: true,
          setAsDefault: true,
        },
      );
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    describe('registerEnum with branded enums', () => {
      it('should register branded enum with explicit name', () => {
        engine.registerEnum(brandedStatus, statusTranslations, 'Status');
        expect(engine.hasEnum(brandedStatus)).toBe(true);
      });

      it('should register branded enum with inferred name', () => {
        engine.registerEnum(brandedStatus, statusTranslations);
        expect(engine.hasEnum(brandedStatus)).toBe(true);
      });

      it('should register i18n branded enum with inferred name', () => {
        engine.registerEnum(i18nBrandedStatus, statusTranslations);
        expect(engine.hasEnum(i18nBrandedStatus)).toBe(true);
      });
    });

    describe('translateEnum with branded enums', () => {
      beforeEach(() => {
        engine.registerEnum(brandedStatus, statusTranslations);
        engine.registerEnum(i18nBrandedStatus, statusTranslations);
      });

      it('should translate branded enum values', () => {
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Active',
        );
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Inactive),
        ).toBe('Inactive');
      });

      it('should translate i18n branded enum values', () => {
        expect(
          engine.translateEnum(i18nBrandedStatus, i18nBrandedStatus.Active),
        ).toBe('Active');
      });

      it('should translate with explicit language', () => {
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'es'),
        ).toBe('Activo');
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'de'),
        ).toBe('Aktiv');
      });

      it('should use current language when not specified', () => {
        engine.setLanguage('es');
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Activo',
        );
      });
    });

    describe('hasEnum with branded enums', () => {
      it('should return true for registered branded enum', () => {
        engine.registerEnum(brandedStatus, statusTranslations);
        expect(engine.hasEnum(brandedStatus)).toBe(true);
      });

      it('should return false for unregistered branded enum', () => {
        expect(engine.hasEnum(brandedStatus)).toBe(false);
      });
    });
  });

  describe('utility function integration', () => {
    it('should correctly identify branded enums used in translation', () => {
      expect(isBrandedEnum(brandedStatus)).toBe(true);
      expect(isBrandedEnum(i18nBrandedStatus)).toBe(true);
      expect(isBrandedEnum(traditionalStatus)).toBe(false);
    });

    it('should extract component ID from branded enums', () => {
      expect(getBrandedEnumComponentId(brandedStatus)).toBe('status');
      expect(getBrandedEnumComponentId(i18nBrandedStatus)).toBe(
        'status-component',
      );
      expect(getBrandedEnumComponentId(traditionalStatus)).toBeNull();
    });

    it('should get raw brand ID from branded enums', () => {
      expect(getBrandedEnumId(brandedStatus)).toBe('status');
      expect(getBrandedEnumId(i18nBrandedStatus)).toBe('i18n:status-component');
      expect(getBrandedEnumId(traditionalStatus)).toBeNull();
    });
  });

  describe('PluginI18nEngine', () => {
    // Test languages for PluginI18nEngine
    const englishLang: LanguageDefinition = {
      id: 'en-US',
      name: 'English (US)',
      code: 'en-US',
      isDefault: true,
    };

    const spanishLang: LanguageDefinition = {
      id: 'es',
      name: 'Spanish',
      code: 'es',
    };

    const germanLang: LanguageDefinition = {
      id: 'de',
      name: 'German',
      code: 'de',
    };

    let engine: PluginI18nEngine<'en-US' | 'es' | 'de'>;

    beforeEach(() => {
      PluginI18nEngine.resetAll();
      engine = new PluginI18nEngine([englishLang, spanishLang, germanLang]);
    });

    afterEach(() => {
      PluginI18nEngine.resetAll();
    });

    describe('registerEnum with branded enums', () => {
      it('should register branded enum with explicit name', () => {
        engine.registerEnum(brandedStatus, statusTranslations, 'Status');
        expect(engine.getEnumRegistry().has(brandedStatus)).toBe(true);
      });

      it('should register branded enum with inferred name', () => {
        engine.registerEnum(brandedStatus, statusTranslations);
        expect(engine.getEnumRegistry().has(brandedStatus)).toBe(true);
      });

      it('should register i18n branded enum with inferred name', () => {
        engine.registerEnum(i18nBrandedStatus, statusTranslations);
        expect(engine.getEnumRegistry().has(i18nBrandedStatus)).toBe(true);
      });

      it('should maintain backward compatibility with traditional enums', () => {
        engine.registerEnum(
          traditionalStatus,
          statusTranslations,
          'TraditionalStatus',
        );
        expect(engine.getEnumRegistry().has(traditionalStatus)).toBe(true);
      });
    });

    describe('translateEnum with branded enums', () => {
      beforeEach(() => {
        engine.registerEnum(brandedStatus, statusTranslations);
        engine.registerEnum(i18nBrandedStatus, statusTranslations);
        engine.registerEnum(
          traditionalStatus,
          statusTranslations,
          'TraditionalStatus',
        );
      });

      it('should translate branded enum values', () => {
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Active',
        );
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Inactive),
        ).toBe('Inactive');
        expect(engine.translateEnum(brandedStatus, brandedStatus.Pending)).toBe(
          'Pending',
        );
      });

      it('should translate i18n branded enum values', () => {
        expect(
          engine.translateEnum(i18nBrandedStatus, i18nBrandedStatus.Active),
        ).toBe('Active');
        expect(
          engine.translateEnum(i18nBrandedStatus, i18nBrandedStatus.Inactive),
        ).toBe('Inactive');
      });

      it('should translate traditional enum values', () => {
        expect(
          engine.translateEnum(traditionalStatus, traditionalStatus.Active),
        ).toBe('Active');
        expect(
          engine.translateEnum(traditionalStatus, traditionalStatus.Inactive),
        ).toBe('Inactive');
      });

      it('should translate with explicit language', () => {
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'es'),
        ).toBe('Activo');
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'de'),
        ).toBe('Aktiv');
      });

      it('should translate across multiple languages', () => {
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'en-US'),
        ).toBe('Active');
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'es'),
        ).toBe('Activo');
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'de'),
        ).toBe('Aktiv');
      });

      it('should throw error for unregistered enum', () => {
        const unregisteredEnum = createBrandedEnum('unregistered', { A: 'a' });
        expect(() => engine.translateEnum(unregisteredEnum, 'a')).toThrow();
      });

      it('should throw error for missing value', () => {
        expect(() =>
          engine.translateEnum(brandedStatus, 'nonexistent' as string),
        ).toThrow();
      });
    });

    describe('language context switching', () => {
      beforeEach(() => {
        engine.registerEnum(brandedStatus, statusTranslations);
      });

      it('should use current language when not specified', () => {
        // Default language is en-US
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Active',
        );
      });

      it('should respect language change via setLanguage', () => {
        engine.setLanguage('es');
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Activo',
        );

        engine.setLanguage('de');
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Aktiv',
        );
      });

      it('should respect language change via updateContext', () => {
        engine.updateContext({ language: 'es' });
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Activo',
        );
      });

      it('should respect admin language context', () => {
        engine.updateContext({
          adminLanguage: 'de',
          currentContext: 'admin',
        });
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Aktiv',
        );
      });

      it('should switch between user and admin context', () => {
        engine.updateContext({
          language: 'es',
          adminLanguage: 'de',
        });

        // User context (default)
        engine.updateContext({ currentContext: 'user' });
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Activo',
        );

        // Admin context
        engine.updateContext({ currentContext: 'admin' });
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Aktiv',
        );
      });

      it('should allow explicit language override regardless of context', () => {
        engine.updateContext({
          language: 'es',
          adminLanguage: 'de',
          currentContext: 'admin',
        });

        // Even in admin context (de), explicit language should override
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'en-US'),
        ).toBe('Active');
      });
    });

    describe('full workflow integration', () => {
      it('should support complete branded enum workflow', () => {
        // 1. Register branded enum
        engine.registerEnum(brandedStatus, statusTranslations);

        // 2. Verify registration
        expect(engine.getEnumRegistry().has(brandedStatus)).toBe(true);

        // 3. Translate in default language
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Active',
        );

        // 4. Change language and translate
        engine.setLanguage('es');
        expect(engine.translateEnum(brandedStatus, brandedStatus.Active)).toBe(
          'Activo',
        );

        // 5. Translate with explicit language
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'de'),
        ).toBe('Aktiv');
      });

      it('should support multiple branded enums simultaneously', () => {
        // Create another branded enum
        const priorityEnum = createBrandedEnum('priority', {
          High: 'high',
          Medium: 'medium',
          Low: 'low',
        });

        const priorityTranslations = {
          'en-US': { high: 'High', medium: 'Medium', low: 'Low' },
          es: { high: 'Alta', medium: 'Media', low: 'Baja' },
          de: { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
        };

        // Register both enums
        engine.registerEnum(brandedStatus, statusTranslations);
        engine.registerEnum(priorityEnum, priorityTranslations);

        // Translate both
        expect(
          engine.translateEnum(brandedStatus, brandedStatus.Active, 'es'),
        ).toBe('Activo');
        expect(
          engine.translateEnum(priorityEnum, priorityEnum.High, 'es'),
        ).toBe('Alta');
      });
    });
  });
});
