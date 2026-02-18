/**
 * Property-based tests for BrandedValidationErrorFormatter output count.
 *
 * Feature: branded-interface-integration, Property 5: Formatter output count matches field error structure
 * **Validates: Requirements 3.2, 3.3**
 */

import type { InterfaceSafeParseFailure } from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { BrandedValidationErrorFormatter } from '../../src/branded-validation-error-formatter';
import type { II18nEngine } from '../../src/interfaces/i18n-engine.interface';

/**
 * Creates a minimal II18nEngine stub whose translate() always throws,
 * forcing the formatter to fall back to raw messages. This isolates the
 * output-count property from translation concerns.
 */
function createStubEngine(): II18nEngine {
  const noop = (): never => {
    throw new Error('no translation');
  };
  return {
    translate: noop,
    safeTranslate: noop,
    t: noop,
    register: noop,
    registerIfNotExists: noop,
    updateStrings: noop,
    hasComponent: () => false,
    getComponents: () => [],
    registerLanguage: noop,
    setLanguage: noop,
    setAdminLanguage: noop,
    getLanguages: () => [],
    hasLanguage: () => false,
    switchToAdmin: noop,
    switchToUser: noop,
    getCurrentLanguage: () => 'en-US',
    validate: noop,
    registerStringKeyEnum: noop,
    translateStringKey: noop,
    safeTranslateStringKey: noop,
    hasStringKeyEnum: () => false,
    getStringKeyEnums: () => [],
    registerConstants: noop,
    registerDeferredSchema: noop,
    updateConstants: noop,
    hasConstants: () => false,
    getConstants: () => undefined,
    getAllConstants: () => [],
    resolveConstantOwner: () => null,
  } as unknown as II18nEngine;
}

/**
 * Arbitrary for a single field error entry.
 */
const fieldErrorArb = fc.record({
  field: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,15}$/),
  message: fc.string({ minLength: 1, maxLength: 50 }),
});

/**
 * Arbitrary for an InterfaceSafeParseFailure with N > 0 field errors.
 */
const failureWithFieldErrorsArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 30 }),
    fc.constantFrom(
      'INVALID_DEFINITION',
      'INVALID_VALUE_TYPE',
      'FIELD_VALIDATION_FAILED',
      'NOT_BRANDED_INSTANCE',
    ) as fc.Arbitrary<
      | 'INVALID_DEFINITION'
      | 'INVALID_VALUE_TYPE'
      | 'FIELD_VALIDATION_FAILED'
      | 'NOT_BRANDED_INSTANCE'
    >,
    fc.option(fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/), {
      nil: undefined,
    }),
    fc.array(fieldErrorArb, { minLength: 1, maxLength: 10 }),
  )
  .map(
    ([message, code, interfaceId, fieldErrors]): InterfaceSafeParseFailure => ({
      success: false as const,
      error: {
        message,
        code,
        input: {},
        interfaceId,
        fieldErrors,
      },
    }),
  );

/**
 * Arbitrary for an InterfaceSafeParseFailure with 0 field errors.
 */
const failureWithoutFieldErrorsArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 30 }),
    fc.constantFrom(
      'INVALID_DEFINITION',
      'INVALID_VALUE_TYPE',
      'FIELD_VALIDATION_FAILED',
      'NOT_BRANDED_INSTANCE',
    ) as fc.Arbitrary<
      | 'INVALID_DEFINITION'
      | 'INVALID_VALUE_TYPE'
      | 'FIELD_VALIDATION_FAILED'
      | 'NOT_BRANDED_INSTANCE'
    >,
    fc.option(fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,20}$/), {
      nil: undefined,
    }),
    fc.constantFrom(
      undefined,
      [] as ReadonlyArray<{ field: string; message: string }>,
    ),
  )
  .map(
    ([message, code, interfaceId, fieldErrors]): InterfaceSafeParseFailure => ({
      success: false as const,
      error: {
        message,
        code,
        input: {},
        interfaceId,
        fieldErrors: fieldErrors as
          | ReadonlyArray<{ field: string; message: string }>
          | undefined,
      },
    }),
  );

describe('Feature: branded-interface-integration, Property 5: Formatter output count matches field error structure', () => {
  /**
   * Property 5: Formatter output count matches field error structure
   *
   * For any InterfaceSafeParseFailure with N field errors (N > 0),
   * format() should return exactly N entries.
   *
   * **Validates: Requirements 3.2, 3.3**
   */
  it('Property 5: format() returns exactly N entries for N > 0 field errors', () => {
    const engine = createStubEngine();
    const formatter = new BrandedValidationErrorFormatter(engine);

    fc.assert(
      fc.property(failureWithFieldErrorsArb, (failure) => {
        const results = formatter.format(failure);
        const expectedCount = failure.error.fieldErrors!.length;

        expect(results).toHaveLength(expectedCount);

        // Each result should have the correct code and a field name
        for (let i = 0; i < results.length; i++) {
          expect(results[i].code).toBe(failure.error.code);
          expect(results[i].field).toBe(failure.error.fieldErrors![i].field);
          // Message should be non-empty (at minimum the raw fallback)
          expect(results[i].message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5 (zero field errors): format() returns exactly 1 entry
   * when the failure has 0 field errors.
   *
   * **Validates: Requirements 3.3**
   */
  it('Property 5: format() returns exactly 1 entry for 0 field errors', () => {
    const engine = createStubEngine();
    const formatter = new BrandedValidationErrorFormatter(engine);

    fc.assert(
      fc.property(failureWithoutFieldErrorsArb, (failure) => {
        const results = formatter.format(failure);

        expect(results).toHaveLength(1);
        expect(results[0].code).toBe(failure.error.code);
        // No field should be set
        expect(results[0].field).toBeUndefined();
        // Message should be the raw error message (fallback)
        expect(results[0].message).toBe(failure.error.message);
      }),
      { numRuns: 100 },
    );
  });
});
