/**
 * Property-based tests for has() component ID fallback in StringKeyEnumRegistry
 *
 * **Feature: branded-enum-cross-module-fix**
 *
 * These tests verify that StringKeyEnumRegistry.has() correctly detects
 * already-registered enums even when the enum object reference differs
 * due to cross-module duplication.
 */
import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { resetRegistry } from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import { StringKeyEnumRegistry } from '../src/core/string-key-enum-registry';

/**
 * Generator: valid component ID (non-empty kebab-case string without dots)
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
 * Creates a plain object with values following the `{componentId}.{key}` convention,
 * cast as AnyBrandedEnum for testing the structural fallback path.
 */
function makePlainEnumObj(componentId: string, keys: string[]): AnyBrandedEnum {
  const record: Record<string, string> = {};
  for (const key of keys) {
    record[key] = `${componentId}.${key.toLowerCase()}`;
  }
  return record as unknown as AnyBrandedEnum;
}

describe('Feature: branded-enum-cross-module-fix', () => {
  beforeEach(() => {
    resetRegistry();
  });

  describe('Property 7: has() component ID fallback', () => {
    /**
     * For any registered enum with component ID C, creating a different object
     * reference that resolves to the same component ID C and calling has()
     * should return true.
     *
     * **Validates: Requirements 3.1**
     */
    it('has() returns true for a different object with the same component ID as a registered enum', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }),
          (componentId, keys) => {
            const registry = new StringKeyEnumRegistry();

            // Register the first object
            const obj1 = makePlainEnumObj(componentId, keys);
            registry.register(obj1);

            // Create a second, distinct object with the same structure
            const obj2 = makePlainEnumObj(componentId, keys);

            // obj2 is a different reference
            expect(obj2).not.toBe(obj1);

            // has() should still return true via component ID fallback
            expect(registry.has(obj2)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 8: has() returns false for unregistered', () => {
    /**
     * For any object whose component ID does not match any registered enum's
     * component ID, has() should return false.
     *
     * **Validates: Requirements 3.3**
     */
    it('has() returns false when no enum with matching component ID is registered', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }),
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }),
          (registeredId, registeredKeys, queryId, queryKeys) => {
            // Ensure the two component IDs are different
            fc.pre(registeredId !== queryId);

            const registry = new StringKeyEnumRegistry();

            // Register one enum
            const registered = makePlainEnumObj(registeredId, registeredKeys);
            registry.register(registered);

            // Query with a different component ID
            const query = makePlainEnumObj(queryId, queryKeys);
            expect(registry.has(query)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
