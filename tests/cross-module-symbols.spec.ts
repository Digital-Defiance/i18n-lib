/**
 * Property-based tests for cross-module Symbol.for identity
 *
 * **Feature: branded-enum-cross-module-fix**
 *
 * These tests verify that branded enums created by one module copy can be
 * correctly identified and accessed by another module copy, thanks to
 * Symbol.for() using the global symbol registry.
 *
 * The cross-module scenario is simulated by accessing branded enum metadata
 * through freshly obtained Symbol.for() symbols rather than the imported
 * ENUM_ID/ENUM_VALUES constants.
 */
import {
  createBrandedEnum,
  getEnumId,
  getEnumValues,
  isFromEnum,
} from '@digitaldefiance/branded-enum';
import * as fc from 'fast-check';
import { isBrandedEnum } from '../src/branded-enum-utils';

/**
 * The namespaced Symbol.for keys used by branded-enum v0.0.7+.
 * Obtaining these via Symbol.for() simulates a different module copy
 * accessing the same global symbols.
 */
const CROSS_MODULE_ENUM_ID = Symbol.for(
  '@digitaldefiance/branded-enum:ENUM_ID',
);
const CROSS_MODULE_ENUM_VALUES = Symbol.for(
  '@digitaldefiance/branded-enum:ENUM_VALUES',
);

/**
 * Generator: valid enum ID (kebab-case)
 */
const arbEnumId = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
  .filter((s) => s.length > 0 && !s.endsWith('-') && !s.includes('--'));

/**
 * Generator: valid enum key (PascalCase)
 */
const arbKeyName = fc
  .stringMatching(/^[A-Z][a-zA-Z0-9]{0,14}$/)
  .filter((s) => s.length > 0);

/**
 * Counter to ensure unique enum IDs across test runs, avoiding
 * createBrandedEnum's global registry cache returning stale objects.
 */
let enumCounter = 0;

/**
 * Generator: a branded enum with a unique ID and unique key-value pairs.
 * Each generated enum gets a unique suffix to avoid cache collisions.
 */
const arbBrandedEnum = fc
  .tuple(arbEnumId, fc.uniqueArray(arbKeyName, { minLength: 1, maxLength: 10 }))
  .map(([baseId, keys]) => {
    const id = `${baseId}-${++enumCounter}`;
    const obj: Record<string, string> = {};
    for (const key of keys) {
      obj[key] = `${id}.${key.toLowerCase()}`;
    }
    return { id, keys, enumObj: createBrandedEnum(id, obj) };
  });

describe('Feature: branded-enum-cross-module-fix', () => {
  describe('Property 1: Cross-module identity and metadata access', () => {
    /**
     * For any branded enum created with any valid enum ID and any set of string
     * values, when isBrandedEnum(), getEnumId(), and getEnumValues() are called
     * using symbols obtained from Symbol.for() (simulating a different module copy),
     * all three functions should return correct results.
     *
     * **Validates: Requirements 1.3, 1.4, 1.5**
     */
    it('isBrandedEnum() returns true via cross-module symbols', () => {
      fc.assert(
        fc.property(arbBrandedEnum, ({ enumObj }) => {
          // Simulate cross-module: check metadata via Symbol.for() symbols
          const hasId =
            (enumObj as Record<symbol, unknown>)[CROSS_MODULE_ENUM_ID] !==
            undefined;
          const hasValues =
            (enumObj as Record<symbol, unknown>)[CROSS_MODULE_ENUM_VALUES] !==
            undefined;

          expect(hasId).toBe(true);
          expect(hasValues).toBe(true);
          // The library's own isBrandedEnum should also work
          expect(isBrandedEnum(enumObj)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('getEnumId() returns the correct ID via cross-module symbols', () => {
      fc.assert(
        fc.property(arbBrandedEnum, ({ id, enumObj }) => {
          // Access enum ID through the cross-module symbol
          const crossModuleId = (enumObj as Record<symbol, unknown>)[
            CROSS_MODULE_ENUM_ID
          ];
          expect(crossModuleId).toBe(id);

          // The library accessor should agree
          expect(getEnumId(enumObj)).toBe(id);
        }),
        { numRuns: 100 },
      );
    });

    it('getEnumValues() returns the correct values via cross-module symbols', () => {
      fc.assert(
        fc.property(arbBrandedEnum, ({ id, keys, enumObj }) => {
          // Access enum values through the cross-module symbol
          const crossModuleValues = (enumObj as Record<symbol, unknown>)[
            CROSS_MODULE_ENUM_VALUES
          ] as Set<string>;
          const expectedValues = keys.map((k) => `${id}.${k.toLowerCase()}`);

          expect(crossModuleValues).toBeInstanceOf(Set);
          for (const val of expectedValues) {
            expect(crossModuleValues.has(val)).toBe(true);
          }
          expect(crossModuleValues.size).toBe(expectedValues.length);

          // The library accessor should agree
          const libraryValues = getEnumValues(enumObj);
          expect(libraryValues).toBeDefined();
          expect(new Set(libraryValues)).toEqual(new Set(expectedValues));
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 2: Cross-module value membership', () => {
    /**
     * For any branded enum and any string value, isFromEnum(value, enum) called
     * via a simulated cross-module boundary should return true if and only if
     * the value is a member of the enum's value set.
     *
     * **Validates: Requirements 1.6**
     */
    it('isFromEnum() correctly validates membership across module boundaries', () => {
      fc.assert(
        fc.property(
          arbBrandedEnum,
          fc.string({ minLength: 1, maxLength: 30 }),
          ({ id, keys, enumObj }, randomValue) => {
            const memberValues = keys.map((k) => `${id}.${k.toLowerCase()}`);
            const isMember = memberValues.includes(randomValue);

            // isFromEnum should agree with set membership
            expect(isFromEnum(randomValue, enumObj)).toBe(isMember);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('isFromEnum() returns true for all actual enum members', () => {
      fc.assert(
        fc.property(arbBrandedEnum, ({ id, keys, enumObj }) => {
          const memberValues = keys.map((k) => `${id}.${k.toLowerCase()}`);

          for (const val of memberValues) {
            expect(isFromEnum(val, enumObj)).toBe(true);
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});
