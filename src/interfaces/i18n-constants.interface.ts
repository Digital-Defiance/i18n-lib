/**
 * Base interface for i18n constants.
 *
 * All constants passed to the i18n system must satisfy this contract.
 * Constants are used for template variable replacement in translation strings
 * (e.g., `{Site}` in a template resolves to the `Site` constant value).
 *
 * Only string and number values are used in template replacement. Other value
 * types (RegExp, objects, etc.) are accepted for convenience — consumers often
 * pass their full app constants object — but are ignored during translation.
 *
 * ## Usage
 *
 * Define a component-specific constants interface extending this base:
 *
 * ```typescript
 * export interface SuiteCoreI18nConstants extends II18nConstants {
 *   Site: string;
 *   SiteTagline: string;
 *   EmailTokenResendIntervalMinutes: number;
 * }
 * ```
 *
 * Then use it with the generic API:
 *
 * ```typescript
 * engine.registerConstants<SuiteCoreI18nConstants>('suite-core', {
 *   Site: 'Acme Corp',
 *   SiteTagline: 'Building the future',
 *   EmailTokenResendIntervalMinutes: 5,
 * });
 * ```
 *
 * ## Validation
 *
 * Use `validateConstantsCoverage()` in tests to verify that all `{variable}`
 * references in your translation templates have corresponding constant keys.
 */
export interface II18nConstants {
  [key: string]: unknown;
}

/**
 * Extracts the string keys from a constants type.
 * Useful for building type-safe variable maps for translation calls.
 *
 * @example
 * ```typescript
 * type Keys = ConstantKeys<SuiteCoreI18nConstants>;
 * // 'Site' | 'SiteTagline' | 'EmailTokenResendIntervalMinutes'
 * ```
 */
export type ConstantKeys<T extends II18nConstants> = Extract<keyof T, string>;

/**
 * Builds a partial variables record from a constants type.
 * Use this to type the `variables` parameter in translation calls
 * when you want to override constant values inline.
 *
 * @example
 * ```typescript
 * type Vars = ConstantVariables<SuiteCoreI18nConstants>;
 * // { Site?: string | number; SiteTagline?: string | number; ... }
 * ```
 */
export type ConstantVariables<T extends II18nConstants> = Partial<
  Record<ConstantKeys<T>, string | number>
>;
