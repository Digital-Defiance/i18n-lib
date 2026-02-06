/**
 * Property-based tests for I18nEngine string key enum methods
 *
 * **Feature: string-key-enum-registration**
 *
 * These tests verify universal properties that should hold across all valid
 * inputs for string key enum translation via I18nEngine.
 */
import type {
  BrandedEnumValue,
  AnyBrandedEnum,
} from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';

// Test languages
const TEST_LANGUAGES = ['en-US', 'es', 'de'] as const;

// Language definitions for engines
const languageDefinitions = [
  { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
  { id: 'es', name: 'Spanish', code: 'es' },
  { id: 'de', name: 'German', code: 'de' },
] as const;

// Counter to ensure unique component IDs across test runs
// This is necessary because branded-enum caches enums globally by ID
let componentIdCounter = 0;

/**
 * Generates a unique component ID (kebab-case string with unique suffix)
 * The unique suffix ensures no collisions with the global branded-enum registry
 */
const uniqueComponentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,20}$/)
  .filter((s) => s.length > 0 && !s.endsWith('-') && !s.includes('--'))
  .map((base) => `${base}-p3-${componentIdCounter++}`);

/**
 * Generates a valid enum key (PascalCase string)
 */
const enumKeyArb = fc
  .stringMatching(/^[A-Z][a-zA-Z0-9]{0,19}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a valid enum value suffix (lowercase string for namespacing)
 */
const enumValueSuffixArb = fc
  .stringMatching(/^[a-z][a-z0-9_]{0,19}$/)
  .filter((s) => s.length > 0 && !s.endsWith('_') && !s.includes('__'));

/**
 * Generates an i18n branded enum (with i18n: prefix) for string key registration
 * with unique prefixed values to avoid collisions
 */
const i18nBrandedEnumArb = fc
  .tuple(
    uniqueComponentIdArb,
    fc.array(fc.tuple(enumKeyArb, enumValueSuffixArb), {
      minLength: 1,
      maxLength: 5,
    }),
  )
  .map(([componentId, keyValuePairs]) => {
    // Ensure unique keys and values
    const uniqueKeys = new Set<string>();
    const uniqueValues = new Set<string>();
    const filteredPairs: [string, string][] = [];

    for (const [key, valueSuffix] of keyValuePairs) {
      // Prefix value with componentId to ensure uniqueness across enums
      const prefixedValue = `${componentId}.${valueSuffix}`;
      if (!uniqueKeys.has(key) && !uniqueValues.has(prefixedValue)) {
        uniqueKeys.add(key);
        uniqueValues.add(prefixedValue);
        filteredPairs.push([key, prefixedValue]);
      }
    }

    if (filteredPairs.length === 0) {
      // Fallback to a default pair if all were duplicates
      filteredPairs.push(['Default', `${componentId}.default`]);
    }

    const enumDef = Object.fromEntries(filteredPairs) as Record<string, string>;
    return {
      componentId,
      enumDef,
      brandedEnum: createI18nStringKeys(componentId, enumDef),
    };
  });

/**
 * Generates translations for a given enum definition and component ID
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

/**
 * Helper to get enum values from a branded enum.
 * Returns the actual string values that can be used with translateStringKey.
 */
function getEnumValues(
  brandedEnum: AnyBrandedEnum,
): BrandedEnumValue<typeof brandedEnum>[] {
  // Get all values from the branded enum, excluding internal properties
  return Object.entries(brandedEnum)
    .filter(([key]) => !key.startsWith('__'))
    .map(([, value]) => value) as BrandedEnumValue<typeof brandedEnum>[];
}

describe('I18nEngine String Key Property-Based Tests', () => {
  describe('Feature: string-key-enum-registration, Property 3: Translation Resolution Round-Trip', () => {
    /**
     * **Property 3: Translation Resolution Round-Trip**
     *
     * For any registered branded string key enum and any key value from that enum,
     * calling `translateStringKey(keyValue)` SHALL produce the same result as calling
     * `translate(componentId, keyValue)` where `componentId` is the enum's component ID.
     *
     * **Validates: Requirements 2.2, 2.3**
     */

    beforeEach(() => {
      I18nEngine.resetAll();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should produce the same result as translate() for any registered string key value', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.constantFrom(...TEST_LANGUAGES),
          ({ brandedEnum, componentId, enumDef }, language) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Generate translations for the component
            const translations = generateTranslations(enumDef);

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: For each key value, translateStringKey should produce
            // the same result as translate(componentId, keyValue)
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              const translateStringKeyResult = engine.translateStringKey(
                value,
                undefined,
                language,
              );
              const translateResult = engine.translate(
                componentId,
                value,
                undefined,
                language,
              );

              expect(translateStringKeyResult).toBe(translateResult);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce the same result as translate() using current language when not specified', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.constantFrom(...TEST_LANGUAGES),
          ({ brandedEnum, componentId, enumDef }, language) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Generate translations for the component
            const translations = generateTranslations(enumDef);

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Set the current language
            engine.setLanguage(language);

            // Property: For each key value, translateStringKey without language param
            // should produce the same result as translate without language param
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              const translateStringKeyResult = engine.translateStringKey(value);
              const translateResult = engine.translate(componentId, value);

              expect(translateStringKeyResult).toBe(translateResult);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce the same result as translate() with variables', () => {
      // Generate a branded enum with variable placeholders in translations
      const enumWithVariablesArb = fc
        .tuple(
          uniqueComponentIdArb,
          fc.array(fc.tuple(enumKeyArb, enumValueSuffixArb), {
            minLength: 1,
            maxLength: 3,
          }),
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }),
            count: fc.integer({ min: 0, max: 1000 }),
          }),
        )
        .map(([componentId, keyValuePairs, variables]) => {
          // Ensure unique keys and values
          const uniqueKeys = new Set<string>();
          const uniqueValues = new Set<string>();
          const filteredPairs: [string, string][] = [];

          for (const [key, valueSuffix] of keyValuePairs) {
            const prefixedValue = `${componentId}.${valueSuffix}`;
            if (!uniqueKeys.has(key) && !uniqueValues.has(prefixedValue)) {
              uniqueKeys.add(key);
              uniqueValues.add(prefixedValue);
              filteredPairs.push([key, prefixedValue]);
            }
          }

          if (filteredPairs.length === 0) {
            filteredPairs.push(['Default', `${componentId}.default`]);
          }

          const enumDef = Object.fromEntries(filteredPairs) as Record<
            string,
            string
          >;

          // Generate translations with variable placeholders
          const translations: Record<string, Record<string, string>> = {};
          for (const lang of TEST_LANGUAGES) {
            translations[lang] = {};
            for (const [_key, value] of Object.entries(enumDef)) {
              // Include variable placeholders in translation
              translations[lang][value] = `${lang}:${value} - {name} ({count})`;
            }
          }

          return {
            componentId,
            enumDef,
            translations,
            variables,
            brandedEnum: createI18nStringKeys(componentId, enumDef),
          };
        });

      fc.assert(
        fc.property(
          enumWithVariablesArb,
          fc.constantFrom(...TEST_LANGUAGES),
          (
            {
              brandedEnum,
              componentId,
              enumDef: _enumDef,
              translations,
              variables,
            },
            language,
          ) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: For each key value, translateStringKey with variables
            // should produce the same result as translate with variables
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              const translateStringKeyResult = engine.translateStringKey(
                value,
                variables,
                language,
              );
              const translateResult = engine.translate(
                componentId,
                value,
                variables,
                language,
              );

              expect(translateStringKeyResult).toBe(translateResult);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should resolve component ID correctly from string key value', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          ({ brandedEnum, componentId, enumDef }) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Generate translations for the component
            const translations = generateTranslations(enumDef);

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            const registeredComponentId =
              engine.registerStringKeyEnum(brandedEnum);

            // Property: The registered component ID should match the original
            expect(registeredComponentId).toBe(componentId);

            // Property: For each key value, the translation should work
            // (this implicitly verifies component ID resolution)
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              const result = engine.translateStringKey(value);
              // Should not throw and should return a valid translation
              expect(typeof result).toBe('string');
              expect(result.length).toBeGreaterThan(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should work correctly with multiple registered enums', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 2, maxLength: 4 }),
          fc.constantFrom(...TEST_LANGUAGES),
          (enumDataArray, language) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if we don't have at least 2 unique enums
            if (uniqueEnumData.length < 2) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components and enums
            for (const {
              brandedEnum,
              componentId,
              enumDef,
            } of uniqueEnumData) {
              const translations = generateTranslations(enumDef);
              engine.register({
                id: componentId,
                strings: translations,
              });
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: For each enum and each key value, translateStringKey
            // should produce the same result as translate
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              const enumValues = getEnumValues(brandedEnum);
              for (const value of enumValues) {
                const translateStringKeyResult = engine.translateStringKey(
                  value,
                  undefined,
                  language,
                );
                const translateResult = engine.translate(
                  componentId,
                  value,
                  undefined,
                  language,
                );

                expect(translateStringKeyResult).toBe(translateResult);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce consistent results across multiple calls', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.integer({ min: 2, max: 5 }),
          ({ brandedEnum, componentId, enumDef }, callCount) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Generate translations for the component
            const translations = generateTranslations(enumDef);

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: Multiple calls to translateStringKey should produce
            // the same result as multiple calls to translate
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              const translateStringKeyResults: string[] = [];
              const translateResults: string[] = [];

              for (let i = 0; i < callCount; i++) {
                translateStringKeyResults.push(
                  engine.translateStringKey(value),
                );
                translateResults.push(engine.translate(componentId, value));
              }

              // All translateStringKey results should be identical
              expect(
                translateStringKeyResults.every(
                  (r) => r === translateStringKeyResults[0],
                ),
              ).toBe(true);

              // All translate results should be identical
              expect(
                translateResults.every((r) => r === translateResults[0]),
              ).toBe(true);

              // translateStringKey and translate should produce the same result
              expect(translateStringKeyResults[0]).toBe(translateResults[0]);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Feature: string-key-enum-registration, Property 4: Safe Translation Never Throws', () => {
    /**
     * **Property 4: Safe Translation Never Throws**
     *
     * For any string value (valid or invalid), calling `safeTranslateStringKey`
     * SHALL NOT throw an exception and SHALL return either a valid translation
     * or a placeholder string.
     *
     * **Validates: Requirements 3.3, 3.4**
     */

    beforeEach(() => {
      I18nEngine.resetAll();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should never throw for any random string input', () => {
      fc.assert(
        fc.property(fc.string(), (randomString) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Property: safeTranslateStringKey should never throw for any input
          let result: string;
          expect(() => {
            result = engine.safeTranslateStringKey(
              randomString as BrandedEnumValue<AnyBrandedEnum>,
            );
          }).not.toThrow();

          // Result should be a string (either translation or placeholder)
          expect(typeof result!).toBe('string');
          expect(result!.length).toBeGreaterThan(0);

          // For unregistered keys, result should be a placeholder in format [unknown.key]
          expect(result!).toBe(`[unknown.${randomString}]`);
        }),
        { numRuns: 100 },
      );
    });

    it('should never throw for valid registered string key values', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.constantFrom(...TEST_LANGUAGES),
          ({ brandedEnum, componentId, enumDef }, language) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Generate translations for the component
            const translations = generateTranslations(enumDef);

            // Register the component with translations
            engine.register({
              id: componentId,
              strings: translations,
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: safeTranslateStringKey should never throw for registered keys
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              let result: string;
              expect(() => {
                result = engine.safeTranslateStringKey(
                  value,
                  undefined,
                  language,
                );
              }).not.toThrow();

              // Result should be a valid translation string
              expect(typeof result!).toBe('string');
              expect(result!.length).toBeGreaterThan(0);

              // For registered keys with translations, result should be the translation
              expect(result!).toBe(`${language}:${value}`);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should never throw for registered keys with missing translations', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          ({ brandedEnum, componentId, enumDef: _enumDef }) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register the component with EMPTY translations (no translations for any key)
            engine.register({
              id: componentId,
              strings: {
                'en-US': {},
                es: {},
                de: {},
              },
            });

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: safeTranslateStringKey should never throw even for missing translations
            const enumValues = getEnumValues(brandedEnum);
            for (const value of enumValues) {
              let result: string;
              expect(() => {
                result = engine.safeTranslateStringKey(value);
              }).not.toThrow();

              // Result should be a placeholder string in format [componentId.key]
              expect(typeof result!).toBe('string');
              expect(result!.length).toBeGreaterThan(0);
              expect(result!).toBe(`[${componentId}.${value}]`);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should never throw for arbitrary unicode strings', () => {
      // Test with explicit unicode characters and emoji
      const unicodeStrings = fc.constantFrom(
        '你好世界', // Chinese
        'مرحبا بالعالم', // Arabic
        'שלום עולם', // Hebrew
        'Привет мир', // Russian
        '🎉🚀💻🌍', // Emoji
        'Ñoño', // Spanish special chars
        'Ümläut', // German umlauts
        'Ελληνικά', // Greek
        '日本語', // Japanese
        '한국어', // Korean
        'Ça va?', // French
        'Cześć świat', // Polish
        '🔥💯🎯✨🌟', // More emoji
        '\u0000\u0001\u0002', // Control characters
        '\uFEFF', // BOM
        '\u200B\u200C\u200D', // Zero-width characters
        'mixed 中文 and English 🎉',
      );

      fc.assert(
        fc.property(unicodeStrings, (unicodeString) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Property: safeTranslateStringKey should never throw for any unicode input
          let result: string;
          expect(() => {
            result = engine.safeTranslateStringKey(
              unicodeString as BrandedEnumValue<AnyBrandedEnum>,
            );
          }).not.toThrow();

          // Result should be a string (placeholder for unregistered keys)
          expect(typeof result!).toBe('string');
          expect(result!).toBe(`[unknown.${unicodeString}]`);
        }),
        { numRuns: 100 },
      );
    });

    it('should never throw for empty strings', () => {
      // Reset before test
      I18nEngine.resetAll();

      // Create engine with languages
      const engine = new I18nEngine(languageDefinitions, {
        defaultLanguage: 'en-US',
      });

      // Property: safeTranslateStringKey should never throw for empty string
      let result: string;
      expect(() => {
        result = engine.safeTranslateStringKey(
          '' as BrandedEnumValue<AnyBrandedEnum>,
        );
      }).not.toThrow();

      // Result should be a placeholder for empty string
      expect(typeof result!).toBe('string');
      expect(result!).toBe('[unknown.]');
    });

    it('should never throw for strings with special characters', () => {
      const specialCharStrings = fc.constantFrom(
        'key.with.dots',
        'key-with-dashes',
        'key_with_underscores',
        'key with spaces',
        'key\twith\ttabs',
        'key\nwith\nnewlines',
        '{{template.pattern}}',
        '{variable}',
        '[bracket.notation]',
        'null',
        'undefined',
        '__proto__',
        'constructor',
        'prototype',
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        '%00null%00byte',
      );

      fc.assert(
        fc.property(specialCharStrings, (specialString) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Property: safeTranslateStringKey should never throw for special characters
          let result: string;
          expect(() => {
            result = engine.safeTranslateStringKey(
              specialString as BrandedEnumValue<AnyBrandedEnum>,
            );
          }).not.toThrow();

          // Result should be a placeholder string
          expect(typeof result!).toBe('string');
          expect(result!).toBe(`[unknown.${specialString}]`);
        }),
        { numRuns: 100 },
      );
    });

    it('should return valid translation or placeholder for any input with variables', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.record({
            name: fc.string(),
            count: fc.integer(),
            value: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
          }),
          (randomString, variables) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Property: safeTranslateStringKey should never throw even with variables
            let result: string;
            expect(() => {
              result = engine.safeTranslateStringKey(
                randomString as BrandedEnumValue<AnyBrandedEnum>,
                variables,
              );
            }).not.toThrow();

            // Result should be a string (placeholder for unregistered keys)
            expect(typeof result!).toBe('string');
            expect(result!).toBe(`[unknown.${randomString}]`);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return valid translation or placeholder for any input with language parameter', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom(...TEST_LANGUAGES, 'invalid-lang', 'xx-XX', ''),
          (randomString, language) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Property: safeTranslateStringKey should never throw even with invalid language
            let result: string;
            expect(() => {
              result = engine.safeTranslateStringKey(
                randomString as BrandedEnumValue<AnyBrandedEnum>,
                undefined,
                language,
              );
            }).not.toThrow();

            // Result should be a string (placeholder for unregistered keys)
            expect(typeof result!).toBe('string');
            expect(result!).toBe(`[unknown.${randomString}]`);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Feature: string-key-enum-registration, Property 5: Registration Check Consistency', () => {
    /**
     * **Property 5: Registration Check Consistency**
     *
     * For any branded string key enum, `hasStringKeyEnum(enum)` SHALL return `true`
     * if and only if `registerStringKeyEnum(enum)` has been called previously on
     * the same engine instance.
     *
     * **Validates: Requirements 4.2, 4.3, 4.4**
     */

    beforeEach(() => {
      I18nEngine.resetAll();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should return false before registration and true after registration', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Register the component (required for registration to work)
          engine.register({
            id: componentId,
            strings: { 'en-US': {}, es: {}, de: {} },
          });

          // Property: hasStringKeyEnum should return false before registration
          expect(engine.hasStringKeyEnum(brandedEnum)).toBe(false);

          // Register the branded string key enum
          engine.registerStringKeyEnum(brandedEnum);

          // Property: hasStringKeyEnum should return true after registration
          expect(engine.hasStringKeyEnum(brandedEnum)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('should use object reference equality for registration check', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          i18nBrandedEnumArb,
          (
            { brandedEnum: enum1, componentId: componentId1 },
            { brandedEnum: enum2, componentId: componentId2 },
          ) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register both components
            engine.register({
              id: componentId1,
              strings: { 'en-US': {}, es: {}, de: {} },
            });
            engine.register({
              id: componentId2,
              strings: { 'en-US': {}, es: {}, de: {} },
            });

            // Register only the first enum
            engine.registerStringKeyEnum(enum1);

            // Property: hasStringKeyEnum should return true for registered enum (by reference)
            expect(engine.hasStringKeyEnum(enum1)).toBe(true);

            // Property: hasStringKeyEnum should return false for different enum object
            // (even if it might have similar structure, it's a different reference)
            // Note: enum2 is a different object reference, so it should return false
            if (enum1 !== enum2) {
              expect(engine.hasStringKeyEnum(enum2)).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should maintain registration state across multiple checks', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.integer({ min: 2, max: 10 }),
          ({ brandedEnum, componentId }, checkCount) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register the component
            engine.register({
              id: componentId,
              strings: { 'en-US': {}, es: {}, de: {} },
            });

            // Property: Multiple checks before registration should all return false
            for (let i = 0; i < checkCount; i++) {
              expect(engine.hasStringKeyEnum(brandedEnum)).toBe(false);
            }

            // Register the branded string key enum
            engine.registerStringKeyEnum(brandedEnum);

            // Property: Multiple checks after registration should all return true
            for (let i = 0; i < checkCount; i++) {
              expect(engine.hasStringKeyEnum(brandedEnum)).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly track registration for multiple enums', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 2, maxLength: 5 }),
          (enumDataArray) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if we don't have at least 2 unique enums
            if (uniqueEnumData.length < 2) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components
            for (const { componentId } of uniqueEnumData) {
              engine.register({
                id: componentId,
                strings: { 'en-US': {}, es: {}, de: {} },
              });
            }

            // Property: All enums should return false before any registration
            for (const { brandedEnum } of uniqueEnumData) {
              expect(engine.hasStringKeyEnum(brandedEnum)).toBe(false);
            }

            // Register enums one by one and verify state
            const registeredEnums: AnyBrandedEnum[] = [];
            for (const { brandedEnum } of uniqueEnumData) {
              // Register this enum
              engine.registerStringKeyEnum(brandedEnum);
              registeredEnums.push(brandedEnum);

              // Property: All registered enums should return true
              for (const registeredEnum of registeredEnums) {
                expect(engine.hasStringKeyEnum(registeredEnum)).toBe(true);
              }

              // Property: All not-yet-registered enums should return false
              for (const { brandedEnum: otherEnum } of uniqueEnumData) {
                if (!registeredEnums.includes(otherEnum)) {
                  expect(engine.hasStringKeyEnum(otherEnum)).toBe(false);
                }
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return consistent results for the same enum reference', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.integer({ min: 1, max: 5 }),
          ({ brandedEnum, componentId }, registerCount) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register the component
            engine.register({
              id: componentId,
              strings: { 'en-US': {}, es: {}, de: {} },
            });

            // Register the same enum multiple times (idempotent operation)
            for (let i = 0; i < registerCount; i++) {
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: hasStringKeyEnum should consistently return true
            // regardless of how many times the enum was registered
            expect(engine.hasStringKeyEnum(brandedEnum)).toBe(true);

            // Verify multiple checks return the same result
            const results: boolean[] = [];
            for (let i = 0; i < 5; i++) {
              results.push(engine.hasStringKeyEnum(brandedEnum));
            }

            // All results should be true and identical
            expect(results.every((r) => r === true)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should isolate registration state between different engine instances', () => {
      let instanceCounter = 0;
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create two separate engine instances with unique instance keys
          const instanceKey1 = `engine-p5-${instanceCounter++}`;
          const instanceKey2 = `engine-p5-${instanceCounter++}`;

          const engine1 = new I18nEngine(
            languageDefinitions,
            { defaultLanguage: 'en-US' },
            { instanceKey: instanceKey1 },
          );
          const engine2 = new I18nEngine(
            languageDefinitions,
            { defaultLanguage: 'en-US' },
            { instanceKey: instanceKey2 },
          );

          // Register the component on both engines
          engine1.register({
            id: componentId,
            strings: { 'en-US': {}, es: {}, de: {} },
          });
          engine2.register({
            id: componentId,
            strings: { 'en-US': {}, es: {}, de: {} },
          });

          // Register the enum only on engine1
          engine1.registerStringKeyEnum(brandedEnum);

          // Property: hasStringKeyEnum should return true on engine1
          expect(engine1.hasStringKeyEnum(brandedEnum)).toBe(true);

          // Property: hasStringKeyEnum should return false on engine2
          // (registration is per-engine instance)
          expect(engine2.hasStringKeyEnum(brandedEnum)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Feature: string-key-enum-registration, Property 6: Enum Retrieval Completeness', () => {
    /**
     * **Property 6: Enum Retrieval Completeness**
     *
     * For any set of registered branded string key enums, `getStringKeyEnums()`
     * SHALL return an array containing exactly those enums that were registered,
     * with their correct component IDs.
     *
     * **Validates: Requirements 5.1, 5.2, 5.3**
     */

    beforeEach(() => {
      I18nEngine.resetAll();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should return empty array when no enums are registered', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Property: getStringKeyEnums should return empty array when no enums registered
          const result = engine.getStringKeyEnums();

          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it('should return exactly the registered enums with correct component IDs', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 1, maxLength: 5 }),
          (enumDataArray) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if no unique enums
            if (uniqueEnumData.length === 0) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components and enums
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              engine.register({
                id: componentId,
                strings: { 'en-US': {}, es: {}, de: {} },
              });
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: getStringKeyEnums should return exactly the registered enums
            const result = engine.getStringKeyEnums();

            // Verify the count matches
            expect(result.length).toBe(uniqueEnumData.length);

            // Verify each registered enum is in the result with correct component ID
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              const entry = result.find((e) => e.enumObj === brandedEnum);
              expect(entry).toBeDefined();
              expect(entry!.componentId).toBe(componentId);
            }

            // Verify no extra entries exist
            for (const entry of result) {
              const found = uniqueEnumData.some(
                ({ brandedEnum }) => brandedEnum === entry.enumObj,
              );
              expect(found).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return readonly array with enumObj and componentId properties', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          // Reset before each property test iteration
          I18nEngine.resetAll();

          // Create engine with languages
          const engine = new I18nEngine(languageDefinitions, {
            defaultLanguage: 'en-US',
          });

          // Register the component and enum
          engine.register({
            id: componentId,
            strings: { 'en-US': {}, es: {}, de: {} },
          });
          engine.registerStringKeyEnum(brandedEnum);

          // Property: getStringKeyEnums should return array with correct structure
          const result = engine.getStringKeyEnums();

          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(1);

          // Verify the entry has the correct properties
          const entry = result[0];
          expect(entry).toHaveProperty('enumObj');
          expect(entry).toHaveProperty('componentId');
          expect(entry.enumObj).toBe(brandedEnum);
          expect(entry.componentId).toBe(componentId);
          expect(typeof entry.componentId).toBe('string');
        }),
        { numRuns: 100 },
      );
    });

    it('should maintain completeness after multiple registrations', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 2, maxLength: 5 }),
          (enumDataArray) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if we don't have at least 2 unique enums
            if (uniqueEnumData.length < 2) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components first
            for (const { componentId } of uniqueEnumData) {
              engine.register({
                id: componentId,
                strings: { 'en-US': {}, es: {}, de: {} },
              });
            }

            // Register enums one by one and verify completeness at each step
            const registeredEnums: typeof uniqueEnumData = [];
            for (const enumData of uniqueEnumData) {
              engine.registerStringKeyEnum(enumData.brandedEnum);
              registeredEnums.push(enumData);

              // Property: getStringKeyEnums should return exactly the registered enums so far
              const result = engine.getStringKeyEnums();
              expect(result.length).toBe(registeredEnums.length);

              // Verify all registered enums are present
              for (const { brandedEnum, componentId } of registeredEnums) {
                const entry = result.find((e) => e.enumObj === brandedEnum);
                expect(entry).toBeDefined();
                expect(entry!.componentId).toBe(componentId);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle idempotent registration without duplicates', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          fc.integer({ min: 2, max: 5 }),
          ({ brandedEnum, componentId }, registerCount) => {
            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register the component
            engine.register({
              id: componentId,
              strings: { 'en-US': {}, es: {}, de: {} },
            });

            // Register the same enum multiple times
            for (let i = 0; i < registerCount; i++) {
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: getStringKeyEnums should return exactly one entry
            // regardless of how many times the enum was registered
            const result = engine.getStringKeyEnums();

            expect(result.length).toBe(1);
            expect(result[0].enumObj).toBe(brandedEnum);
            expect(result[0].componentId).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return consistent results across multiple calls', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 1, maxLength: 4 }),
          fc.integer({ min: 2, max: 5 }),
          (enumDataArray, callCount) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if no unique enums
            if (uniqueEnumData.length === 0) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components and enums
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              engine.register({
                id: componentId,
                strings: { 'en-US': {}, es: {}, de: {} },
              });
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: Multiple calls to getStringKeyEnums should return consistent results
            const results: ReturnType<typeof engine.getStringKeyEnums>[] = [];
            for (let i = 0; i < callCount; i++) {
              results.push(engine.getStringKeyEnums());
            }

            // All results should have the same length
            expect(results.every((r) => r.length === results[0].length)).toBe(
              true,
            );

            // All results should contain the same enums
            for (const result of results) {
              for (const { brandedEnum, componentId } of uniqueEnumData) {
                const entry = result.find((e) => e.enumObj === brandedEnum);
                expect(entry).toBeDefined();
                expect(entry!.componentId).toBe(componentId);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should isolate retrieval results between different engine instances', () => {
      let instanceCounter = 0;
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          i18nBrandedEnumArb,
          (
            { brandedEnum: enum1, componentId: componentId1 },
            { brandedEnum: enum2, componentId: componentId2 },
          ) => {
            // Skip if same component ID (would conflict)
            if (componentId1 === componentId2) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create two separate engine instances with unique instance keys
            const instanceKey1 = `engine-p6-${instanceCounter++}`;
            const instanceKey2 = `engine-p6-${instanceCounter++}`;

            const engine1 = new I18nEngine(
              languageDefinitions,
              { defaultLanguage: 'en-US' },
              { instanceKey: instanceKey1 },
            );
            const engine2 = new I18nEngine(
              languageDefinitions,
              { defaultLanguage: 'en-US' },
              { instanceKey: instanceKey2 },
            );

            // Register components on both engines
            engine1.register({
              id: componentId1,
              strings: { 'en-US': {}, es: {}, de: {} },
            });
            engine2.register({
              id: componentId2,
              strings: { 'en-US': {}, es: {}, de: {} },
            });

            // Register enum1 only on engine1
            engine1.registerStringKeyEnum(enum1);

            // Register enum2 only on engine2
            engine2.registerStringKeyEnum(enum2);

            // Property: getStringKeyEnums should return only enums registered on that instance
            const result1 = engine1.getStringKeyEnums();
            const result2 = engine2.getStringKeyEnums();

            // Engine1 should only have enum1
            expect(result1.length).toBe(1);
            expect(result1[0].enumObj).toBe(enum1);
            expect(result1[0].componentId).toBe(componentId1);

            // Engine2 should only have enum2
            expect(result2.length).toBe(1);
            expect(result2[0].enumObj).toBe(enum2);
            expect(result2[0].componentId).toBe(componentId2);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve enum object references in returned entries', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 1, maxLength: 4 }),
          (enumDataArray) => {
            // Filter to ensure unique component IDs
            const seenComponentIds = new Set<string>();
            const uniqueEnumData = enumDataArray.filter(({ componentId }) => {
              if (seenComponentIds.has(componentId)) {
                return false;
              }
              seenComponentIds.add(componentId);
              return true;
            });

            // Skip if no unique enums
            if (uniqueEnumData.length === 0) {
              return;
            }

            // Reset before each property test iteration
            I18nEngine.resetAll();

            // Create engine with languages
            const engine = new I18nEngine(languageDefinitions, {
              defaultLanguage: 'en-US',
            });

            // Register all components and enums
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              engine.register({
                id: componentId,
                strings: { 'en-US': {}, es: {}, de: {} },
              });
              engine.registerStringKeyEnum(brandedEnum);
            }

            // Property: Returned entries should have the exact same object references
            const result = engine.getStringKeyEnums();

            for (const { brandedEnum } of uniqueEnumData) {
              const entry = result.find((e) => e.enumObj === brandedEnum);
              expect(entry).toBeDefined();
              // Verify it's the exact same object reference (not a copy)
              expect(entry!.enumObj).toBe(brandedEnum);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
