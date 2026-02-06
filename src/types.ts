/**
 * @module types
 *
 * Core type definitions for the i18n library's string collection and translation system.
 *
 * ## Overview
 *
 * This module provides type definitions for managing localized strings across multiple
 * languages. It supports two approaches for defining string keys:
 *
 * 1. **Traditional Enums** - Using TypeScript enums with `EnumLanguageTranslation` and
 *    `EnumTranslationRegistry` for backward compatibility
 * 2. **Branded Enums** (Recommended) - Using `@digitaldefiance/branded-enum` with
 *    `ComponentDefinition` for runtime-identifiable, type-safe string keys
 *
 * ## Traditional Enum Types vs Branded Enum Types
 *
 * ### Traditional Enums
 *
 * Traditional TypeScript enums work with the `EnumTranslationRegistry` system:
 *
 * ```typescript
 * enum MyStrings {
 *   Welcome = 'welcome',
 *   Goodbye = 'goodbye',
 * }
 *
 * const translations: EnumLanguageTranslation<MyStrings, 'en' | 'es'> = {
 *   en: { [MyStrings.Welcome]: 'Welcome!', [MyStrings.Goodbye]: 'Goodbye!' },
 *   es: { [MyStrings.Welcome]: '¡Bienvenido!', [MyStrings.Goodbye]: '¡Adiós!' },
 * };
 * ```
 *
 * Use `EnumLanguageTranslation<T, TLanguage>` with `EnumTranslationRegistry` for
 * traditional enum translations.
 *
 * ### Branded Enums (Recommended for New Code)
 *
 * Branded enums from `@digitaldefiance/branded-enum` provide runtime metadata for
 * identification and collision detection. Use `ComponentDefinition` with branded
 * enums for new code:
 *
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 *
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * // Use BrandedMasterStringsCollection for ergonomic typing
 * const translations: BrandedMasterStringsCollection<typeof MyKeys, 'en' | 'es'> = {
 *   en: { 'my.welcome': 'Welcome!', 'my.goodbye': 'Goodbye!' },
 *   es: { 'my.welcome': '¡Bienvenido!', 'my.goodbye': '¡Adiós!' },
 * };
 * ```
 *
 * ## Migration from Traditional Enums
 *
 * To migrate existing traditional enums to branded enums, use the
 * `createI18nStringKeysFromEnum()` function from `branded-string-key.ts`:
 *
 * ```typescript
 * import { createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';
 *
 * // Existing traditional enum
 * enum LegacyStrings {
 *   Title = 'title',
 *   Description = 'description',
 * }
 *
 * // Convert to branded enum
 * const BrandedStrings = createI18nStringKeysFromEnum(
 *   'my-component',
 *   LegacyStrings
 * );
 * ```
 *
 * ## Complete Example: Defining MasterStringsCollection with Branded Enums
 *
 * This example demonstrates the full workflow for creating type-safe translations
 * using branded enums with `MasterStringsCollection`.
 *
 * ### Step 1: Create Branded String Keys
 *
 * Use `createI18nStringKeys` to create a branded enum with your string keys.
 * The first argument is a unique component identifier, and the second is an
 * object mapping key names to their string values.
 *
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 *
 * // Create branded string keys for your component
 * // IMPORTANT: Use `as const` to preserve literal types
 * const UserProfileKeys = createI18nStringKeys('user-profile', {
 *   Title: 'user-profile.title',
 *   Description: 'user-profile.description',
 *   EditButton: 'user-profile.edit-button',
 *   SaveButton: 'user-profile.save-button',
 * } as const);
 * ```
 *
 * ### Step 2: Define Your Language Type
 *
 * Create a union type of all supported language codes:
 *
 * ```typescript
 * type SupportedLanguages = 'en-US' | 'es' | 'fr' | 'de';
 * ```
 *
 * ### Step 3: Define Translations Using BrandedMasterStringsCollection (Recommended)
 *
 * The ergonomic `BrandedMasterStringsCollection` alias automatically extracts
 * the branded enum values, making the type annotation cleaner:
 *
 * ```typescript
 * import type { BrandedMasterStringsCollection } from '@digitaldefiance/i18n-lib';
 *
 * // ✅ RECOMMENDED: Use BrandedMasterStringsCollection with typeof
 * const translations: BrandedMasterStringsCollection<typeof UserProfileKeys, SupportedLanguages> = {
 *   'en-US': {
 *     'user-profile.title': 'User Profile',
 *     'user-profile.description': 'Manage your account settings',
 *     'user-profile.edit-button': 'Edit',
 *     'user-profile.save-button': 'Save Changes',
 *   },
 *   'es': {
 *     'user-profile.title': 'Perfil de Usuario',
 *     'user-profile.description': 'Administra la configuración de tu cuenta',
 *     'user-profile.edit-button': 'Editar',
 *     'user-profile.save-button': 'Guardar Cambios',
 *   },
 *   'fr': {
 *     'user-profile.title': 'Profil Utilisateur',
 *     'user-profile.description': 'Gérez les paramètres de votre compte',
 *     'user-profile.edit-button': 'Modifier',
 *     'user-profile.save-button': 'Enregistrer',
 *   },
 *   'de': {
 *     'user-profile.title': 'Benutzerprofil',
 *     'user-profile.description': 'Verwalten Sie Ihre Kontoeinstellungen',
 *     'user-profile.edit-button': 'Bearbeiten',
 *     'user-profile.save-button': 'Änderungen speichern',
 *   },
 * };
 * ```
 *
 * ### Alternative: Using MasterStringsCollection Directly
 *
 * If you prefer to use `MasterStringsCollection` directly, you must wrap the
 * branded enum type with `BrandedEnumValue<typeof ...>`:
 *
 * ```typescript
 * import type { MasterStringsCollection } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 *
 * // Alternative: Use MasterStringsCollection with BrandedEnumValue
 * // Note: Parameter order is <TStringKey, TLanguage>
 * const translations: MasterStringsCollection<
 *   BrandedEnumValue<typeof UserProfileKeys>,
 *   SupportedLanguages
 * > = {
 *   'en-US': {
 *     'user-profile.title': 'User Profile',
 *     'user-profile.description': 'Manage your account settings',
 *     'user-profile.edit-button': 'Edit',
 *     'user-profile.save-button': 'Save Changes',
 *   },
 *   // ... other languages
 * };
 * ```
 *
 * ### Common Mistakes to Avoid
 *
 * ```typescript
 * // ❌ WRONG: Using the value instead of the type (missing typeof)
 * const bad1: BrandedMasterStringsCollection<UserProfileKeys, SupportedLanguages> = ...
 *
 * // ❌ WRONG: Wrong parameter order in MasterStringsCollection
 * const bad2: MasterStringsCollection<SupportedLanguages, BrandedEnumValue<typeof UserProfileKeys>> = ...
 *
 * // ❌ WRONG: Forgetting BrandedEnumValue when using MasterStringsCollection directly
 * const bad3: MasterStringsCollection<typeof UserProfileKeys, SupportedLanguages> = ...
 *
 * // ✅ CORRECT: Use typeof with BrandedMasterStringsCollection
 * const good1: BrandedMasterStringsCollection<typeof UserProfileKeys, SupportedLanguages> = ...
 *
 * // ✅ CORRECT: Use BrandedEnumValue<typeof ...> with MasterStringsCollection
 * const good2: MasterStringsCollection<BrandedEnumValue<typeof UserProfileKeys>, SupportedLanguages> = ...
 * ```
 *
 * ## Key Types
 *
 * - {@link StringsCollection} - Collection of strings for a single language
 * - {@link MasterStringsCollection} - Strings across multiple languages
 * - {@link BrandedStringsCollection} - Ergonomic alias for branded enum usage
 * - {@link BrandedMasterStringsCollection} - Ergonomic alias for branded enum master collections
 * - {@link EnumLanguageTranslation} - For traditional enum translations via EnumTranslationRegistry
 * - {@link ComponentStrings} - Complete string collection for a component
 * - {@link ComponentLanguageStrings} - Complete strings across all languages
 *
 * @see {@link ComponentDefinition} - For defining components with branded enum string keys
 * @see createI18nStringKeysFromEnum - For migrating existing enums to branded enums
 */
import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { ComponentDefinition } from './component-definition';
import { LanguageDefinition } from './language-definition';
import type { PluralString } from './types/plural-types';

/**
 * Standard language context spaces
 */
export type LanguageContextSpace = 'admin' | 'user';

/**
 * Default currency code
 */
export const DefaultCurrencyCode: string = 'USD';

/**
 * Default timezone
 */
export const DefaultTimezone: string = 'UTC';

/**
 * Default language code
 */
export const DefaultLanguageCode: string = 'en-US';

/**
 * Currency position type
 */
export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

/**
 * Collection of localized strings for a specific language.
 *
 * This type works with both traditional string keys and branded enum values.
 * When using branded enums, use `BrandedEnumValue<typeof YourEnum>` as the type parameter,
 * or use the ergonomic `BrandedStringsCollection<typeof YourEnum>` alias.
 *
 * @template TStringKey - The string key type (string literal union or BrandedEnumValue)
 *
 * @example Traditional usage:
 * ```typescript
 * type MyKeys = 'welcome' | 'goodbye';
 * const strings: StringsCollection<MyKeys> = {
 *   welcome: 'Welcome!',
 *   goodbye: 'Goodbye!',
 * };
 * ```
 *
 * @example Branded enum usage:
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * // Option 1: Use BrandedEnumValue with typeof
 * const strings: StringsCollection<BrandedEnumValue<typeof MyKeys>> = {
 *   'my.welcome': 'Welcome!',
 *   'my.goodbye': 'Goodbye!',
 * };
 *
 * // Option 2: Use the ergonomic alias
 * const strings: BrandedStringsCollection<typeof MyKeys> = {
 *   'my.welcome': 'Welcome!',
 *   'my.goodbye': 'Goodbye!',
 * };
 * ```
 */
export type StringsCollection<TStringKey extends string> = Partial<
  Record<TStringKey, string>
>;

/**
 * Mapping of languages to their respective string collections.
 *
 * This type works with both traditional string keys and branded enum values.
 *
 * **Important**: The parameter order is `<TStringKey, TLanguage>`, not `<TLanguage, TStringKey>`.
 *
 * @template TStringKey - The string key type (first parameter)
 * @template TLanguage - The language code type (second parameter)
 *
 * @example Traditional usage:
 * ```typescript
 * type MyKeys = 'welcome' | 'goodbye';
 * type MyLangs = 'en' | 'es';
 *
 * const master: MasterStringsCollection<MyKeys, MyLangs> = {
 *   en: { welcome: 'Welcome!', goodbye: 'Goodbye!' },
 *   es: { welcome: '¡Bienvenido!', goodbye: '¡Adiós!' },
 * };
 * ```
 *
 * @example Branded enum usage:
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * type MyLangs = 'en-US' | 'es';
 *
 * // Option 1: Use BrandedEnumValue with typeof
 * const master: MasterStringsCollection<BrandedEnumValue<typeof MyKeys>, MyLangs> = {
 *   'en-US': { 'my.welcome': 'Welcome!', 'my.goodbye': 'Goodbye!' },
 *   'es': { 'my.welcome': '¡Bienvenido!', 'my.goodbye': '¡Adiós!' },
 * };
 *
 * // Option 2: Use the ergonomic alias (recommended)
 * const master: BrandedMasterStringsCollection<typeof MyKeys, MyLangs> = {
 *   'en-US': { 'my.welcome': 'Welcome!', 'my.goodbye': 'Goodbye!' },
 *   'es': { 'my.welcome': '¡Bienvenido!', 'my.goodbye': '¡Adiós!' },
 * };
 * ```
 *
 * @remarks
 * Common mistake: Wrong parameter order or using value instead of type
 * ```typescript
 * // ❌ WRONG - Parameters in wrong order
 * const master: MasterStringsCollection<MyLangs, MyKeys> = ...
 *
 * // ❌ WRONG - MyKeys is a value, not a type
 * const master: MasterStringsCollection<MyKeys, MyLangs> = ...
 *
 * // ✅ CORRECT - Use typeof and correct parameter order
 * const master: MasterStringsCollection<BrandedEnumValue<typeof MyKeys>, MyLangs> = ...
 * ```
 */
export type MasterStringsCollection<
  TStringKey extends string,
  TLanguage extends string,
> = Partial<Record<TLanguage, StringsCollection<TStringKey>>>;

/**
 * Ergonomic type alias for StringsCollection with branded enums.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * // Use typeof to get the type from the value
 * const strings: BrandedStringsCollection<typeof MyKeys> = {
 *   'my.welcome': 'Welcome!',
 *   'my.goodbye': 'Goodbye!',
 * };
 * ```
 */
export type BrandedStringsCollection<E extends AnyBrandedEnum> =
  StringsCollection<BrandedEnumValue<E>>;

/**
 * Ergonomic type alias for MasterStringsCollection with branded enums.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 * @template TLanguage - The language code union type
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * type MyLanguages = 'en-US' | 'es' | 'fr';
 *
 * // Correct usage with typeof
 * const masterStrings: BrandedMasterStringsCollection<typeof MyKeys, MyLanguages> = {
 *   'en-US': { 'my.welcome': 'Welcome!', 'my.goodbye': 'Goodbye!' },
 *   'es': { 'my.welcome': '¡Bienvenido!', 'my.goodbye': '¡Adiós!' },
 *   'fr': { 'my.welcome': 'Bienvenue!', 'my.goodbye': 'Au revoir!' },
 * };
 * ```
 *
 * @remarks
 * Common mistake: Using the value instead of the type
 * ```typescript
 * // ❌ WRONG - MyKeys is a value, not a type
 * const strings: BrandedMasterStringsCollection<MyKeys, MyLanguages> = ...
 *
 * // ✅ CORRECT - Use typeof to get the type
 * const strings: BrandedMasterStringsCollection<typeof MyKeys, MyLanguages> = ...
 * ```
 */
export type BrandedMasterStringsCollection<
  E extends AnyBrandedEnum,
  TLanguage extends string,
> = MasterStringsCollection<BrandedEnumValue<E>, TLanguage>;

/**
 * Collection of localized strings that supports both simple strings and plural forms.
 *
 * Use this type when your translations include pluralization support via `PluralString`.
 * For translations that only use simple strings, use {@link StringsCollection} instead.
 *
 * @template TStringKey - The string key type (string literal union or BrandedEnumValue)
 *
 * @example
 * ```typescript
 * import { createPluralString } from '@digitaldefiance/i18n-lib';
 *
 * const strings: PluralStringsCollection<'items' | 'messages'> = {
 *   items: createPluralString({
 *     one: '{count} item',
 *     other: '{count} items',
 *   }),
 *   messages: 'You have new messages',
 * };
 * ```
 *
 * @see StringsCollection - For collections with only simple strings
 * @see PluralString - The plural string type definition
 */
export type PluralStringsCollection<TStringKey extends string> = Partial<
  Record<TStringKey, string | PluralString>
>;

/**
 * Mapping of languages to their respective string collections with plural support.
 *
 * Use this type when your translations include pluralization support via `PluralString`.
 * For translations that only use simple strings, use {@link MasterStringsCollection} instead.
 *
 * @template TStringKey - The string key type (first parameter)
 * @template TLanguage - The language code type (second parameter)
 *
 * @example
 * ```typescript
 * import { createPluralString } from '@digitaldefiance/i18n-lib';
 *
 * const master: PluralMasterStringsCollection<'items', 'en' | 'es'> = {
 *   en: {
 *     items: createPluralString({
 *       one: '{count} item',
 *       other: '{count} items',
 *     }),
 *   },
 *   es: {
 *     items: createPluralString({
 *       one: '{count} artículo',
 *       other: '{count} artículos',
 *     }),
 *   },
 * };
 * ```
 *
 * @see MasterStringsCollection - For collections with only simple strings
 * @see PluralStringsCollection - For single-language collections with plurals
 */
export type PluralMasterStringsCollection<
  TStringKey extends string,
  TLanguage extends string,
> = Partial<Record<TLanguage, PluralStringsCollection<TStringKey>>>;

/**
 * Ergonomic type alias for PluralStringsCollection with branded enums.
 *
 * Use this when your component has translations that include `PluralString` values.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 *
 * @example
 * ```typescript
 * import { createI18nStringKeys, createPluralString } from '@digitaldefiance/i18n-lib';
 *
 * const MyKeys = createI18nStringKeys('my-component', {
 *   ItemCount: 'my.item-count',
 *   Welcome: 'my.welcome',
 * } as const);
 *
 * const strings: BrandedPluralStringsCollection<typeof MyKeys> = {
 *   'my.item-count': createPluralString({
 *     one: '{count} item',
 *     other: '{count} items',
 *   }),
 *   'my.welcome': 'Welcome!',
 * };
 * ```
 *
 * @see BrandedStringsCollection - For collections with only simple strings
 */
export type BrandedPluralStringsCollection<E extends AnyBrandedEnum> =
  PluralStringsCollection<BrandedEnumValue<E>>;

/**
 * Ergonomic type alias for PluralMasterStringsCollection with branded enums.
 *
 * Use this when your component has translations that include `PluralString` values
 * across multiple languages.
 *
 * @template E - The branded enum type (use `typeof MyStringKeys`)
 * @template TLanguage - The language code union type
 *
 * @example
 * ```typescript
 * import { createI18nStringKeys, createPluralString } from '@digitaldefiance/i18n-lib';
 *
 * const MyKeys = createI18nStringKeys('my-component', {
 *   ItemCount: 'my.item-count',
 *   Welcome: 'my.welcome',
 * } as const);
 *
 * type MyLanguages = 'en-US' | 'es';
 *
 * const masterStrings: BrandedPluralMasterStringsCollection<typeof MyKeys, MyLanguages> = {
 *   'en-US': {
 *     'my.item-count': createPluralString({
 *       one: '{count} item',
 *       other: '{count} items',
 *     }),
 *     'my.welcome': 'Welcome!',
 *   },
 *   'es': {
 *     'my.item-count': createPluralString({
 *       one: '{count} artículo',
 *       other: '{count} artículos',
 *     }),
 *     'my.welcome': '¡Bienvenido!',
 *   },
 * };
 * ```
 *
 * @see BrandedMasterStringsCollection - For collections with only simple strings
 */
export type BrandedPluralMasterStringsCollection<
  E extends AnyBrandedEnum,
  TLanguage extends string,
> = PluralMasterStringsCollection<BrandedEnumValue<E>, TLanguage>;

/**
 * Mapping of language codes to their respective languages
 */
export type LanguageCodeCollection<TLanguage extends string> = Partial<
  Record<TLanguage, string>
>;

/**
 * Mapping of enumeration values to their translations in multiple languages.
 *
 * @deprecated This type is unused in the codebase. Use one of these alternatives:
 * - For traditional enum translations: Use `EnumLanguageTranslation<T, TLanguage>` with `EnumTranslationRegistry`
 * - For new code: Use branded enums with `ComponentDefinition` and `ComponentRegistration`
 * - To migrate existing enums: Use `createI18nStringKeysFromEnum()` from `branded-string-key.ts`
 *
 * @see EnumLanguageTranslation for traditional enum translation support
 * @see createI18nStringKeysFromEnum for migrating to branded enums
 */
export type EnumTranslationMap<
  TEnum extends string | number,
  TLanguage extends string,
> = Partial<Record<TLanguage, Partial<Record<TEnum, string>>>>;

/**
 * Complete string collection for a specific language and component.
 *
 * This type requires all string keys to have translations (non-partial).
 * It is used when you need to ensure complete coverage of all string keys
 * for a given language, typically after validation has confirmed all
 * translations are present.
 *
 * When used with branded enums, pass `BrandedEnumValue<typeof YourEnum>` as the
 * type parameter. This type is commonly used with {@link ComponentDefinition}
 * to define the string keys for a component.
 *
 * @template TStringKeys - The string key type (string literal union or BrandedEnumValue)
 *
 * @example Branded enum usage with createI18nStringKeys:
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 *
 * // Create branded string keys for your component
 * const UserProfileKeys = createI18nStringKeys('user-profile', {
 *   Title: 'user-profile.title',
 *   Description: 'user-profile.description',
 *   SaveButton: 'user-profile.save-button',
 * } as const);
 *
 * // Use BrandedEnumValue<typeof ...> to get the value type
 * const englishStrings: ComponentStrings<BrandedEnumValue<typeof UserProfileKeys>> = {
 *   'user-profile.title': 'User Profile',
 *   'user-profile.description': 'Manage your profile settings',
 *   'user-profile.save-button': 'Save Changes',
 * };
 * ```
 *
 * @see ComponentDefinition - For defining components with branded enum string keys
 * @see PartialComponentStrings - For partial string collections during registration
 * @see BrandedStringsCollection - Ergonomic alias for branded enum usage (partial)
 */
export type ComponentStrings<TStringKeys extends string> = {
  [K in TStringKeys]: string;
};

/**
 * Partial string collection used during component registration before validation.
 *
 * Unlike {@link ComponentStrings} which requires all string keys to have translations,
 * this type allows any subset of keys to be provided. This is useful during the
 * registration phase when translations may be added incrementally or when not all
 * translations are available yet.
 *
 * After registration is complete, use validation utilities to ensure all required
 * translations are present, then use {@link ComponentStrings} for the validated,
 * complete collection.
 *
 * @template TStringKeys - The string key type (string literal union or BrandedEnumValue)
 *
 * @example Typical usage during component registration:
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 *
 * // Create branded string keys for your component
 * const NotificationKeys = createI18nStringKeys('notifications', {
 *   Success: 'notifications.success',
 *   Error: 'notifications.error',
 *   Warning: 'notifications.warning',
 * } as const);
 *
 * // During registration, not all translations may be present yet
 * const partialEnglish: PartialComponentStrings<BrandedEnumValue<typeof NotificationKeys>> = {
 *   'notifications.success': 'Operation completed successfully',
 *   // 'notifications.error' and 'notifications.warning' can be added later
 * };
 *
 * // After validation confirms all keys are present, use ComponentStrings
 * const completeEnglish: ComponentStrings<BrandedEnumValue<typeof NotificationKeys>> = {
 *   'notifications.success': 'Operation completed successfully',
 *   'notifications.error': 'An error occurred',
 *   'notifications.warning': 'Please review before continuing',
 * };
 * ```
 *
 * @see ComponentStrings - For complete string collections after validation
 * @see PartialComponentLanguageStrings - For partial collections across multiple languages
 */
export type PartialComponentStrings<TStringKeys extends string> = {
  [K in TStringKeys]?: string;
};

/**
 * Complete string collection for a component across all registered languages.
 *
 * This type requires all string keys to have translations for every language
 * in the `TLanguages` union. It is used when you need to ensure complete
 * coverage of all string keys across all supported languages, typically after
 * validation has confirmed all translations are present.
 *
 * Unlike {@link PartialComponentLanguageStrings}, this type enforces that every
 * language has a complete {@link ComponentStrings} object with all keys defined.
 *
 * When used with branded enums, pass `BrandedEnumValue<typeof YourEnum>` as the
 * `TStringKeys` type parameter. For a more ergonomic approach with branded enums,
 * consider using {@link BrandedMasterStringsCollection} which handles the
 * `BrandedEnumValue` extraction automatically.
 *
 * @template TStringKeys - The string key type (string literal union or BrandedEnumValue)
 * @template TLanguages - The language code union type (e.g., 'en-US' | 'es' | 'fr')
 *
 * @example Branded enum usage with createI18nStringKeys:
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 * import type { ComponentLanguageStrings } from '@digitaldefiance/i18n-lib';
 *
 * // Create branded string keys for your component
 * const DashboardKeys = createI18nStringKeys('dashboard', {
 *   Title: 'dashboard.title',
 *   Welcome: 'dashboard.welcome',
 *   Logout: 'dashboard.logout',
 * } as const);
 *
 * type SupportedLanguages = 'en-US' | 'es' | 'fr';
 *
 * // Use BrandedEnumValue<typeof ...> to get the value type
 * const allTranslations: ComponentLanguageStrings<
 *   BrandedEnumValue<typeof DashboardKeys>,
 *   SupportedLanguages
 * > = {
 *   'en-US': {
 *     'dashboard.title': 'Dashboard',
 *     'dashboard.welcome': 'Welcome back!',
 *     'dashboard.logout': 'Log out',
 *   },
 *   'es': {
 *     'dashboard.title': 'Panel de control',
 *     'dashboard.welcome': '¡Bienvenido de nuevo!',
 *     'dashboard.logout': 'Cerrar sesión',
 *   },
 *   'fr': {
 *     'dashboard.title': 'Tableau de bord',
 *     'dashboard.welcome': 'Bon retour!',
 *     'dashboard.logout': 'Se déconnecter',
 *   },
 * };
 * ```
 *
 * @see ComponentStrings - For complete string collections for a single language
 * @see PartialComponentLanguageStrings - For partial collections during registration
 * @see BrandedMasterStringsCollection - Ergonomic alias for branded enum usage (partial)
 */
export type ComponentLanguageStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]: ComponentStrings<TStringKeys>;
};

/**
 * Partial string collection for a component across multiple languages during registration.
 *
 * This type is used during the registration phase when translations may be incomplete
 * across languages. Unlike {@link ComponentLanguageStrings} which requires all string
 * keys to have translations for every language, this type allows:
 *
 * - **Missing languages**: Not all languages need to be present initially
 * - **Missing keys per language**: Each language can have a subset of the string keys
 *
 * ## Partial Registration Pattern
 *
 * The partial registration pattern allows translations to be added incrementally:
 *
 * 1. **Initial Registration**: Register a component with whatever translations are available
 * 2. **Incremental Updates**: Add translations for additional languages or keys over time
 * 3. **Validation**: Before use, validate that all required translations are present
 * 4. **Complete Type**: After validation, use {@link ComponentLanguageStrings} for type-safe access
 *
 * This pattern is particularly useful when:
 * - Translations are provided by external translators at different times
 * - You want to ship with partial translations and add more later
 * - Different teams are responsible for different language translations
 *
 * @template TStringKeys - The string key type (string literal union or BrandedEnumValue)
 * @template TLanguages - The language code union type (e.g., 'en-US' | 'es' | 'fr')
 *
 * @example Typical usage during component registration with branded enums:
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 * import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
 * import type { PartialComponentLanguageStrings, ComponentLanguageStrings } from '@digitaldefiance/i18n-lib';
 *
 * // Create branded string keys for your component
 * const CheckoutKeys = createI18nStringKeys('checkout', {
 *   Title: 'checkout.title',
 *   Subtotal: 'checkout.subtotal',
 *   Tax: 'checkout.tax',
 *   Total: 'checkout.total',
 *   PlaceOrder: 'checkout.place-order',
 * } as const);
 *
 * type SupportedLanguages = 'en-US' | 'es' | 'fr';
 *
 * // During registration, translations may be incomplete
 * const partialTranslations: PartialComponentLanguageStrings<
 *   BrandedEnumValue<typeof CheckoutKeys>,
 *   SupportedLanguages
 * > = {
 *   // English is complete
 *   'en-US': {
 *     'checkout.title': 'Checkout',
 *     'checkout.subtotal': 'Subtotal',
 *     'checkout.tax': 'Tax',
 *     'checkout.total': 'Total',
 *     'checkout.place-order': 'Place Order',
 *   },
 *   // Spanish is partially complete (missing some keys)
 *   'es': {
 *     'checkout.title': 'Pagar',
 *     'checkout.place-order': 'Realizar pedido',
 *     // Other keys can be added later
 *   },
 *   // French is not yet available - can be added later
 * };
 *
 * // After validation confirms all translations are present,
 * // use ComponentLanguageStrings for type-safe access
 * function validateAndUse(
 *   partial: PartialComponentLanguageStrings<BrandedEnumValue<typeof CheckoutKeys>, SupportedLanguages>
 * ): ComponentLanguageStrings<BrandedEnumValue<typeof CheckoutKeys>, SupportedLanguages> {
 *   // ... validation logic ...
 *   return partial as ComponentLanguageStrings<BrandedEnumValue<typeof CheckoutKeys>, SupportedLanguages>;
 * }
 * ```
 *
 * @see ComponentLanguageStrings - For complete string collections after validation
 * @see PartialComponentStrings - For partial collections for a single language
 * @see BrandedMasterStringsCollection - Ergonomic alias for branded enum usage
 */
export type PartialComponentLanguageStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]?: PartialComponentStrings<TStringKeys>;
};

/**
 * Generic translation type for any enumeration
 */
export type EnumTranslation<T extends string | number> = {
  [K in T]: string;
};

/**
 * Generic language translation type for any enumeration
 */
export type EnumLanguageTranslation<
  T extends string | number,
  TLanguage extends string = string,
> = Partial<{
  [L in TLanguage]: EnumTranslation<T>;
}>;

/**
 * Type utility to extract string keys from a component definition
 */
export type ExtractStringKeys<T> =
  T extends ComponentDefinition<infer E> ? BrandedEnumValue<E> : never;

/**
 * Type utility to extract languages from registry
 */
export type ExtractLanguages<T> = T extends LanguageDefinition
  ? T['id']
  : never;

/**
 * Utility type to ensure all string keys are provided for all languages
 */
export type CompleteComponentStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = ComponentLanguageStrings<TStringKeys, TLanguages>;

/**
 * Helper function to create typed translations for an enumeration
 */
export function createTranslations<
  T extends string | number,
  TLanguage extends string,
>(
  translations: EnumLanguageTranslation<T, TLanguage>,
): EnumLanguageTranslation<T, TLanguage> {
  return translations;
}

// =============================================================================
// Branded Enum Translation Types
// =============================================================================

/**
 * Translation map for branded enum values.
 * Maps language codes to translations keyed by branded enum values.
 *
 * @template E - The branded enum type (use `typeof YourBrandedEnum`)
 * @template TLanguage - The language code union type
 *
 * @example
 * ```typescript
 * const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
 *
 * const translations: BrandedEnumTranslation<typeof Status, 'en-US' | 'es'> = {
 *   'en-US': { active: 'Active', inactive: 'Inactive' },
 *   'es': { active: 'Activo', inactive: 'Inactivo' },
 * };
 * ```
 */
export type BrandedEnumTranslation<
  E extends AnyBrandedEnum,
  TLanguage extends string,
> = Partial<{
  [L in TLanguage]: Record<BrandedEnumValue<E>, string>;
}>;

/**
 * Union type for enum objects that can be registered with the enum translation system.
 * Accepts both traditional TypeScript enums and branded enums.
 *
 * @template TEnum - The enum value type (string or number)
 *
 * @example
 * ```typescript
 * function registerEnum<TEnum extends string | number>(
 *   enumObj: RegisterableEnum<TEnum>,
 *   translations: Record<string, Record<string, string>>,
 * ): void {
 *   // Works with both traditional and branded enums
 * }
 * ```
 */
export type RegisterableEnum<TEnum extends string | number = string | number> =
  | Record<string, TEnum>
  | AnyBrandedEnum;

/**
 * Union type for enum values that can be translated.
 * Accepts both traditional enum values and branded enum values.
 *
 * @template TEnum - The enum value type (string or number)
 *
 * @example
 * ```typescript
 * function translateEnum<TEnum extends string | number>(
 *   enumObj: RegisterableEnum<TEnum>,
 *   value: TranslatableEnumValue<TEnum>,
 *   language: string,
 * ): string {
 *   // Works with both traditional and branded enum values
 * }
 * ```
 */
export type TranslatableEnumValue<
  TEnum extends string | number = string | number,
> = TEnum | BrandedEnumValue<AnyBrandedEnum>;
