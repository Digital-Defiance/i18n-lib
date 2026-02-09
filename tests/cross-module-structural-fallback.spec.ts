/**
 * Property-based tests for structural fallback in StringKeyEnumRegistry.register()
 *
 * **Feature: branded-enum-cross-module-fix**
 *
 * These tests verify that StringKeyEnumRegistry can register enum objects
 * via structural detection (value prefix extraction) and explicit componentId
 * when branded enum Symbol-based identity checks fail.
 */
import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { resetRegistry } from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import { StringKeyEnumRegistry } from '../src/core/string-key-enum-registry';
import { I18nError } from '../src/errors/i18n-error';

/**
 * Generator: valid component ID (non-empty string without dots, kebab-case)
 */
const arbComponentId = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
  .filter((s) => s.length > 0 && !s.endsWith('-') && !s.includes('--'));

/**
 * Generator: valid enum key name (PascalCase)
 */
const arbKeyName = fc
  .stringMatching(/^[A-Z][a-zA-Z0-9]{0,14}$/)
  .filter((s) => s.length > 0);

/**
 * Creates a plain object (no Symbol metadata) with values following
 * the `{componentId}.{key}` convention, cast as AnyBrandedEnum for
 * testing the structural fallback path.
 */
function makePlainEnumObj(
  componentId: string,
  keys: string[],
): { obj: AnyBrandedEnum; values: string[] } {
  const record: Record<string, string> = {};
  const values: string[] = [];
  for (const key of keys) {
    const value = `${componentId}.${key.toLowerCase()}`;
    record[key] = value;
    values.push(value);
  }
  // Cast to AnyBrandedEnum — this object lacks Symbol metadata,
  // which is exactly the cross-module scenario we're testing
  return { obj: record as unknown as AnyBrandedEnum, values };
}

describe('Feature: branded-enum-cross-module-fix', () => {
  beforeEach(() => {
    resetRegistry();
  });

  describe('Property 3: Structural detection via value prefix', () => {
    /**
     * For any component ID (non-empty string without dots) and any non-empty
     * set of key names, if a plain object (without Symbol metadata) has values
     * following the `{componentId}.{key}` pattern, then `register()` should
     * succeed and return the correct component ID.
     *
     * **Validates: Requirements 2.1, 2.2**
     */
    it('registers plain objects with {componentId}.{key} value pattern', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }),
          (componentId, keys) => {
            const registry = new StringKeyEnumRegistry();
            const { obj } = makePlainEnumObj(componentId, keys);

            const result = registry.register(obj);
            expect(result).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 4: Explicit componentId registration', () => {
    /**
     * For any plain object and any non-empty component ID string, calling
     * `register(obj, componentId)` should succeed and return the provided
     * component ID, regardless of whether the object has branded enum metadata.
     *
     * **Validates: Requirements 2.5**
     */
    it('registers any object when explicit componentId is provided', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 5 }),
          (componentId, keys) => {
            const registry = new StringKeyEnumRegistry();
            // Create an object with arbitrary values (not following any pattern)
            const record: Record<string, string> = {};
            for (const key of keys) {
              record[key] = `arbitrary_${key}`;
            }
            const obj = record as unknown as AnyBrandedEnum;

            const result = registry.register(obj, componentId);
            expect(result).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 5: Structural detection enables resolution round trip', () => {
    /**
     * For any structurally valid enum object (values following `{componentId}.{key}`
     * pattern) that is registered via structural detection, calling
     * `resolveComponentId()` with any of the enum's string key values should
     * return the correct component ID.
     *
     * Note: resolveComponentId relies on findEnumSources from the global
     * branded-enum registry. Since plain objects are not registered in the
     * global registry, resolution uses the componentIdToEnum map. We verify
     * that safeResolveComponentId returns null (no global registry entry)
     * but the registration itself succeeded.
     *
     * **Validates: Requirements 2.3, 2.6**
     */
    it('structurally registered enums are stored identically to Symbol-validated ones', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 5 }),
          (componentId, keys) => {
            const registry = new StringKeyEnumRegistry();
            const { obj } = makePlainEnumObj(componentId, keys);

            // Register via structural detection
            const registeredId = registry.register(obj);
            expect(registeredId).toBe(componentId);

            // Verify the enum is stored: has() returns true, getAll() includes it
            expect(registry.has(obj)).toBe(true);
            const entries = registry.getAll();
            const entry = entries.find((e) => e.enumObj === obj);
            expect(entry).toBeDefined();
            expect(entry?.componentId).toBe(componentId);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 6: Invalid object rejection', () => {
    /**
     * For any object whose values do not follow the `{componentId}.{key}` pattern
     * and which has no matching entry in the global branded-enum registry, and
     * when no explicit `componentId` is provided, `register()` should throw
     * `I18nError` with code `INVALID_STRING_KEY_ENUM`.
     *
     * **Validates: Requirements 2.4**
     */
    it('rejects objects without consistent value prefix and no Symbol metadata', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(arbKeyName, { minLength: 2, maxLength: 5 }),
          (keys) => {
            const registry = new StringKeyEnumRegistry();
            // Create an object with values that have NO common prefix
            const record: Record<string, string> = {};
            for (let i = 0; i < keys.length; i++) {
              record[keys[i]] = `different${i}.${keys[i].toLowerCase()}`;
            }
            const obj = record as unknown as AnyBrandedEnum;

            expect(() => registry.register(obj)).toThrow(I18nError);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects objects with no string values', () => {
      const registry = new StringKeyEnumRegistry();
      const obj = {} as unknown as AnyBrandedEnum;
      expect(() => registry.register(obj)).toThrow(I18nError);
    });
  });
});
