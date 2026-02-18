/**
 * Property-based tests for BrandedValidationErrorFormatter fallback chain.
 *
 * Feature: branded-interface-integration, Property 6: Formatter falls back through language chain
 * **Validates: Requirements 3.4, 3.5**
 */

import type { InterfaceSafeParseFailure } from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { BrandedValidationErrorFormatter } from '../../src/branded-validation-error-formatter';
import type { II18nEngine } from '../../src/interfaces/i18n-engine.interface';

/**
 * Translation store keyed by `${componentId}|${key}|${language}`.
 */
type TranslationStore = Map<string, string>;

function storeKey(componentId: string, key: string, language: string): string {
  return `${componentId}|${key}|${language}`;
}

/**
 * Creates an II18nEngine stub backed by a translation store.
 *
 * - `translate(componentId, key, vars, language)` looks up the store.
 *   If no language is provided, uses `activeLanguage`.
 *   If no translation is found, throws (mimicking a real engine miss).
 */
function createConfigurableEngine(
  store: TranslationStore,
  activeLanguage: string,
): II18nEngine {
  const noop = (): never => {
    throw new Error('not implemented');
  };

  return {
    translate: (
      componentId: string,
      key: string,
      _variables?: Record<string, unknown>,
      language?: string,
    ): string => {
      const lang = language ?? activeLanguage;
      const found = store.get(storeKey(componentId, key, lang));
      if (found !== undefined) {
        return found;
      }
      // Mimic engine behaviour: throw when no translation exists
      throw new Error(`Missing translation: ${componentId}.${key} [${lang}]`);
    },
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
    getCurrentLanguage: () => activeLanguage,
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
 * Arbitrary for an InterfaceSafeParseFailure with exactly 1 field error
 * (simplifies fallback chain reasoning — the property holds for any N).
 */
const failureArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 30 }),
    fc.constantFrom(
      'FIELD_VALIDATION_FAILED',
      'INVALID_VALUE_TYPE',
    ) as fc.Arbitrary<'FIELD_VALIDATION_FAILED' | 'INVALID_VALUE_TYPE'>,
    fc.stringMatching(/^[A-Z][a-zA-Z0-9]{2,15}$/),
    fc.array(fieldErrorArb, { minLength: 1, maxLength: 3 }),
  )
  .map(
    ([message, code, interfaceId, fieldErrors]): InterfaceSafeParseFailure => ({
      success: false as const,
      error: { message, code, input: {}, interfaceId, fieldErrors },
    }),
  );

const ACTIVE_LANG = 'fr-FR';
const FALLBACK_LANG = 'en-US';
const DEFAULT_PATTERN = 'validation.{code}.{field}';

/**
 * Computes the expected translation key for a field error.
 */
function expectedKey(code: string, field: string): string {
  return DEFAULT_PATTERN.replace('{code}', code).replace('{field}', field);
}

describe('Feature: branded-interface-integration, Property 6: Formatter falls back through language chain', () => {
  /**
   * Property 6a: When the active language HAS a translation, the formatter
   * returns that translation (no fallback needed).
   *
   * **Validates: Requirements 3.4**
   */
  it('Property 6a: uses active language translation when available', () => {
    fc.assert(
      fc.property(
        failureArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        (failure, translatedMsg) => {
          const store: TranslationStore = new Map();
          const interfaceId = failure.error.interfaceId!;

          // Populate active language translations for all field errors
          for (const fe of failure.error.fieldErrors!) {
            const key = expectedKey(failure.error.code, fe.field);
            store.set(storeKey(interfaceId, key, ACTIVE_LANG), translatedMsg);
          }

          const engine = createConfigurableEngine(store, ACTIVE_LANG);
          const formatter = new BrandedValidationErrorFormatter(engine, {
            fallbackLanguage: FALLBACK_LANG,
          });

          const results = formatter.format(failure);

          for (const result of results) {
            expect(result.message).toBe(translatedMsg);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6b: When the active language LACKS a translation but the
   * fallback language HAS one, the formatter returns the fallback translation.
   *
   * **Validates: Requirements 3.4**
   */
  it('Property 6b: falls back to fallback language when active language lacks translation', () => {
    fc.assert(
      fc.property(
        failureArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        (failure, fallbackMsg) => {
          const store: TranslationStore = new Map();
          const interfaceId = failure.error.interfaceId!;

          // Only populate fallback language translations (NOT active)
          for (const fe of failure.error.fieldErrors!) {
            const key = expectedKey(failure.error.code, fe.field);
            store.set(storeKey(interfaceId, key, FALLBACK_LANG), fallbackMsg);
          }

          const engine = createConfigurableEngine(store, ACTIVE_LANG);
          const formatter = new BrandedValidationErrorFormatter(engine, {
            fallbackLanguage: FALLBACK_LANG,
          });

          const results = formatter.format(failure);

          for (const result of results) {
            expect(result.message).toBe(fallbackMsg);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6c: When BOTH active and fallback languages lack a translation,
   * the formatter returns the raw error message from the Safe_Parse result.
   *
   * **Validates: Requirements 3.5**
   */
  it('Property 6c: falls back to raw message when no translations exist', () => {
    fc.assert(
      fc.property(failureArb, (failure) => {
        // Empty store — no translations at all
        const store: TranslationStore = new Map();
        const engine = createConfigurableEngine(store, ACTIVE_LANG);
        const formatter = new BrandedValidationErrorFormatter(engine, {
          fallbackLanguage: FALLBACK_LANG,
        });

        const results = formatter.format(failure);

        // Each result message should be the raw field error message
        for (let i = 0; i < results.length; i++) {
          expect(results[i].message).toBe(
            failure.error.fieldErrors![i].message,
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6d: Fallback chain priority — active language takes precedence
   * over fallback language, which takes precedence over raw message.
   *
   * **Validates: Requirements 3.4, 3.5**
   */
  it('Property 6d: active language takes priority over fallback language', () => {
    fc.assert(
      fc.property(
        failureArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (failure, activeMsg, fallbackMsg) => {
          const store: TranslationStore = new Map();
          const interfaceId = failure.error.interfaceId!;

          // Populate BOTH active and fallback translations
          for (const fe of failure.error.fieldErrors!) {
            const key = expectedKey(failure.error.code, fe.field);
            store.set(storeKey(interfaceId, key, ACTIVE_LANG), activeMsg);
            store.set(storeKey(interfaceId, key, FALLBACK_LANG), fallbackMsg);
          }

          const engine = createConfigurableEngine(store, ACTIVE_LANG);
          const formatter = new BrandedValidationErrorFormatter(engine, {
            fallbackLanguage: FALLBACK_LANG,
          });

          const results = formatter.format(failure);

          // Active language should win
          for (const result of results) {
            expect(result.message).toBe(activeMsg);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
