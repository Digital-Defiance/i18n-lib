/**
 * Property-based tests for createI18nSetup factory function.
 *
 * Feature: i18n-setup-factory, Property 1: Factory setup completeness
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9
 *
 * Feature: i18n-setup-factory, Property 2: Factory idempotence
 * Validates: Requirements 3.8
 */

import * as fc from 'fast-check';
import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';
import { CoreI18nComponentId } from '../src/core-component-id';
import { createI18nSetup } from '../src/create-i18n-setup';
import { GlobalActiveContext } from '../src/global-active-context';

/**
 * Generates a valid component ID (kebab-case string).
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{2,15}$/)
  .filter((s) => !s.endsWith('-') && !s.includes('--'));

/**
 * Generates a valid string key suffix.
 */
const keyNameArb = fc
  .stringMatching(/^[a-z][a-z0-9]{0,8}$/)
  .filter((s) => s.length > 0);

/**
 * Generates a non-empty translation string.
 */
const translationArb = fc.string({ minLength: 1, maxLength: 30 });

/**
 * Generates a component with unique string keys and translations.
 */
function componentWithKeysArb(compIdPrefix: string) {
  return fc
    .tuple(
      componentIdArb,
      fc.array(fc.tuple(keyNameArb, translationArb), {
        minLength: 1,
        maxLength: 3,
      }),
    )
    .map(([rawId, pairs]) => {
      const compId = `${compIdPrefix}-${rawId}`;
      const seen = new Set<string>();
      const keyEntries: Record<string, string> = {};
      const strings: Record<string, string> = {};

      for (const [key, translation] of pairs) {
        const fullKey = `${compId}.${key}`;
        if (!seen.has(fullKey)) {
          seen.add(fullKey);
          keyEntries[key] = fullKey;
          strings[fullKey] = translation;
        }
      }

      if (Object.keys(keyEntries).length === 0) {
        keyEntries['default'] = `${compId}.default`;
        strings[`${compId}.default`] = 'default';
      }

      const brandedEnum = createI18nStringKeys(compId, keyEntries);
      return { compId, keyEntries, strings, brandedEnum };
    });
}

let testCounter = 0;

describe('createI18nSetup property tests', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  /**
   * Feature: i18n-setup-factory, Property 1: Factory setup completeness
   *
   * For any valid I18nSetupConfig, calling createI18nSetup shall produce
   * an I18nSetupResult where:
   * - The engine has the core component registered
   * - The engine has each library component registered
   * - The engine has the app component registered
   * - The engine has the app's branded string key enum registered
   * - The context language matches the default
   * - The result contains all expected fields
   * - translate returns correct translations
   *
   * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9
   */
  it('Property 1: factory setup completeness', () => {
    fc.assert(
      fc.property(
        componentWithKeysArb('app'),
        fc.option(componentWithKeysArb('lib'), { nil: undefined }),
        (appComp, libComp) => {
          I18nEngine.resetAll();
          GlobalActiveContext.clearAll();

          const instanceKey = `pbt-complete-${++testCounter}`;

          const libraryComponents = libComp
            ? [
                {
                  config: {
                    id: libComp.compId,
                    strings: { 'en-US': libComp.strings },
                  },
                  stringKeyEnum: libComp.brandedEnum,
                },
              ]
            : undefined;

          const result = createI18nSetup({
            componentId: appComp.compId,
            stringKeyEnum: appComp.brandedEnum,
            strings: { 'en-US': appComp.strings },
            instanceKey,
            libraryComponents,
          });

          // Core component registered
          expect(result.engine.hasComponent(CoreI18nComponentId)).toBe(true);

          // App component registered
          expect(result.engine.hasComponent(appComp.compId)).toBe(true);

          // App enum registered
          expect(result.engine.hasStringKeyEnum(appComp.brandedEnum)).toBe(
            true,
          );

          // Library component registered if provided
          if (libComp) {
            expect(result.engine.hasComponent(libComp.compId)).toBe(true);
            expect(result.engine.hasStringKeyEnum(libComp.brandedEnum)).toBe(
              true,
            );
          }

          // Default language
          expect(result.getLanguage()).toBe('en-US');

          // All expected fields present
          expect(result.engine).toBeDefined();
          expect(typeof result.translate).toBe('function');
          expect(typeof result.safeTranslate).toBe('function');
          expect(result.context).toBeDefined();
          expect(typeof result.setLanguage).toBe('function');
          expect(typeof result.setAdminLanguage).toBe('function');
          expect(typeof result.setContext).toBe('function');
          expect(typeof result.getLanguage).toBe('function');
          expect(typeof result.getAdminLanguage).toBe('function');
          expect(typeof result.reset).toBe('function');

          // translate returns correct translations for all app keys
          for (const [fullKey, translation] of Object.entries(
            appComp.strings,
          )) {
            expect(result.engine.translateStringKey(fullKey as never)).toBe(
              translation,
            );
          }

          I18nEngine.removeInstance(instanceKey);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: i18n-setup-factory, Property 2: Factory idempotence
   *
   * For any valid I18nSetupConfig, calling createI18nSetup twice with
   * the same instanceKey shall return results where both engine references
   * point to the same I18nEngine instance, and no duplicate component
   * registration errors are thrown.
   *
   * Validates: Requirements 3.8
   */
  it('Property 2: factory idempotence', () => {
    fc.assert(
      fc.property(componentWithKeysArb('idem'), (appComp) => {
        I18nEngine.resetAll();
        GlobalActiveContext.clearAll();

        const instanceKey = `pbt-idem-${++testCounter}`;

        const config = {
          componentId: appComp.compId,
          stringKeyEnum: appComp.brandedEnum,
          strings: { 'en-US': appComp.strings },
          instanceKey,
        };

        // Call twice — should not throw
        const result1 = createI18nSetup(config);
        const result2 = createI18nSetup(config);

        // Same engine instance
        expect(result1.engine).toBe(result2.engine);

        // Both still work
        for (const [fullKey, translation] of Object.entries(appComp.strings)) {
          expect(result1.engine.translateStringKey(fullKey as never)).toBe(
            translation,
          );
          expect(result2.engine.translateStringKey(fullKey as never)).toBe(
            translation,
          );
        }

        I18nEngine.removeInstance(instanceKey);
      }),
      { numRuns: 100 },
    );
  });
});
