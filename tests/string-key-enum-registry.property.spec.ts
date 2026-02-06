/**
 * Property-based tests for StringKeyEnumRegistry
 *
 * **Feature: string-key-enum-registration**
 *
 * These tests verify universal properties that should hold across all valid
 * inputs for string key enum registration.
 */
import * as fc from 'fast-check';
import { createI18nStringKeys } from '../src/branded-string-key';
import { StringKeyEnumRegistry } from '../src/core/string-key-enum-registry';

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
 * Generates a valid enum value (lowercase string with dots for namespacing)
 */
const enumValueArb = fc
  .stringMatching(/^[a-z][a-z0-9_.]{0,29}$/)
  .filter((s) => s.length > 0 && !s.endsWith('.') && !s.includes('..'));

/**
 * Generates an i18n branded enum (with i18n: prefix) for string key registration
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
      // Prefix value with componentId to ensure uniqueness across enums
      const prefixedValue = `${componentId}.${value}`;
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
 * Generates a positive integer for registration count
 */
const registrationCountArb = fc.integer({ min: 1, max: 10 });

describe('StringKeyEnumRegistry Property-Based Tests', () => {
  describe('Feature: string-key-enum-registration, Property 1: Registration Idempotence', () => {
    /**
     * **Property 1: Registration Idempotence**
     *
     * For any branded string key enum, registering it multiple times SHALL produce
     * the same result as registering it once, and the registry SHALL contain exactly
     * one entry for that enum.
     *
     * **Validates: Requirements 1.5**
     */

    it('should return the same component ID when registering the same enum multiple times', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          registrationCountArb,
          ({ brandedEnum, componentId }, registrationCount) => {
            const registry = new StringKeyEnumRegistry();

            // Register the enum multiple times
            const results: string[] = [];
            for (let i = 0; i < registrationCount; i++) {
              results.push(registry.register(brandedEnum));
            }

            // Property: All registration calls should return the same component ID
            expect(results.every((r) => r === componentId)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should contain exactly one entry after multiple registrations of the same enum', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          registrationCountArb,
          ({ brandedEnum, componentId }, registrationCount) => {
            const registry = new StringKeyEnumRegistry();

            // Register the enum multiple times
            for (let i = 0; i < registrationCount; i++) {
              registry.register(brandedEnum);
            }

            // Property: Registry should contain exactly one entry
            const entries = registry.getAll();
            expect(entries.length).toBe(1);

            // Property: The entry should have the correct enum and component ID
            expect(entries[0].enumObj).toBe(brandedEnum);
            expect(entries[0].componentId).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should have has() return true after any number of registrations', () => {
      fc.assert(
        fc.property(
          i18nBrandedEnumArb,
          registrationCountArb,
          ({ brandedEnum }, registrationCount) => {
            const registry = new StringKeyEnumRegistry();

            // Register the enum multiple times
            for (let i = 0; i < registrationCount; i++) {
              registry.register(brandedEnum);
            }

            // Property: has() should return true
            expect(registry.has(brandedEnum)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return the same component ID when re-registering an enum created with the same component ID', () => {
      fc.assert(
        fc.property(
          componentIdArb,
          fc.array(fc.tuple(enumKeyArb, enumValueArb), {
            minLength: 1,
            maxLength: 3,
          }),
          registrationCountArb,
          (componentId, keyValuePairs, registrationCount) => {
            const registry = new StringKeyEnumRegistry();

            // Create enum with unique keys/values
            const uniqueKeys = new Set<string>();
            const uniqueValues = new Set<string>();
            const filteredPairs: [string, string][] = [];
            for (const [key, value] of keyValuePairs) {
              const prefixedValue = `${componentId}.${value}`;
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

            // Register the enum multiple times (each call to createI18nStringKeys
            // with the same componentId returns the same object due to branded-enum caching)
            const results: string[] = [];
            for (let i = 0; i < registrationCount; i++) {
              const brandedEnum = createI18nStringKeys(componentId, enumDef);
              results.push(registry.register(brandedEnum));
            }

            // Property: All registrations should return the same component ID
            expect(results.every((r) => r === componentId)).toBe(true);

            // Property: Registry should contain exactly one entry
            const entries = registry.getAll();
            expect(entries.length).toBe(1);
            expect(entries[0].componentId).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should maintain idempotence across interleaved registrations of multiple enums', () => {
      fc.assert(
        fc.property(
          fc.array(i18nBrandedEnumArb, { minLength: 2, maxLength: 5 }),
          registrationCountArb,
          (enumDataArray, registrationCount) => {
            const registry = new StringKeyEnumRegistry();

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

            // Register each enum multiple times in interleaved fashion
            for (let i = 0; i < registrationCount; i++) {
              for (const { brandedEnum, componentId } of uniqueEnumData) {
                const result = registry.register(brandedEnum);
                // Property: Each registration should return the correct component ID
                expect(result).toBe(componentId);
              }
            }

            // Property: Registry should contain exactly one entry per unique enum
            const entries = registry.getAll();
            expect(entries.length).toBe(uniqueEnumData.length);

            // Property: Each enum should be registered with correct component ID
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              expect(registry.has(brandedEnum)).toBe(true);
              const entry = entries.find((e) => e.enumObj === brandedEnum);
              expect(entry).toBeDefined();
              expect(entry?.componentId).toBe(componentId);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Feature: string-key-enum-registration, Property 2: Component ID Extraction Consistency', () => {
    /**
     * **Property 2: Component ID Extraction Consistency**
     *
     * For any branded string key enum created with `createI18nStringKeys(componentId, keys)`,
     * the `registerStringKeyEnum` method SHALL extract and return the same `componentId`
     * that was used to create the enum.
     *
     * **Validates: Requirements 1.2, 1.6**
     */

    it('should extract and return the exact component ID used to create the branded enum', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          const registry = new StringKeyEnumRegistry();

          // Register the branded enum
          const extractedId = registry.register(brandedEnum);

          // Property: The extracted component ID must match the original component ID
          expect(extractedId).toBe(componentId);
        }),
        { numRuns: 100 },
      );
    });

    it('should consistently extract the same component ID across multiple registry instances', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          // Create multiple independent registry instances
          const registry1 = new StringKeyEnumRegistry();
          const registry2 = new StringKeyEnumRegistry();
          const registry3 = new StringKeyEnumRegistry();

          // Register the same enum in all registries
          const extractedId1 = registry1.register(brandedEnum);
          const extractedId2 = registry2.register(brandedEnum);
          const extractedId3 = registry3.register(brandedEnum);

          // Property: All registries should extract the same component ID
          expect(extractedId1).toBe(componentId);
          expect(extractedId2).toBe(componentId);
          expect(extractedId3).toBe(componentId);
        }),
        { numRuns: 100 },
      );
    });

    it('should extract component ID correctly for enums with various key counts', () => {
      // Generate enums with varying numbers of keys (1 to 10)
      const enumWithVariableKeysArb = fc
        .tuple(componentIdArb, fc.integer({ min: 1, max: 10 }))
        .chain(([componentId, keyCount]) =>
          fc
            .array(fc.tuple(enumKeyArb, enumValueArb), {
              minLength: keyCount,
              maxLength: keyCount + 5,
            })
            .map((keyValuePairs) => {
              // Ensure unique keys and values
              const uniqueKeys = new Set<string>();
              const uniqueValues = new Set<string>();
              const filteredPairs: [string, string][] = [];

              for (const [key, value] of keyValuePairs) {
                const prefixedValue = `${componentId}.${value}`;
                if (!uniqueKeys.has(key) && !uniqueValues.has(prefixedValue)) {
                  uniqueKeys.add(key);
                  uniqueValues.add(prefixedValue);
                  filteredPairs.push([key, prefixedValue]);
                }
                if (filteredPairs.length >= keyCount) break;
              }

              if (filteredPairs.length === 0) {
                filteredPairs.push(['Default', `${componentId}.default`]);
              }

              const enumDef = Object.fromEntries(filteredPairs) as Record<
                string,
                string
              >;
              return {
                componentId,
                keyCount: filteredPairs.length,
                brandedEnum: createI18nStringKeys(componentId, enumDef),
              };
            }),
        );

      fc.assert(
        fc.property(
          enumWithVariableKeysArb,
          ({ brandedEnum, componentId, keyCount: _keyCount }) => {
            const registry = new StringKeyEnumRegistry();

            // Register the enum
            const extractedId = registry.register(brandedEnum);

            // Property: Component ID extraction should work regardless of key count
            expect(extractedId).toBe(componentId);

            // Verify the enum was stored correctly
            const entries = registry.getAll();
            expect(entries.length).toBe(1);
            expect(entries[0].componentId).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should extract distinct component IDs for different enums', () => {
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

            const registry = new StringKeyEnumRegistry();

            // Register all enums and collect extracted IDs
            const extractedIds: string[] = [];
            for (const { brandedEnum, componentId } of uniqueEnumData) {
              const extractedId = registry.register(brandedEnum);
              extractedIds.push(extractedId);

              // Property: Each extracted ID should match its original component ID
              expect(extractedId).toBe(componentId);
            }

            // Property: All extracted IDs should be distinct
            const uniqueExtractedIds = new Set(extractedIds);
            expect(uniqueExtractedIds.size).toBe(uniqueEnumData.length);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should store the extracted component ID correctly in the registry entry', () => {
      fc.assert(
        fc.property(i18nBrandedEnumArb, ({ brandedEnum, componentId }) => {
          const registry = new StringKeyEnumRegistry();

          // Register the enum
          const extractedId = registry.register(brandedEnum);

          // Get the stored entry
          const entries = registry.getAll();
          const entry = entries.find((e) => e.enumObj === brandedEnum);

          // Property: The stored entry should have the correct component ID
          expect(entry).toBeDefined();
          expect(entry?.componentId).toBe(componentId);
          expect(entry?.componentId).toBe(extractedId);
        }),
        { numRuns: 100 },
      );
    });
  });
});
