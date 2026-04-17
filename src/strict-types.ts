/**
 * @module strict-types
 *
 * Strict (non-partial) type definitions for i18n string collections.
 *
 * Unlike {@link StringsCollection} and {@link MasterStringsCollection} from `./types`,
 * which use `Partial<>` and allow missing keys/languages to pass type-checking silently,
 * the types in this module require **every** key to be present for **every** language.
 *
 * Use these types in language files and master collection definitions to get compile-time
 * errors when translations are missing, instead of discovering them at runtime via
 * "Translation missing" errors.
 *
 * ## Quick Reference
 *
 * | Partial (old)                        | Strict (new)                                  |
 * |--------------------------------------|-----------------------------------------------|
 * | `StringsCollection<K>`               | `CompleteLanguageStrings<K>`                  |
 * | `BrandedStringsCollection<E>`        | `RequiredBrandedStringsCollection<E>`         |
 * | `MasterStringsCollection<K, L>`      | `CompleteComponentLanguageStrings<K, L>`      |
 * | `BrandedMasterStringsCollection<E,L>`| `RequiredBrandedMasterStringsCollection<E,L>` |
 */
import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';

/**
 * Requires that **all** string keys in `TStringKey` are present with `string` values.
 *
 * Drop-in strict replacement for `StringsCollection<TStringKey>`.
 */
export type CompleteLanguageStrings<TStringKey extends string> = {
  [K in TStringKey]: string;
};

/**
 * Requires that **all** languages in `TLanguages` are present, each containing
 * **all** string keys in `TStringKey`.
 *
 * Drop-in strict replacement for `MasterStringsCollection<TStringKey, TLanguage>`.
 */
export type CompleteComponentLanguageStrings<
  TStringKey extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]: CompleteLanguageStrings<TStringKey>;
};

// =============================================================================
// Branded Enum Ergonomic Aliases
// =============================================================================

/**
 * Strict branded alias: requires **all** keys for a single language.
 *
 * Drop-in strict replacement for `BrandedStringsCollection<E>`.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'Welcome',
 *   Goodbye: 'Goodbye',
 * } as const);
 *
 * // ✅ Compile error if any key is missing
 * const french: RequiredBrandedStringsCollection<typeof MyKeys> = {
 *   Welcome: 'Bienvenue',
 *   Goodbye: 'Au revoir',
 * };
 * ```
 */
export type RequiredBrandedStringsCollection<E extends AnyBrandedEnum> =
  CompleteLanguageStrings<BrandedEnumValue<E>>;

/**
 * Strict branded alias: requires **all** languages AND **all** keys.
 *
 * Drop-in strict replacement for `BrandedMasterStringsCollection<E, TLanguage>`.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 * @template TLanguage - The language code union type
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'Welcome',
 *   Goodbye: 'Goodbye',
 * } as const);
 *
 * type Langs = 'en-US' | 'fr' | 'de';
 *
 * // ✅ Compile error if any language or key is missing
 * const all: RequiredBrandedMasterStringsCollection<typeof MyKeys, Langs> = {
 *   'en-US': { Welcome: 'Welcome', Goodbye: 'Goodbye' },
 *   'fr':    { Welcome: 'Bienvenue', Goodbye: 'Au revoir' },
 *   'de':    { Welcome: 'Willkommen', Goodbye: 'Auf Wiedersehen' },
 * };
 * ```
 */
export type RequiredBrandedMasterStringsCollection<
  E extends AnyBrandedEnum,
  TLanguage extends string,
> = CompleteComponentLanguageStrings<BrandedEnumValue<E>, TLanguage>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper to assert at compile-time that an object is a complete component language map.
 * Returns the object unchanged at runtime.
 */
export function createCompleteComponentStrings<
  TStringKey extends string,
  TLanguages extends string,
>(
  obj: CompleteComponentLanguageStrings<TStringKey, TLanguages>,
): CompleteComponentLanguageStrings<TStringKey, TLanguages> {
  return obj;
}

/**
 * Utility to extract missing keys at compile time (identity, purely for readability)
 */
export function defineLanguageStrings<TStringKey extends string>(
  strings: CompleteLanguageStrings<TStringKey>,
): CompleteLanguageStrings<TStringKey> {
  return strings;
}
