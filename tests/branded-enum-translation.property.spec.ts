/**
 * Property-based tests for branded enum translation support
 *
 * **Feature: branded-enum-translation-support**
 *
 * These tests verify universal properties that should hold across all valid
 * inputs for branded enum registration and translation.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createBrandedEnum } from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import {
  isBrandedEnum,
  getBrandedEnumComponentId,
} from '../src/branded-enum-utils';
import { createI18nStringKeys } from '../src/branded-string-key';
import { EnumRegistry } from '../src/core/enum-registry';
import { I18nEngine } from '../src/core/i18n-engine';
import { EnumTranslationRegistry } from '../src/enum-registry';
import { PluginI18nEngine } from '../src/plugin-i18n-engine';

// Test languages
const TEST_LANGUAGES = ['en-US', 'es', 'de'] as const;
type TestLanguage = (typeof TEST_LANGUAGES)[number];

// Language definitions for engines
const languageDefinitions = [
  { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
  { id: 'es', name: 'Spanish', code: 'es' },
  { id: 'de', name: 'German', code: 'de' },
] as const;

/**
 * Generates a valid component ID (kebab-case string)
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,29}$/)
  .filter((s) => s.length > 0 && !s.endsWith('-') && !s.includes('--'));

/**
 * Generates a valid enum key (PascalCase string)
 */
const enumKeyArb = fc
  .stringMatching(/^[A-Z][a-zA-Z0-9]{0,19}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a valid enum value (lowercase string)
 */
const enumValueArb = fc
  .stringMatching(/^[a-z][a-z0-9_]{0,19}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a translation string
 */
const translationStringArb = fc.string({ minLength: 1, maxLength: 50 });

/**
 * Generates a branded enum with random keys and values
 */
const brandedEnumArb = fc
  .tuple(
    componentIdArb,
    fc.array(fc.tuple(enumKeyArb, enumValueArb), {
      minLength: 1,
      maxLength: 5,
    }),
  )
  .map(([componentId, keyValuePairs]) => {
    // Ensure unique keys and values
    const uniqueKeys = new Set<string>();
    const uniqueValues = new Set<string>();
    const filteredPairs: [string, string][] = [];

    for (const [key, value] of keyValuePairs) {
      if (!uniqueKeys.has(key) && !uniqueValues.has(value)) {
        uniqueKeys.add(key);
        uniqueValues.add(value);
        filteredPairs.push([key, value]);
      }
    }

    if (filteredPairs.length === 0) {
      // Fallback to a default pair if all were duplicates
      filteredPairs.push(['Default', 'default']);
    }

    const enumDef = Object.fromEntries(filteredPairs) as Record<string, string>;
    return {
      componentId,
      enumDef,
      brandedEnum: createBrandedEnum(componentId, enumDef),
    };
  });

/**
 * Generates an i18n branded enum (with i18n: prefix)
 */
const i18nBrandedEnumArb = fc
  .tuple(
    componentIdArb,
    fc.array(fc.tuple(enumKeyArb, enumValueArb), {
      minLength: 1,
      maxLength: 5,
    }),
  )
  .map(([componentId, keyValuePairs]) => {
    // Ensure unique keys and values
    const uniqueKeys = new Set<string>();
    const uniqueValues = new Set<string>();
    const filteredPairs: [string, string][] = [];

    for (const [key, value] of keyValuePairs) {
      if (!uniqueKeys.has(key) && !uniqueValues.has(value)) {
        uniqueKeys.add(key);
        uniqueValues.add(value);
        filteredPairs.push([key, value]);
      }
    }

    if (filteredPairs.length === 0) {
      filteredPairs.push(['Default', 'default']);
    }

    const enumDef = Object.fromEntries(filteredPairs) as Record<string, string>;
    return {
      componentId,
      enumDef,
      brandedEnum: createI18nStringKeys(componentId, enumDef),
    };
  });

/**
 * Generates a traditional enum (plain object without __brand)
 */
const traditionalEnumArb = fc
  .array(fc.tuple(enumKeyArb, enumValueArb), { minLength: 1, maxLength: 5 })
  .map((keyValuePairs) => {
    // Ensure unique keys and values
    const uniqueKeys = new Set<string>();
    const uniqueValues = new Set<string>();
    const filteredPairs: [string, string][] = [];

    for (const [key, value] of keyValuePairs) {
      if (!uniqueKeys.has(key) && !uniqueValues.has(value)) {
        uniqueKeys.add(key);
        uniqueValues.add(value);
        filteredPairs.push([key, value]);
      }
    }

    if (filteredPairs.length === 0) {
      filteredPairs.push(['Default', 'default']);
    }

    const enumDef = Object.fromEntries(filteredPairs) as Record<string, string>;
    return { enumDef };
  });

/**
 * Generates translations for a given enum definition
 */
function generateTranslations(
  enumDef: Record<string, string>,
): Record<string, Record<string, string>> {
  const translations: Record<string, Record<string, string>> = {};

  for (const lang of TEST_LANGUAGES) {
    translations[lang] = {};
    for (const [_key, value] of Object.entries(enumDef)) {
      // Generate a simple translation based on language and value
      translations[lang][value] = `${lang}:${value}`;
    }
  }

  return translations;
}

describe('Branded Enum Translation Property-Based Tests', () => {
  describe('Property 1: Branded Enum Registration Succeeds Across All Registries', () => {
    /**
     * **Property 1: Branded Enum Registration Succeeds**
     *
     * For any branded enum with valid translations, registering it with any registry
     * (EnumRegistry, EnumTranslationRegistry, I18nEngine, or PluginI18nEngine) should
     * succeed, and subsequently calling `hasEnum()` should return true.
     *
     * **Validates: Requirements 1.1, 4.1, 4.3, 5.1**
     */

    describe('EnumRegistry (v2)', () => {
      it('should successfully register any branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumRegistry();
            const translations = generateTranslations(enumDef);

            // Register the branded enum
            registry.register(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(registry.has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should successfully register any i18n branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(i18nBrandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumRegistry();
            const translations = generateTranslations(enumDef);

            // Register the i18n branded enum
            registry.register(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(registry.has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should successfully register branded enum with explicit name', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.string({ minLength: 1, maxLength: 30 }),
            ({ brandedEnum, enumDef }, explicitName) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register with explicit name
              registry.register(brandedEnum, translations, explicitName);

              // Property: hasEnum should return true after registration
              expect(registry.has(brandedEnum)).toBe(true);
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('EnumTranslationRegistry (legacy)', () => {
      it('should successfully register any branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the branded enum
            registry.register(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(registry.has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should successfully register any i18n branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(i18nBrandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the i18n branded enum
            registry.register(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(registry.has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('I18nEngine', () => {
      beforeEach(() => {
        I18nEngine.resetAll();
      });

      afterEach(() => {
        I18nEngine.resetAll();
      });

      it('should successfully register any branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });
            const translations = generateTranslations(enumDef);

            // Register the branded enum
            engine.registerEnum(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(engine.hasEnum(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should successfully register any i18n branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(i18nBrandedEnumArb, ({ brandedEnum, enumDef }) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });
            const translations = generateTranslations(enumDef);

            // Register the i18n branded enum
            engine.registerEnum(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(engine.hasEnum(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('PluginI18nEngine', () => {
      beforeEach(() => {
        PluginI18nEngine.resetAll();
      });

      afterEach(() => {
        PluginI18nEngine.resetAll();
      });

      it('should successfully register any branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            // Reset before each property test iteration
            PluginI18nEngine.resetAll();

            const engine = new PluginI18nEngine<TestLanguage>(
              languageDefinitions,
              { defaultLanguage: 'en-US' },
            );
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the branded enum
            engine.registerEnum(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            // Note: PluginI18nEngine uses getEnumRegistry().has() internally
            expect(engine.getEnumRegistry().has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should successfully register any i18n branded enum and hasEnum should return true', () => {
        fc.assert(
          fc.property(i18nBrandedEnumArb, ({ brandedEnum, enumDef }) => {
            // Reset before each property test iteration
            PluginI18nEngine.resetAll();

            const engine = new PluginI18nEngine<TestLanguage>(
              languageDefinitions,
              { defaultLanguage: 'en-US' },
            );
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the i18n branded enum
            engine.registerEnum(brandedEnum, translations);

            // Property: hasEnum should return true after registration
            expect(engine.getEnumRegistry().has(brandedEnum)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });
    });
  });

  describe('Property 2: Branded Enum Translation Returns Correct Value', () => {
    /**
     * **Property 2: Branded Enum Translation Returns Correct Value**
     *
     * For any registered branded enum, any of its values, and any registered language,
     * calling `translateEnum()` should return the exact translation string that was
     * registered for that value and language combination.
     *
     * **Validates: Requirements 2.1, 2.4, 4.2, 5.2**
     */

    describe('EnumRegistry (v2)', () => {
      it('should return correct translation for any branded enum value and language', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for any i18n branded enum value and language', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the i18n branded enum
              registry.register(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation across all languages for any branded enum', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumRegistry();
            const translations = generateTranslations(enumDef);

            // Register the branded enum
            registry.register(brandedEnum, translations);

            // Property: For each language and each value, translation should be correct
            for (const language of TEST_LANGUAGES) {
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            }
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('EnumTranslationRegistry (legacy)', () => {
      it('should return correct translation for any branded enum value and language', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for any i18n branded enum value and language', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the i18n branded enum
              registry.register(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation across all languages for any branded enum', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the branded enum
            registry.register(brandedEnum, translations);

            // Property: For each language and each value, translation should be correct
            for (const language of TEST_LANGUAGES) {
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            }
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('I18nEngine', () => {
      beforeEach(() => {
        I18nEngine.resetAll();
      });

      afterEach(() => {
        I18nEngine.resetAll();
      });

      it('should return correct translation for any branded enum value and language', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              I18nEngine.resetAll();

              const engine = new I18nEngine(languageDefinitions, {
                defaultLanguage: 'en-US',
              });
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for any i18n branded enum value and language', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              I18nEngine.resetAll();

              const engine = new I18nEngine(languageDefinitions, {
                defaultLanguage: 'en-US',
              });
              const translations = generateTranslations(enumDef);

              // Register the i18n branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation using current language when not specified', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              I18nEngine.resetAll();

              const engine = new I18nEngine(languageDefinitions, {
                defaultLanguage: 'en-US',
              });
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Set the current language
              engine.setLanguage(language);

              // Property: For each enum value, translation without language param should use current language
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('PluginI18nEngine', () => {
      beforeEach(() => {
        PluginI18nEngine.resetAll();
      });

      afterEach(() => {
        PluginI18nEngine.resetAll();
      });

      it('should return correct translation for any branded enum value and language', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              PluginI18nEngine.resetAll();

              const engine = new PluginI18nEngine<TestLanguage>(
                languageDefinitions,
                { defaultLanguage: 'en-US' },
              );
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for any i18n branded enum value and language', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              PluginI18nEngine.resetAll();

              const engine = new PluginI18nEngine<TestLanguage>(
                languageDefinitions,
                { defaultLanguage: 'en-US' },
              );
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the i18n branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation using current language when not specified', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              // Reset before each property test iteration
              PluginI18nEngine.resetAll();

              const engine = new PluginI18nEngine<TestLanguage>(
                languageDefinitions,
                { defaultLanguage: 'en-US' },
              );
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Set the current language
              engine.setLanguage(language);

              // Property: For each enum value, translation without language param should use current language
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  brandedEnum,
                  value,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });

  describe('Property 7: Legacy Registry Language Validation', () => {
    /**
     * **Property 7: Legacy Registry Language Validation**
     *
     * For any branded enum registration in `EnumTranslationRegistry`, if the translations
     * contain a language not in the registry's available languages set, registration
     * should throw an error with the enum name and invalid language.
     *
     * **Validates: Requirements 5.3, 5.4**
     */

    /**
     * Generates an invalid language code that is NOT in TEST_LANGUAGES
     */
    const invalidLanguageArb = fc
      .stringMatching(/^[a-z]{2}(-[A-Z]{2})?$/)
      .filter(
        (lang) =>
          !TEST_LANGUAGES.includes(lang as TestLanguage) && lang.length > 0,
      );

    /**
     * Generates translations with at least one invalid language
     */
    function generateTranslationsWithInvalidLanguage(
      enumDef: Record<string, string>,
      invalidLanguage: string,
    ): Record<string, Record<string, string>> {
      const translations: Record<string, Record<string, string>> = {};

      // Add valid language translations
      translations['en-US'] = {};
      for (const [_key, value] of Object.entries(enumDef)) {
        translations['en-US'][value] = `en-US:${value}`;
      }

      // Add invalid language translation
      translations[invalidLanguage] = {};
      for (const [_key, value] of Object.entries(enumDef)) {
        translations[invalidLanguage][value] = `${invalidLanguage}:${value}`;
      }

      return translations;
    }

    it('should throw error when registering branded enum with invalid language', () => {
      fc.assert(
        fc.property(
          brandedEnumArb,
          invalidLanguageArb,
          ({ brandedEnum, enumDef, componentId }, invalidLanguage) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslationsWithInvalidLanguage(
              enumDef,
              invalidLanguage,
            );

            // Property: Registration should throw an error for invalid language
            expect(() => {
              registry.register(
                brandedEnum,
                translations as Record<TestLanguage, Record<string, string>>,
              );
            }).toThrow();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should throw error when registering i18n branded enum with invalid language', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          invalidLanguageArb,
          ({ brandedEnum, enumDef, componentId }, invalidLanguage) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslationsWithInvalidLanguage(
              enumDef,
              invalidLanguage,
            );

            // Property: Registration should throw an error for invalid language
            expect(() => {
              registry.register(
                brandedEnum,
                translations as Record<TestLanguage, Record<string, string>>,
              );
            }).toThrow();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include enum name in error message when registering branded enum with invalid language', () => {
      fc.assert(
        fc.property(
          brandedEnumArb,
          invalidLanguageArb,
          ({ brandedEnum, enumDef, componentId }, invalidLanguage) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslationsWithInvalidLanguage(
              enumDef,
              invalidLanguage,
            );

            // Property: Error message should include the enum name (component ID)
            try {
              registry.register(
                brandedEnum,
                translations as Record<TestLanguage, Record<string, string>>,
              );
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              const errorMessage = (error as Error).message;
              // Error should mention the enum name (component ID) and the invalid language
              expect(errorMessage).toContain(componentId);
              expect(errorMessage).toContain(invalidLanguage);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include enum name in error message when registering i18n branded enum with invalid language', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          invalidLanguageArb,
          ({ brandedEnum, enumDef, componentId }, invalidLanguage) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslationsWithInvalidLanguage(
              enumDef,
              invalidLanguage,
            );

            // Property: Error message should include the enum name (component ID)
            try {
              registry.register(
                brandedEnum,
                translations as Record<TestLanguage, Record<string, string>>,
              );
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              const errorMessage = (error as Error).message;
              // Error should mention the enum name (component ID) and the invalid language
              expect(errorMessage).toContain(componentId);
              expect(errorMessage).toContain(invalidLanguage);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include explicit enum name in error message when provided', () => {
      fc.assert(
        fc.property(
          brandedEnumArb,
          invalidLanguageArb,
          fc
            .string({ minLength: 1, maxLength: 30 })
            .filter((s) => s.trim().length > 0),
          ({ brandedEnum, enumDef }, invalidLanguage, explicitName) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslationsWithInvalidLanguage(
              enumDef,
              invalidLanguage,
            );

            // Property: Error message should include the explicit enum name
            try {
              registry.register(
                brandedEnum,
                translations as Record<TestLanguage, Record<string, string>>,
                explicitName,
              );
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              const errorMessage = (error as Error).message;
              // Error should mention the explicit name and the invalid language
              expect(errorMessage).toContain(explicitName);
              expect(errorMessage).toContain(invalidLanguage);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not throw error when all languages are valid', () => {
      fc.assert(
        fc.property(brandedEnumArb, ({ brandedEnum, enumDef }) => {
          const registry = new EnumTranslationRegistry<string, TestLanguage>([
            ...TEST_LANGUAGES,
          ]);
          const translations = generateTranslations(enumDef) as Record<
            TestLanguage,
            Record<string, string>
          >;

          // Property: Registration should succeed when all languages are valid
          expect(() => {
            registry.register(brandedEnum, translations);
          }).not.toThrow();
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 3: Traditional Enum Backward Compatibility', () => {
    /**
     * **Property 3: Traditional Enum Backward Compatibility**
     *
     * For any traditional TypeScript enum with valid translations, registration
     * and translation should produce identical results to the previous implementation—
     * registration should succeed, `hasEnum()` should return true, and `translateEnum()`
     * should return the correct translation.
     *
     * **Validates: Requirements 1.4, 2.3**
     */

    describe('EnumRegistry (v2)', () => {
      it('should successfully register traditional enums and hasEnum should return true', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            const registry = new EnumRegistry();
            const translations = generateTranslations(enumDef);

            // Register the traditional enum with explicit name
            registry.register(enumDef, translations, 'TestEnum');

            // Property: hasEnum should return true after registration
            expect(registry.has(enumDef)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for traditional enum values', () => {
        fc.assert(
          fc.property(
            traditionalEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the traditional enum
              registry.register(enumDef, translations, 'TestEnum');

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation across all languages for traditional enums', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            const registry = new EnumRegistry();
            const translations = generateTranslations(enumDef);

            // Register the traditional enum
            registry.register(enumDef, translations, 'TestEnum');

            // Property: For each language and each value, translation should be correct
            for (const language of TEST_LANGUAGES) {
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            }
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('EnumTranslationRegistry (legacy)', () => {
      it('should successfully register traditional enums and hasEnum should return true', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the traditional enum with explicit name
            registry.register(enumDef, translations, 'TestEnum');

            // Property: hasEnum should return true after registration
            expect(registry.has(enumDef)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for traditional enum values', () => {
        fc.assert(
          fc.property(
            traditionalEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the traditional enum
              registry.register(enumDef, translations, 'TestEnum');

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should return correct translation across all languages for traditional enums', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the traditional enum
            registry.register(enumDef, translations, 'TestEnum');

            // Property: For each language and each value, translation should be correct
            for (const language of TEST_LANGUAGES) {
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = registry.translate(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            }
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('I18nEngine', () => {
      beforeEach(() => {
        I18nEngine.resetAll();
      });

      afterEach(() => {
        I18nEngine.resetAll();
      });

      it('should successfully register traditional enums and hasEnum should return true', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            I18nEngine.resetAll();

            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });
            const translations = generateTranslations(enumDef);

            // Register the traditional enum with explicit name
            engine.registerEnum(enumDef, translations, 'TestEnum');

            // Property: hasEnum should return true after registration
            expect(engine.hasEnum(enumDef)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for traditional enum values', () => {
        fc.assert(
          fc.property(
            traditionalEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ enumDef }, language) => {
              I18nEngine.resetAll();

              const engine = new I18nEngine(languageDefinitions, {
                defaultLanguage: 'en-US',
              });
              const translations = generateTranslations(enumDef);

              // Register the traditional enum
              engine.registerEnum(enumDef, translations, 'TestEnum');

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('PluginI18nEngine', () => {
      beforeEach(() => {
        PluginI18nEngine.resetAll();
      });

      afterEach(() => {
        PluginI18nEngine.resetAll();
      });

      it('should successfully register traditional enums and hasEnum should return true', () => {
        fc.assert(
          fc.property(traditionalEnumArb, ({ enumDef }) => {
            PluginI18nEngine.resetAll();

            const engine = new PluginI18nEngine<TestLanguage>(
              languageDefinitions,
              {
                defaultLanguage: 'en-US',
              },
            );
            const translations = generateTranslations(enumDef) as Record<
              TestLanguage,
              Record<string, string>
            >;

            // Register the traditional enum with explicit name
            engine.registerEnum(enumDef, translations, 'TestEnum');

            // Property: hasEnum should return true after registration
            expect(engine.getEnumRegistry().has(enumDef)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('should return correct translation for traditional enum values', () => {
        fc.assert(
          fc.property(
            traditionalEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ enumDef }, language) => {
              PluginI18nEngine.resetAll();

              const engine = new PluginI18nEngine<TestLanguage>(
                languageDefinitions,
                {
                  defaultLanguage: 'en-US',
                },
              );
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the traditional enum
              engine.registerEnum(enumDef, translations, 'TestEnum');

              // Property: For each enum value, translation should return the exact registered string
              for (const [_key, value] of Object.entries(enumDef)) {
                const expectedTranslation = translations[language][value];
                const actualTranslation = engine.translateEnum(
                  enumDef,
                  value,
                  language,
                );
                expect(actualTranslation).toBe(expectedTranslation);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });

  describe('Property 4: Enum Name Resolution', () => {
    /**
     * **Property 4: Enum Name Resolution**
     *
     * For any branded enum, the resolved enum name should be:
     * - The explicitly provided `enumName` parameter if one was given
     * - Otherwise, the component ID extracted from the branded enum (without `i18n:` prefix)
     *
     * This resolved name should appear in error messages when translation fails.
     *
     * **Validates: Requirements 1.2, 1.3, 7.4**
     */

    describe('EnumRegistry (v2)', () => {
      it('should use component ID as enum name when no explicit name provided', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            ({ brandedEnum, enumDef, componentId }) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register without explicit name
              registry.register(brandedEnum, translations);

              // Property: Error message should contain the component ID when translation fails
              try {
                registry.translate(brandedEnum, 'nonexistent-value', 'en-US');
                expect(true).toBe(false); // Should not reach here
              } catch (error) {
                const errorMessage = (error as Error).message;
                // The error should mention the value, not necessarily the enum name
                expect(errorMessage).toContain('nonexistent-value');
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should use explicit name when provided for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc
              .string({ minLength: 1, maxLength: 30 })
              .filter((s) => s.trim().length > 0),
            ({ brandedEnum, enumDef }, explicitName) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register with explicit name
              registry.register(brandedEnum, translations, explicitName);

              // Property: Registration should succeed
              expect(registry.has(brandedEnum)).toBe(true);
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should use i18n component ID (without prefix) as enum name for i18n branded enums', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            ({ brandedEnum, enumDef, componentId }) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register without explicit name
              registry.register(brandedEnum, translations);

              // Property: Registration should succeed and hasEnum should return true
              expect(registry.has(brandedEnum)).toBe(true);
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('EnumTranslationRegistry (legacy)', () => {
      it('should use component ID as enum name when no explicit name provided', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            ({ brandedEnum, enumDef, componentId }) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register without explicit name
              registry.register(brandedEnum, translations);

              // Property: Error message should contain the component ID when translation fails
              try {
                registry.translate(brandedEnum, 'nonexistent-value', 'en-US');
                expect(true).toBe(false); // Should not reach here
              } catch (error) {
                const errorMessage = (error as Error).message;
                // The error should mention the value
                expect(errorMessage).toContain('nonexistent-value');
              }
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should use explicit name when provided for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc
              .string({ minLength: 1, maxLength: 30 })
              .filter((s) => s.trim().length > 0),
            ({ brandedEnum, enumDef }, explicitName) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register with explicit name
              registry.register(brandedEnum, translations, explicitName);

              // Property: Registration should succeed
              expect(registry.has(brandedEnum)).toBe(true);
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should throw error for unregistered branded enum', () => {
        fc.assert(
          fc.property(brandedEnumArb, ({ brandedEnum }) => {
            const registry = new EnumTranslationRegistry<string, TestLanguage>([
              ...TEST_LANGUAGES,
            ]);

            // Property: Translating an unregistered enum should throw an error
            expect(() => {
              registry.translate(brandedEnum, 'any-value', 'en-US');
            }).toThrow();
          }),
          { numRuns: 100 },
        );
      });
    });
  });

  describe('Property 5: isBrandedEnum Detection Accuracy', () => {
    /**
     * **Property 5: isBrandedEnum Detection Accuracy**
     *
     * For any object, `isBrandedEnum()` should return:
     * - `true` if and only if the object is a branded enum (has valid enum ID)
     * - `false` for traditional enums, null, undefined, primitives, and other objects
     *
     * **Validates: Requirements 1.5, 6.1, 6.2, 6.3**
     */

    it('should return true for any branded enum', () => {
      fc.assert(
        fc.property(brandedEnumArb, ({ brandedEnum }) => {
          expect(isBrandedEnum(brandedEnum)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should return true for any i18n branded enum', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum }) => {
          expect(isBrandedEnum(brandedEnum)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should return false for traditional enums (plain objects)', () => {
      fc.assert(
        fc.property(traditionalEnumArb, ({ enumDef }) => {
          expect(isBrandedEnum(enumDef)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it('should return false for null', () => {
      expect(isBrandedEnum(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isBrandedEnum(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.string(), fc.integer(), fc.double(), fc.boolean()),
          (primitive) => {
            expect(isBrandedEnum(primitive)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return false for arrays', () => {
      fc.assert(
        fc.property(fc.array(fc.anything()), (arr) => {
          expect(isBrandedEnum(arr)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it('should return false for objects without __brand property', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string().filter((s) => s !== '__brand'),
            fc.string(),
          ),
          (obj) => {
            expect(isBrandedEnum(obj)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 6: getBrandedEnumComponentId Extraction', () => {
    /**
     * **Property 6: getBrandedEnumComponentId Extraction**
     *
     * For any object, `getBrandedEnumComponentId()` should return:
     * - The component ID (with `i18n:` prefix stripped) for branded enums
     * - `null` for traditional enums and non-enum objects
     *
     * **Validates: Requirements 7.1, 7.2, 7.3**
     */

    it('should return component ID for branded enums', () => {
      fc.assert(
        fc.property(brandedEnumArb, ({ brandedEnum, componentId }) => {
          const extractedId = getBrandedEnumComponentId(brandedEnum);
          expect(extractedId).toBe(componentId);
        }),
        { numRuns: 100 },
      );
    });

    it('should return component ID without i18n: prefix for i18n branded enums', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          const extractedId = getBrandedEnumComponentId(brandedEnum);
          // The i18n: prefix should be stripped
          expect(extractedId).toBe(componentId);
        }),
        { numRuns: 100 },
      );
    });

    it('should return null for traditional enums', () => {
      fc.assert(
        fc.property(traditionalEnumArb, ({ enumDef }) => {
          expect(getBrandedEnumComponentId(enumDef)).toBeNull();
        }),
        { numRuns: 100 },
      );
    });

    it('should return null for null', () => {
      expect(getBrandedEnumComponentId(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(getBrandedEnumComponentId(undefined)).toBeNull();
    });

    it('should return null for primitive values', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.string(), fc.integer(), fc.double(), fc.boolean()),
          (primitive) => {
            expect(getBrandedEnumComponentId(primitive)).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return null for arrays', () => {
      fc.assert(
        fc.property(fc.array(fc.anything()), (arr) => {
          expect(getBrandedEnumComponentId(arr)).toBeNull();
        }),
        { numRuns: 100 },
      );
    });

    it('should return null for objects without __brand property', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string().filter((s) => s !== '__brand'),
            fc.string(),
          ),
          (obj) => {
            expect(getBrandedEnumComponentId(obj)).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 8: Missing Translation Error Handling', () => {
    /**
     * **Property 8: Missing Translation Error Handling**
     *
     * For any registered branded enum, attempting to translate a value that doesn't
     * exist in the translations should throw an error that includes the enum name
     * (resolved per Property 4).
     *
     * **Validates: Requirements 2.2**
     */

    /**
     * Generates a value that is guaranteed not to be in the enum
     */
    const nonExistentValueArb = fc
      .string({ minLength: 10, maxLength: 30 })
      .filter((s) => s.startsWith('nonexistent_'));

    describe('EnumRegistry (v2)', () => {
      it('should throw error when translating non-existent value for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                registry.translate(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should throw error when translating non-existent value for i18n branded enum', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the i18n branded enum
              registry.register(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                registry.translate(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should include value in error message when translation missing', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumRegistry();
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: Error message should contain the missing value
              const nonExistentValue = 'nonexistent_value_test';
              try {
                registry.translate(brandedEnum, nonExistentValue, language);
                expect(true).toBe(false); // Should not reach here
              } catch (error) {
                const errorMessage = (error as Error).message;
                expect(errorMessage).toContain(nonExistentValue);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('EnumTranslationRegistry (legacy)', () => {
      it('should throw error when translating non-existent value for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                registry.translate(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should throw error when translating non-existent value for i18n branded enum', () => {
        fc.assert(
          fc.property(
            i18nBrandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the i18n branded enum
              registry.register(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                registry.translate(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });

      it('should include value in error message when translation missing', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              const registry = new EnumTranslationRegistry<
                string,
                TestLanguage
              >([...TEST_LANGUAGES]);
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              registry.register(brandedEnum, translations);

              // Property: Error message should contain the missing value
              const nonExistentValue = 'nonexistent_value_test';
              try {
                registry.translate(brandedEnum, nonExistentValue, language);
                expect(true).toBe(false); // Should not reach here
              } catch (error) {
                const errorMessage = (error as Error).message;
                expect(errorMessage).toContain(nonExistentValue);
              }
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('I18nEngine', () => {
      beforeEach(() => {
        I18nEngine.resetAll();
      });

      afterEach(() => {
        I18nEngine.resetAll();
      });

      it('should throw error when translating non-existent value for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              I18nEngine.resetAll();

              const engine = new I18nEngine(languageDefinitions, {
                defaultLanguage: 'en-US',
              });
              const translations = generateTranslations(enumDef);

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                engine.translateEnum(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe('PluginI18nEngine', () => {
      beforeEach(() => {
        PluginI18nEngine.resetAll();
      });

      afterEach(() => {
        PluginI18nEngine.resetAll();
      });

      it('should throw error when translating non-existent value for branded enum', () => {
        fc.assert(
          fc.property(
            brandedEnumArb,
            fc.constantFrom(...TEST_LANGUAGES),
            ({ brandedEnum, enumDef }, language) => {
              PluginI18nEngine.resetAll();

              const engine = new PluginI18nEngine<TestLanguage>(
                languageDefinitions,
                {
                  defaultLanguage: 'en-US',
                },
              );
              const translations = generateTranslations(enumDef) as Record<
                TestLanguage,
                Record<string, string>
              >;

              // Register the branded enum
              engine.registerEnum(brandedEnum, translations);

              // Property: Translating a non-existent value should throw
              const nonExistentValue =
                'nonexistent_value_' + Math.random().toString(36);
              expect(() => {
                engine.translateEnum(brandedEnum, nonExistentValue, language);
              }).toThrow();
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });
});
