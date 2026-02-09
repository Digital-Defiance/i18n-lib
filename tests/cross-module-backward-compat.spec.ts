/**
 * Property-based tests for backward compatibility and invariants
 *
 * **Feature: branded-enum-cross-module-fix**
 *
 * These tests verify that:
 * - Property 9: The happy path (Symbol-validated branded enums) is unchanged
 *   by the defense-in-depth fallback logic.
 * - Property 10: The global branded-enum registry state is not modified by
 *   StringKeyEnumRegistry operations (structural detection is read-only).
 */
import { resetRegistry, getRegistry } from '@digitaldefiance/branded-enum';
import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import { getBrandedEnumComponentId } from '../src/branded-enum-utils';
import { createI18nStringKeys } from '../src/branded-string-key';
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
 * Counter to ensure unique enum IDs across test runs, avoiding
 * createBrandedEnum's global registry cache returning stale objects.
 */
let enumCounter = 0;

describe('Feature: branded-enum-cross-module-fix', () => {
  beforeEach(() => {
    resetRegistry();
    enumCounter = 0;
  });

  describe('Property 9: Happy path unchanged', () => {
    /**
     * For any valid branded enum (with proper Symbol.for metadata),
     * `register()` should return the same component ID as
     * `getBrandedEnumComponentId()` — the defense-in-depth fallback path
     * should not alter the result when the primary detection succeeds.
     *
     * **Validates: Requirements 4.3**
     */
    it('register() returns the same component ID as getBrandedEnumComponentId() for branded enums', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }),
          (componentId, keys) => {
            const uniqueId = `${componentId}-${++enumCounter}`;
            const keyObj: Record<string, string> = {};
            for (const key of keys) {
              keyObj[key] = `${uniqueId}.${key.toLowerCase()}`;
            }

            // Create a proper branded enum via createI18nStringKeys
            const brandedEnum = createI18nStringKeys(uniqueId, keyObj);

            // Extract component ID via the branded-enum utility
            const expectedId = getBrandedEnumComponentId(brandedEnum);
            expect(expectedId).not.toBeNull();

            // Register via StringKeyEnumRegistry
            const registry = new StringKeyEnumRegistry();
            const registeredId = registry.register(brandedEnum);

            // The registered ID should match the branded enum's component ID
            expect(registeredId).toBe(expectedId);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 10: Global registry state invariant', () => {
    /**
     * For any sequence of register() and has() calls on StringKeyEnumRegistry,
     * the global branded-enum registry (`globalThis.__brandedEnumRegistry__`)
     * should have identical `enums` and `valueIndex` contents before and after
     * the operations — structural detection is read-only.
     *
     * **Validates: Requirements 4.5**
     */
    it('register() and has() do not modify the global branded-enum registry', () => {
      fc.assert(
        fc.property(
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 5 }),
          arbComponentId,
          fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 5 }),
          (brandedId, brandedKeys, plainId, plainKeys) => {
            // Ensure distinct IDs to avoid collisions
            const uniqueBrandedId = `${brandedId}-b${++enumCounter}`;
            const uniquePlainId = `${plainId}-p${++enumCounter}`;
            fc.pre(uniqueBrandedId !== uniquePlainId);

            // Create a proper branded enum (this WILL modify the global registry)
            const brandedKeyObj: Record<string, string> = {};
            for (const key of brandedKeys) {
              brandedKeyObj[key] = `${uniqueBrandedId}.${key.toLowerCase()}`;
            }
            const brandedEnum = createI18nStringKeys(
              uniqueBrandedId,
              brandedKeyObj,
            );

            // Snapshot the global registry AFTER branded enum creation
            const globalRegistry = getRegistry();
            const enumIdsBefore = new Set(globalRegistry.enums.keys());
            const valueIndexKeysBefore = new Set(
              globalRegistry.valueIndex.keys(),
            );
            const valueIndexSnapshotBefore = new Map<string, Set<string>>();
            for (const [value, enumIds] of globalRegistry.valueIndex) {
              valueIndexSnapshotBefore.set(value, new Set(enumIds));
            }

            // Create a plain object (no Symbol metadata) for structural fallback
            const plainKeyObj: Record<string, string> = {};
            for (const key of plainKeys) {
              plainKeyObj[key] = `${uniquePlainId}.${key.toLowerCase()}`;
            }
            const plainObj = plainKeyObj as unknown as AnyBrandedEnum;

            // Perform StringKeyEnumRegistry operations
            const registry = new StringKeyEnumRegistry();
            registry.register(brandedEnum);
            registry.register(plainObj);
            registry.has(brandedEnum);
            registry.has(plainObj);

            // Verify the global registry is unchanged
            const enumIdsAfter = new Set(globalRegistry.enums.keys());
            const valueIndexKeysAfter = new Set(
              globalRegistry.valueIndex.keys(),
            );

            expect(enumIdsAfter).toEqual(enumIdsBefore);
            expect(valueIndexKeysAfter).toEqual(valueIndexKeysBefore);

            // Verify value index entries are unchanged
            for (const [value, enumIds] of globalRegistry.valueIndex) {
              const before = valueIndexSnapshotBefore.get(value);
              expect(before).toBeDefined();
              expect(new Set(enumIds)).toEqual(before);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
