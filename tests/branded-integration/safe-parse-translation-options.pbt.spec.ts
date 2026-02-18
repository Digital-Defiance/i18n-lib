/**
 * Property-based tests for safeParseTranslationOptions discriminated union.
 *
 * Feature: branded-interface-integration, Property 13: safeParseTranslationOptions returns valid discriminated union
 * **Validates: Requirements 6.5**
 */

import { resetInterfaceRegistry } from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { safeParseTranslationOptions } from '../../src/branded-translation-options';

/**
 * Arbitrary for valid TranslationOptions objects (should parse successfully).
 */
const validOptionsArb = fc
  .record({
    variables: fc.option(
      fc
        .array(
          fc.tuple(
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,8}$/),
            fc.oneof(fc.string(), fc.integer()),
          ),
          { minLength: 0, maxLength: 3 },
        )
        .map((pairs) => {
          const obj: Record<string, string | number> = {};
          for (const [k, v] of pairs) {
            obj[k] = v;
          }
          return obj;
        }),
      { nil: undefined },
    ),
    language: fc.option(
      fc
        .stringMatching(/^[a-zA-Z][a-zA-Z0-9-]{0,10}$/)
        .filter((s) => s.trim().length > 0),
      { nil: undefined },
    ),
    fallback: fc.option(fc.string(), { nil: undefined }),
  })
  .map((rec) => {
    const obj: Record<string, unknown> = {};
    if (rec.variables !== undefined) obj['variables'] = rec.variables;
    if (rec.language !== undefined) obj['language'] = rec.language;
    if (rec.fallback !== undefined) obj['fallback'] = rec.fallback;
    return obj;
  });

/**
 * Arbitrary for invalid inputs that should fail parsing.
 */
const invalidInputArb: fc.Arbitrary<unknown> = fc.oneof(
  // Non-object types
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
  fc.constant(undefined),
  // Arrays
  fc.array(fc.string()),
  // Objects with invalid language (empty string)
  fc.constant({ language: '' }),
  // Objects with invalid language (whitespace)
  fc.constant({ language: '   ' }),
  // Objects with invalid variables (array)
  fc.constant({ variables: [1, 2, 3] }),
  // Objects with invalid variables (boolean values)
  fc.constant({ variables: { key: true } }),
  // Objects with non-string fallback
  fc.constant({ fallback: 42 }),
);

describe('Feature: branded-interface-integration, Property 13: safeParseTranslationOptions returns valid discriminated union', () => {
  beforeEach(() => {
    resetInterfaceRegistry();
  });

  afterEach(() => {
    resetInterfaceRegistry();
  });

  /**
   * Property 13: safeParseTranslationOptions returns valid discriminated union
   *
   * For any input value, safeParseTranslationOptions() should return an object
   * with a boolean success field. When success is true, the result should contain
   * a value field. When success is false, the result should contain an error field
   * with a message and code.
   *
   * **Validates: Requirements 6.5**
   */
  it('Property 13: valid inputs produce success results with value field', () => {
    fc.assert(
      fc.property(validOptionsArb, (opts) => {
        const result = safeParseTranslationOptions(opts);

        // Must have a boolean success field
        expect(typeof result.success).toBe('boolean');
        expect(result.success).toBe(true);

        if (result.success) {
          // Success result must have a value field
          expect(result.value).toBeDefined();
          expect(typeof result.value).toBe('object');
          expect(result.value).not.toBeNull();
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 13: invalid inputs produce failure results with error field', () => {
    fc.assert(
      fc.property(invalidInputArb, (input) => {
        const result = safeParseTranslationOptions(input);

        // Must have a boolean success field
        expect(typeof result.success).toBe('boolean');
        expect(result.success).toBe(false);

        if (!result.success) {
          // Failure result must have an error field
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('object');

          // Error must have message and code
          expect(typeof result.error.message).toBe('string');
          expect(result.error.message.length).toBeGreaterThan(0);
          expect(typeof result.error.code).toBe('string');
          expect(result.error.code.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 13: result is always a valid discriminated union for arbitrary values', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = safeParseTranslationOptions(input);

        // Must always have a boolean success field
        expect(typeof result.success).toBe('boolean');

        if (result.success) {
          // Success: must have value
          expect('value' in result).toBe(true);
          expect(result.value).toBeDefined();
        } else {
          // Failure: must have error with message and code
          expect('error' in result).toBe(true);
          expect(result.error).toBeDefined();
          expect(typeof result.error.message).toBe('string');
          expect(typeof result.error.code).toBe('string');
        }
      }),
      { numRuns: 100 },
    );
  });
});
