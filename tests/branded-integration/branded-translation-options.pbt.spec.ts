/**
 * Property-based tests for BrandedTranslationOptions validation.
 *
 * Feature: branded-interface-integration, Property 11: BrandedTranslationOptions validates all fields correctly
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */

import { resetInterfaceRegistry } from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { BrandedTranslationOptions } from '../../src/branded-translation-options';

/**
 * Arbitrary for valid variables: plain object with string keys and string/number values.
 */
const validVariablesArb: fc.Arbitrary<Record<string, string | number>> = fc
  .array(
    fc.tuple(
      fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,10}$/),
      fc.oneof(fc.string(), fc.integer()),
    ),
    { minLength: 0, maxLength: 5 },
  )
  .map((pairs) => {
    const obj: Record<string, string | number> = {};
    for (const [k, v] of pairs) {
      obj[k] = v;
    }
    return obj;
  });

/**
 * Arbitrary for a valid non-empty language string.
 */
const validLanguageArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z][a-zA-Z0-9-]{0,10}$/)
  .filter((s) => s.trim().length > 0);

/**
 * Arbitrary for a valid fallback string (any string).
 */
const validFallbackArb: fc.Arbitrary<string> = fc.string();

/**
 * Arbitrary for a fully valid TranslationOptions object (all fields optional).
 */
const validTranslationOptionsArb = fc
  .record({
    variables: fc.option(validVariablesArb, { nil: undefined }),
    language: fc.option(validLanguageArb, { nil: undefined }),
    fallback: fc.option(validFallbackArb, { nil: undefined }),
  })
  .map((rec) => {
    const obj: Record<string, unknown> = {};
    if (rec.variables !== undefined) obj['variables'] = rec.variables;
    if (rec.language !== undefined) obj['language'] = rec.language;
    if (rec.fallback !== undefined) obj['fallback'] = rec.fallback;
    return obj;
  });

/**
 * Arbitrary for invalid variables values (not a plain object with string/number values).
 */
const invalidVariablesArb: fc.Arbitrary<unknown> = fc.oneof(
  // Array instead of object
  fc.array(fc.string()),
  // Object with boolean values
  fc.constant({ key: true }),
  // Object with nested object values
  fc.constant({ key: { nested: 'value' } }),
  // Object with null values
  fc.constant({ key: null }),
  // Object with undefined values
  fc.constant({ key: undefined }),
);

/**
 * Arbitrary for invalid language values (empty or whitespace-only strings).
 */
const invalidLanguageArb: fc.Arbitrary<string> = fc.constantFrom(
  '',
  '   ',
  '\t',
  '\n',
);

describe('Feature: branded-interface-integration, Property 11: BrandedTranslationOptions validates all fields correctly', () => {
  beforeEach(() => {
    resetInterfaceRegistry();
  });

  afterEach(() => {
    resetInterfaceRegistry();
  });

  /**
   * Property 11: BrandedTranslationOptions validates all fields correctly
   *
   * For any object, BrandedTranslationOptions.validate() should return true iff:
   * - language (when present) is a non-empty string
   * - variables (when present) is a plain object with string/number values
   * - fallback (when present) is a string
   *
   * **Validates: Requirements 6.1, 6.2, 6.3**
   */
  it('Property 11: valid TranslationOptions objects pass validation', () => {
    fc.assert(
      fc.property(validTranslationOptionsArb, (opts) => {
        expect(BrandedTranslationOptions.validate(opts)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 11: objects with invalid variables fail validation', () => {
    fc.assert(
      fc.property(invalidVariablesArb, (badVars) => {
        const opts = { variables: badVars };
        expect(BrandedTranslationOptions.validate(opts)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 11: objects with empty/whitespace language fail validation', () => {
    fc.assert(
      fc.property(invalidLanguageArb, (badLang) => {
        const opts = { language: badLang };
        expect(BrandedTranslationOptions.validate(opts)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 11: objects with non-string language fail validation', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
        (badLang) => {
          const opts = { language: badLang };
          expect(BrandedTranslationOptions.validate(opts)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 11: objects with non-string fallback fail validation', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant({}),
        ),
        (badFallback) => {
          const opts = { fallback: badFallback };
          expect(BrandedTranslationOptions.validate(opts)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 11: empty object passes validation (all fields optional)', () => {
    expect(BrandedTranslationOptions.validate({})).toBe(true);
  });
});
