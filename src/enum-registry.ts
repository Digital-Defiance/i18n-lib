/**
 * Legacy Enum Translation Registry
 *
 * This module provides the `EnumTranslationRegistry` class for managing translations
 * of enum values with language validation. It supports both traditional TypeScript
 * enums and branded enums from `@digitaldefiance/branded-enum`.
 *
 * ## Overview
 *
 * The `EnumTranslationRegistry` is the legacy implementation of enum translation
 * management, designed to work with the `PluginI18nEngine`. It provides:
 *
 * - Registration of enums with their translations
 * - Language validation against a predefined set of available languages
 * - Translation of enum values to localized strings
 * - Automatic name inference for branded enums
 *
 * ## Difference from EnumRegistry (v2)
 *
 * Unlike the v2 `EnumRegistry`, this legacy registry:
 * - Validates that translation languages are in the available languages set
 * - Uses generic type parameters for string keys and languages
 * - Supports custom translation functions for error messages
 *
 * ## Branded Enum Support
 *
 * When registering branded enums, the registry can automatically infer the enum
 * name from the branded enum's component ID, eliminating the need to provide
 * an explicit name parameter.
 *
 * @example Traditional enum usage
 * ```typescript
 * enum Status { Active = 'active', Inactive = 'inactive' }
 *
 * const registry = new EnumTranslationRegistry(['en', 'es']);
 * registry.register(Status, {
 *   en: { active: 'Active', inactive: 'Inactive' },
 *   es: { active: 'Activo', inactive: 'Inactivo' },
 * }, 'Status');
 *
 * registry.translate(Status, Status.Active, 'en'); // 'Active'
 * ```
 *
 * @example Branded enum usage (name inferred)
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 *
 * const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
 *
 * const registry = new EnumTranslationRegistry(['en', 'es']);
 * registry.register(Status, {
 *   en: { active: 'Active', inactive: 'Inactive' },
 * }); // Name 'status' is inferred from branded enum
 *
 * registry.translate(Status, Status.Active, 'en'); // 'Active'
 * ```
 *
 * @module enum-registry
 * @see {@link EnumRegistry} - V2 registry without language validation
 * @see {@link PluginI18nEngine} - Plugin engine that uses this registry
 */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { isBrandedEnum, getBrandedEnumComponentId } from './branded-enum-utils';
import { EnumLanguageTranslation } from './types';

/**
 * Registry for managing translations of enum values across multiple languages.
 *
 * Provides a centralized way to register and translate enum values with language
 * validation. Supports both traditional TypeScript enums and branded enums from
 * `@digitaldefiance/branded-enum`.
 *
 * ## Key Features
 *
 * - **Dual Enum Support**: Works with both traditional and branded enums
 * - **Language Validation**: Validates that translations only use available languages
 * - **Automatic Name Inference**: Branded enums can have their name inferred from component ID
 * - **Custom Error Messages**: Supports custom translation functions for error messages
 *
 * ## Language Validation
 *
 * Unlike the v2 `EnumRegistry`, this registry validates that all translation
 * languages are in the set of available languages provided at construction time.
 * This helps catch configuration errors early.
 *
 * @template TStringKey - Type of translation key used in error messages
 * @template TLanguage - Type of supported language codes
 *
 * @example Complete workflow
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 *
 * // Create a branded enum
 * const Priority = createBrandedEnum('priority', {
 *   High: 'high',
 *   Medium: 'medium',
 *   Low: 'low',
 * });
 *
 * // Create registry with available languages
 * const registry = new EnumTranslationRegistry<string, 'en' | 'es'>(['en', 'es']);
 *
 * // Register enum (name inferred from branded enum)
 * registry.register(Priority, {
 *   en: { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' },
 *   es: { high: 'Alta Prioridad', medium: 'Prioridad Media', low: 'Baja Prioridad' },
 * });
 *
 * // Check if registered
 * registry.has(Priority); // true
 *
 * // Translate values
 * registry.translate(Priority, Priority.High, 'en'); // 'High Priority'
 * registry.translate(Priority, Priority.High, 'es'); // 'Alta Prioridad'
 * ```
 *
 * @example Language validation error
 * ```typescript
 * const registry = new EnumTranslationRegistry(['en', 'es']);
 *
 * // This will throw an error because 'fr' is not in available languages
 * registry.register(Status, {
 *   en: { active: 'Active' },
 *   fr: { active: 'Actif' }, // Error: Language 'fr' not available
 * }, 'Status');
 * ```
 */
export class EnumTranslationRegistry<
  TStringKey extends string,
  TLanguage extends string,
> {
  protected translations = new Map<
    object,
    EnumLanguageTranslation<string | number, TLanguage>
  >();
  protected enumNames = new WeakMap<object, string>();
  protected availableLanguages: Set<TLanguage>;
  protected translateFn?: (
    key: TStringKey,
    vars?: Record<string, unknown>,
  ) => string;

  /**
   * Creates a new EnumTranslationRegistry.
   *
   * @param availableLanguages Array of supported language codes.
   * @param translateFn Optional translation function for error templates.
   */
  constructor(
    availableLanguages: TLanguage[],
    translateFn?: (key: TStringKey, vars?: Record<string, unknown>) => string,
  ) {
    this.availableLanguages = new Set(availableLanguages);
    this.translateFn = translateFn;
  }

  /**
   * Registers an enum and its language-specific translations.
   *
   * Supports both traditional TypeScript enums and branded enums from
   * `@digitaldefiance/branded-enum`. For branded enums, the `enumName` parameter
   * is optional and will be automatically inferred from the branded enum's
   * component ID.
   *
   * ## Name Resolution
   *
   * The enum name is resolved in the following order:
   * 1. Explicit `enumName` parameter (if provided)
   * 2. Component ID from branded enum (if branded)
   * 3. `'UnknownEnum'` (fallback for traditional enums without name)
   *
   * ## Language Validation
   *
   * Before storing the translations, this method validates that all language
   * codes in the translations object are in the registry's available languages
   * set. If an invalid language is found, an error is thrown.
   *
   * @template TEnum - Enum value type (string or number)
   * @param enumObj - The enum object to register (traditional or branded)
   * @param translations - Mapping of language codes to value-to-string translations
   * @param enumName - Human-readable name of the enum (optional for branded enums)
   * @throws {Error} If translations contain languages not in availableLanguages
   *
   * @example Traditional enum (name required)
   * ```typescript
   * enum Status { Active = 'active', Inactive = 'inactive' }
   *
   * registry.register(Status, {
   *   en: { active: 'Active', inactive: 'Inactive' },
   *   es: { active: 'Activo', inactive: 'Inactivo' },
   * }, 'Status');
   * ```
   *
   * @example Branded enum (name inferred)
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
   *
   * // Name 'status' is automatically inferred from the branded enum
   * registry.register(Status, {
   *   en: { active: 'Active', inactive: 'Inactive' },
   * });
   * ```
   *
   * @example Language validation error
   * ```typescript
   * const registry = new EnumTranslationRegistry(['en', 'es']);
   *
   * // Throws: Language 'fr' in enum 'Status' is not available in this registry
   * registry.register(Status, {
   *   en: { active: 'Active' },
   *   fr: { active: 'Actif' },
   * }, 'Status');
   * ```
   */
  public register<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | AnyBrandedEnum,
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName?: string,
  ): void {
    const resolvedName = enumName ?? this.resolveEnumName(enumObj);
    this.validateTranslations(translations, resolvedName);
    this.translations.set(
      enumObj,
      translations as EnumLanguageTranslation<string | number, TLanguage>,
    );
    this.enumNames.set(enumObj, resolvedName);
  }

  /**
   * Resolves the enum name from a branded enum's component ID or returns default.
   * @param enumObj - The enum object
   * @returns The resolved enum name
   */
  private resolveEnumName(enumObj: object): string {
    if (isBrandedEnum(enumObj)) {
      const componentId = getBrandedEnumComponentId(enumObj);
      return componentId ?? 'UnknownEnum';
    }
    return 'UnknownEnum';
  }

  /**
   * Translates a specific enum value into the target language.
   *
   * Supports both traditional enum values and branded enum values. The method
   * performs multiple lookup strategies to find the correct translation:
   *
   * ## Lookup Strategy
   *
   * 1. **Direct value lookup**: Try the string representation of the value
   * 2. **Numeric enum reverse mapping**: For numeric enums, find the string key
   * 3. **Branded enum key lookup**: For branded enums, find the enum key name
   *
   * ## Error Handling
   *
   * The method throws an error in the following cases:
   * - Enum not registered
   * - Language not found in translations
   * - Value not found in language translations
   *
   * If a custom `translateFn` was provided at construction, it will be used
   * to generate localized error messages.
   *
   * @template TEnum - Enum value type
   * @param enumObj - The enum object registered previously (traditional or branded)
   * @param value - The enum value to translate
   * @param language - The target language code
   * @returns The translated string
   * @throws {Error} If the enum, language, or value is not found
   *
   * @example Basic translation
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   * registry.register(Status, { en: { active: 'Active' }, es: { active: 'Activo' } });
   *
   * registry.translate(Status, Status.Active, 'en'); // 'Active'
   * registry.translate(Status, Status.Active, 'es'); // 'Activo'
   * ```
   *
   * @example Error handling
   * ```typescript
   * try {
   *   registry.translate(UnregisteredEnum, 'value', 'en');
   * } catch (error) {
   *   // Error: No translations found for enum: UnknownEnum
   * }
   * ```
   */
  public translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | AnyBrandedEnum,
    value: TEnum | BrandedEnumValue<AnyBrandedEnum>,
    language: TLanguage,
  ): string {
    const translations = this.translations.get(enumObj);
    if (!translations) {
      const message = this.translateFn
        ? this.translateFn('Error_EnumNotFoundTemplate' as TStringKey, {
            enumName: this.getEnumName(enumObj),
          })
        : `No translations found for enum: ${this.getEnumName(enumObj)}`;
      throw new Error(message);
    }

    const langTranslations = translations[language];
    if (!langTranslations) {
      const message = this.translateFn
        ? this.translateFn('Error_EnumLanguageNotFoundTemplate' as TStringKey, {
            language,
          })
        : `No translations found for language: ${language}`;
      throw new Error(message);
    }

    // Try direct lookup first
    let result = langTranslations[value as string | number];

    // For numeric enums, try the reverse mapping
    if (!result && typeof value === 'number') {
      const stringKey = Object.keys(enumObj).find(
        (key) => (enumObj as Record<string, TEnum>)[key] === value,
      );
      if (stringKey) {
        result = langTranslations[stringKey as TEnum];
      }
    }

    // For branded enums, try looking up by the enum key name
    if (!result && isBrandedEnum(enumObj)) {
      const enumKey = Object.keys(enumObj).find(
        (key) => (enumObj as Record<string, unknown>)[key] === value,
      );
      if (enumKey) {
        result = langTranslations[enumKey as TEnum];
      }
    }

    if (!result) {
      const message = this.translateFn
        ? this.translateFn('Error_EnumValueNotFoundTemplate' as TStringKey, {
            value: String(value),
          })
        : `No translation found for value: ${String(value)}`;
      throw new Error(message);
    }

    return result;
  }

  /**
   * Checks whether translations exist for the given enum object.
   *
   * Works with both traditional and branded enums. Uses object reference
   * equality to check registration status.
   *
   * @param enumObj - The enum object to check
   * @returns `true` if registered, `false` otherwise
   *
   * @example
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   *
   * registry.has(Status); // false (not registered yet)
   * registry.register(Status, { en: { active: 'Active' } });
   * registry.has(Status); // true
   * ```
   */
  public has(enumObj: object): boolean {
    return this.translations.has(enumObj);
  }

  /**
   * Internal: Retrieves the human-readable name of the enum.
   *
   * @param enumObj The enum object.
   * @returns Registered enum name or 'UnknownEnum' if not set.
   */
  private getEnumName(enumObj: object): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }

  /**
   * Internal: Validates that translation entries only use available languages.
   *
   * @template TEnum Enum value type.
   * @param translations Mapping of language codes to translations.
   * @param enumName Enum name for error reporting.
   * @throws {Error} If a translation language is not available.
   */
  private validateTranslations<TEnum extends string | number>(
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName: string,
  ): void {
    for (const language of Object.keys(translations) as TLanguage[]) {
      if (!this.availableLanguages.has(language)) {
        const message = this.translateFn
          ? this.translateFn(
              'Error_EnumLanguageNotAvailableTemplate' as TStringKey,
              { language, enumName },
            )
          : `Language '${language}' in enum '${enumName}' is not available in this registry`;
        throw new Error(message);
      }
    }
  }
}
