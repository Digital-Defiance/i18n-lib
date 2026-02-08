/**
 * Property-based tests for browser-safe fallback in I18nEngine.
 *
 * Feature: i18n-setup-factory, Property 3: Browser-safe fallback resolution
 * Validates: Requirements 4.1, 4.6
 *
 * Feature: i18n-setup-factory, Property 4: Cache invalidation on new component registration
 * Validates: Requirements 4.5
 */

import * as fc from 'fast-check';
import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';
import type { LanguageDefinition } from '../src/interfaces';

const testLanguages: LanguageDefinition[] = [
  { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
];

/**
 * Generates a valid component ID (kebab-case string).
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{2,20}$/)
  .filter((s) => !s.endsWith('-') && !s.includes('--'));

/**
 * Generates a valid string key suffix (dot-separated lowercase).
 */
const keyNameArb = fc
  .stringMatching(/^[a-z][a-z0-9]{0,10}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a non-empty translation string.
 */
const translationArb = fc.string({ minLength: 1, maxLength: 40 });

/**
 * Generates a component with 1-5 unique string keys and translations.
 */
const componentArb = fc
  .tuple(
    componentIdArb,
    fc.array(fc.tuple(keyNameArb, translationArb), {
      minLength: 1,
      maxLength: 5,
    }),
  )
  .map(([compId, pairs]) => {
    // Deduplicate keys
    const seen = new Set<string>();
    const uniquePairs: Array<[string, string]> = [];
    for (const [key, translation] of pairs) {
      const fullKey = `${compId}.${key}`;
      if (!seen.has(fullKey)) {
        seen.add(fullKey);
        uniquePairs.push([fullKey, translation]);
      }
    }
    if (uniquePairs.length === 0) {
      uniquePairs.push([`${compId}.default`, 'default translation']);
    }
    return { compId, pairs: uniquePairs };
  });

describe('Browser-safe fallback property tests', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  /**
   * Feature: i18n-setup-factory, Property 3: Browser-safe fallback resolution
   *
   * For any I18nEngine with registered components and string keys,
   * when the StringKeyEnumRegistry fails to resolve a component ID
   * (simulating a browser Symbol mismatch), both translateStringKey
   * and safeTranslateStringKey shall still return the correct translation
   * by falling back to scanning registered components' string values.
   *
   * Validates: Requirements 4.1, 4.6
   */
  it('Property 3: fallback resolves all registered keys without enum registration', () => {
    fc.assert(
      fc.property(componentArb, ({ compId, pairs }) => {
        I18nEngine.resetAll();

        const instanceKey = `pbt-fallback-${compId}`;
        const engine = I18nEngine.createInstance(instanceKey, testLanguages);

        // Build strings map
        const strings: Record<string, string> = {};
        const keyEntries: Record<string, string> = {};
        for (const [fullKey, translation] of pairs) {
          strings[fullKey] = translation;
          const shortKey = fullKey.replace(`${compId}.`, '');
          keyEntries[shortKey] = fullKey;
        }

        // Register component with strings
        engine.register({
          id: compId,
          strings: { 'en-US': strings },
        });

        // Create branded enum but do NOT register it — forces fallback
        const _brandedEnum = createI18nStringKeys(compId, keyEntries);

        // translateStringKey should resolve via fallback for every key
        for (const [fullKey, translation] of pairs) {
          const result = engine.translateStringKey(fullKey as never);
          expect(result).toBe(translation);
        }

        // safeTranslateStringKey should also resolve via fallback
        for (const [fullKey, translation] of pairs) {
          const result = engine.safeTranslateStringKey(fullKey as never);
          expect(result).toBe(translation);
        }

        // Cleanup to avoid instance collision
        I18nEngine.removeInstance(instanceKey);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: i18n-setup-factory, Property 4: Cache invalidation on new component registration
   *
   * For any I18nEngine where the fallback cache has been built
   * (by a previous fallback lookup), registering a new component with
   * new string keys shall allow those new keys to be resolved via the
   * fallback mechanism without stale cache results.
   *
   * Validates: Requirements 4.5
   */
  it('Property 4: cache invalidation allows new keys after registration', () => {
    fc.assert(
      fc.property(
        componentArb,
        componentArb,
        (
          { compId: compIdA, pairs: pairsA },
          { compId: compIdB, pairs: pairsB },
        ) => {
          // Ensure distinct component IDs
          if (compIdA === compIdB) return;

          I18nEngine.resetAll();

          const instanceKey = `pbt-cache-${compIdA}`;
          const engine = I18nEngine.createInstance(instanceKey, testLanguages);

          // Register first component
          const stringsA: Record<string, string> = {};
          for (const [fullKey, translation] of pairsA) {
            stringsA[fullKey] = translation;
          }
          engine.register({
            id: compIdA,
            strings: { 'en-US': stringsA },
          });

          // Trigger fallback cache build by translating a key from comp A
          const firstKeyA = pairsA[0][0];
          expect(engine.translateStringKey(firstKeyA as never)).toBe(
            pairsA[0][1],
          );

          // Register second component — should invalidate cache
          const stringsB: Record<string, string> = {};
          for (const [fullKey, translation] of pairsB) {
            // Remap keys to use compIdB prefix to avoid collisions
            const remappedKey = fullKey.replace(/^[^.]+\./, `${compIdB}.`);
            stringsB[remappedKey] = translation;
          }
          engine.register({
            id: compIdB,
            strings: { 'en-US': stringsB },
          });

          // All keys from comp B should now be resolvable via fallback
          for (const remappedKey of Object.keys(stringsB)) {
            const result = engine.translateStringKey(remappedKey as never);
            expect(result).toBe(stringsB[remappedKey]);
          }

          // All keys from comp A should still work
          for (const [fullKey, translation] of pairsA) {
            expect(engine.translateStringKey(fullKey as never)).toBe(
              translation,
            );
          }

          I18nEngine.removeInstance(instanceKey);
        },
      ),
      { numRuns: 100 },
    );
  });
});
