/**
 * Property-based tests for plain vs branded TranslationOptions equivalence.
 *
 * Feature: branded-interface-integration, Property 12: Translation engine accepts both plain and branded options
 * **Validates: Requirements 6.4**
 */

import { resetInterfaceRegistry } from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { createI18nStringKeys } from '../../src/branded-string-key';
import { BrandedTranslationOptions } from '../../src/branded-translation-options';
import { I18nEngine } from '../../src/core/i18n-engine';
import { createI18nSetup } from '../../src/create-i18n-setup';

/**
 * Arbitrary for valid variable keys (simple alpha identifiers).
 */
const varKeyArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,8}$/);

/**
 * Arbitrary for valid variable values (string or number).
 */
const varValueArb: fc.Arbitrary<string | number> = fc.oneof(
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  fc.integer({ min: 0, max: 99999 }),
);

/**
 * Arbitrary for a valid variables record.
 */
const validVariablesArb: fc.Arbitrary<Record<string, string | number>> = fc
  .array(fc.tuple(varKeyArb, varValueArb), { minLength: 0, maxLength: 3 })
  .map((pairs) => {
    const obj: Record<string, string | number> = {};
    for (const [k, v] of pairs) {
      obj[k] = v;
    }
    return obj;
  });

describe('Feature: branded-interface-integration, Property 12: Translation engine accepts both plain and branded options', () => {
  const COMPONENT_ID = 'prop12-comp';
  const INSTANCE_KEY = 'prop12-instance';

  beforeEach(() => {
    resetInterfaceRegistry();
    I18nEngine.resetAll();
  });

  afterEach(() => {
    resetInterfaceRegistry();
    I18nEngine.resetAll();
  });

  /**
   * Property 12: Translation engine accepts both plain and branded options
   *
   * For any valid TranslationOptions object, the translation engine should produce
   * the same translation result regardless of whether the options are passed as a
   * plain object or as a BrandedTranslationOptions instance.
   *
   * **Validates: Requirements 6.4**
   */
  it('Property 12: plain and branded options produce identical translation results', () => {
    fc.assert(
      fc.property(validVariablesArb, (variables) => {
        // Reset between iterations
        I18nEngine.resetAll();
        resetInterfaceRegistry();

        const AppKeys = createI18nStringKeys(COMPONENT_ID, {
          Greeting: `${COMPONENT_ID}.greeting`,
        } as const);

        const setup = createI18nSetup({
          componentId: COMPONENT_ID,
          stringKeyEnum: AppKeys,
          strings: {
            'en-US': { [`${COMPONENT_ID}.greeting`]: 'Hello world' },
          },
          instanceKey: INSTANCE_KEY,
        });

        const engine = setup.engine;

        // Translate with plain variables
        const plainResult = engine.translate(
          COMPONENT_ID,
          `${COMPONENT_ID}.greeting`,
          variables,
          'en-US',
        );

        // Create branded options and translate with branded variables
        const brandedOpts = BrandedTranslationOptions.create({
          variables,
          language: 'en-US',
        });

        const brandedResult = engine.translate(
          COMPONENT_ID,
          `${COMPONENT_ID}.greeting`,
          brandedOpts.variables as Record<string, string | number>,
          brandedOpts.language,
        );

        // Both should produce the same result
        expect(brandedResult).toBe(plainResult);

        setup.reset();
      }),
      { numRuns: 100 },
    );
  });

  it('Property 12: branded options with frozen variables work with Object.entries', () => {
    fc.assert(
      fc.property(validVariablesArb, (variables) => {
        // Branded instances are frozen — verify Object.entries still works
        const brandedOpts = BrandedTranslationOptions.create({
          variables,
          language: 'en-US',
        });

        // Object.entries should return the same key-value pairs
        const plainEntries = Object.entries(variables).sort();
        const brandedEntries = Object.entries(
          brandedOpts.variables as Record<string, string | number>,
        ).sort();

        expect(brandedEntries).toEqual(plainEntries);
      }),
      { numRuns: 100 },
    );
  });
});
