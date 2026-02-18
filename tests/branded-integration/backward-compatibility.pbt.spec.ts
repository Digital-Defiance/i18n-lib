/**
 * Property-based tests for backward compatibility of constants registration.
 *
 * Feature: branded-interface-integration, Property 2: Registration without schema preserves backward compatibility
 * **Validates: Requirements 1.4**
 */

import * as fc from 'fast-check';
import { ConstantsRegistry } from '../../src/core/constants-registry';

/**
 * Generates a valid component ID (lowercase kebab-case).
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{1,15}$/)
  .filter((s) => !s.endsWith('-'));

/**
 * Generates a valid II18nConstants object with string/number values.
 * These are the value types actually used in template replacement.
 */
const constantsValueArb: fc.Arbitrary<string | number> = fc.oneof(
  fc.string({ minLength: 0, maxLength: 50 }),
  fc.integer({ min: -10000, max: 10000 }),
  fc.double({ min: -1000, max: 1000, noNaN: true }),
);

/**
 * Generates a valid constants key (alphanumeric, starting with uppercase).
 */
const constantsKeyArb = fc
  .stringMatching(/^[A-Z][a-zA-Z0-9]{0,15}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a non-empty constants record satisfying II18nConstants.
 */
const constantsArb = fc
  .array(fc.tuple(constantsKeyArb, constantsValueArb), {
    minLength: 1,
    maxLength: 8,
  })
  .map((pairs) => {
    const record: Record<string, string | number> = {};
    for (const [key, value] of pairs) {
      record[key] = value;
    }
    return record;
  })
  .filter((r) => Object.keys(r).length > 0);

describe('Feature: branded-interface-integration, Property 2: Registration without schema preserves backward compatibility', () => {
  /**
   * Property 2: Registration without schema preserves backward compatibility
   *
   * For any valid constants object (satisfying II18nConstants), calling
   * register(componentId, constants) without a schema parameter should succeed
   * and store the constants identically to the pre-integration behavior.
   *
   * **Validates: Requirements 1.4**
   */
  it('Property 2: register without schema succeeds and stores constants identically', () => {
    fc.assert(
      fc.property(componentIdArb, constantsArb, (componentId, constants) => {
        const registry = new ConstantsRegistry();

        // Registration without schema should never throw
        expect(() => {
          registry.register(componentId, constants);
        }).not.toThrow();

        // The component should be registered
        expect(registry.has(componentId)).toBe(true);

        // The stored constants should match the input (shallow copy)
        const stored = registry.get(componentId);
        expect(stored).toBeDefined();
        for (const key of Object.keys(constants)) {
          expect(stored?.[key]).toBe(constants[key]);
        }

        // The merged view should contain all keys
        const merged = registry.getMerged();
        for (const key of Object.keys(constants)) {
          expect(merged[key]).toBe(constants[key]);
        }

        // Ownership should be tracked
        for (const key of Object.keys(constants)) {
          expect(registry.resolveOwner(key)).toBe(componentId);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Complementary: register without schema is idempotent (second call is no-op).
   *
   * **Validates: Requirements 1.4**
   */
  it('Property 2 (idempotency): second register without schema is a no-op', () => {
    fc.assert(
      fc.property(
        componentIdArb,
        constantsArb,
        constantsArb,
        (componentId, first, second) => {
          const registry = new ConstantsRegistry();

          registry.register(componentId, first);
          const afterFirst = { ...registry.get(componentId) };

          // Second register for same component is a no-op
          registry.register(componentId, second);
          const afterSecond = registry.get(componentId);

          // Should still have the first set of constants
          expect(afterSecond).toEqual(afterFirst);
        },
      ),
      { numRuns: 100 },
    );
  });
});
