/**
 * Enum translation registry (v2 - no generics)
 *
 * This module provides the `EnumRegistry` class for managing translations of enum
 * values across multiple languages. It supports both traditional TypeScript enums
 * and branded enums from `@digitaldefiance/branded-enum`.
 *
 * ## Overview
 *
 * The `EnumRegistry` is the v2 implementation of enum translation management,
 * designed to work with the `I18nEngine`. It provides:
 *
 * - Registration of enums with their translations
 * - Translation of enum values to localized strings
 * - Automatic name inference for branded enums
 * - Full backward compatibility with traditional enums
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
 * const registry = new EnumRegistry();
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
 * const registry = new EnumRegistry();
 * registry.register(Status, {
 *   en: { active: 'Active', inactive: 'Inactive' },
 * }); // Name 'status' is inferred from branded enum
 *
 * registry.translate(Status, Status.Active, 'en'); // 'Active'
 * ```
 *
 * @module core/enum-registry
 * @see {@link EnumTranslationRegistry} - Legacy registry with language validation
 * @see {@link I18nEngine} - Main engine that uses this registry
 */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import {
  isBrandedEnum,
  getBrandedEnumComponentId,
} from '../branded-enum-utils';
import { I18nError } from '../errors/i18n-error';

/**
 * Registry for managing translations of enum values across multiple languages.
 *
 * Provides a centralized way to register and translate enum values with support
 * for both traditional TypeScript enums and branded enums from
 * `@digitaldefiance/branded-enum`.
 *
 * ## Key Features
 *
 * - **Dual Enum Support**: Works with both traditional and branded enums
 * - **Automatic Name Inference**: Branded enums can have their name inferred from component ID
 * - **Multi-Language**: Supports translations across any number of languages
 * - **Type Safety**: Full TypeScript support with proper type inference
 *
 * ## Registration
 *
 * Use {@link register} to add an enum with its translations. For branded enums,
 * the `enumName` parameter is optional and will be inferred from the component ID.
 *
 * ## Translation
 *
 * Use {@link translate} to get the localized string for an enum value. The method
 * handles both traditional enum values and branded enum values.
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
 * // Create registry and register enum
 * const registry = new EnumRegistry();
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
 */
export class EnumRegistry {
  private translations = new Map<
    object,
    Record<string, Record<string, string>>
  >();
  private enumNames = new WeakMap<object, string>();
  private translateFn?: (key: string, vars?: Record<string, unknown>) => string;

  /**
   * Creates a new EnumRegistry instance.
   * @param translateFn - Optional translation function for error messages
   */
  constructor(
    translateFn?: (key: string, vars?: Record<string, unknown>) => string,
  ) {
    this.translateFn = translateFn;
  }

  /**
   * Registers an enum with its translations for all languages.
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
   * ## Translation Structure
   *
   * The `translations` object should map language codes to objects that map
   * enum values to their translated strings:
   *
   * ```typescript
   * {
   *   'en': { 'value1': 'Translation 1', 'value2': 'Translation 2' },
   *   'es': { 'value1': 'Traducción 1', 'value2': 'Traducción 2' },
   * }
   * ```
   *
   * @template TEnum - The enum value type (string or number)
   * @param enumObj - The enum object to register (traditional or branded)
   * @param translations - Mapping of language codes to enum value translations
   * @param enumName - Human-readable name for the enum (optional for branded enums)
   * @returns The registered translations object
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
   * @example Branded enum with explicit name override
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   *
   * // Override the inferred name with a custom name
   * registry.register(Status, {
   *   en: { active: 'Active' },
   * }, 'UserStatus');
   * ```
   */
  register<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | AnyBrandedEnum,
    translations: Record<string, Record<string, string>>,
    enumName?: string,
  ): Record<string, Record<string, string>> {
    const resolvedName = enumName ?? this.resolveEnumName(enumObj);
    this.translations.set(enumObj, translations);
    this.enumNames.set(enumObj, resolvedName);
    return translations;
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
   * Translates an enum value to a specific language.
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
   * The method throws `I18nError` in the following cases:
   * - Enum not registered: `I18nError.invalidConfig`
   * - Language not found: `I18nError.languageNotFound`
   * - Value not found: `I18nError.translationMissing`
   *
   * @template TEnum - The enum value type
   * @param enumObj - The registered enum object (traditional or branded)
   * @param value - The enum value to translate
   * @param language - The target language code
   * @returns The translated string
   * @throws {I18nError} If the enum, language, or value is not found
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
   *   // I18nError: No translations found for enum: UnknownEnum
   * }
   * ```
   */
  translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | AnyBrandedEnum,
    value: TEnum | BrandedEnumValue<AnyBrandedEnum>,
    language: string,
  ): string {
    const translations = this.translations.get(enumObj);
    if (!translations) {
      throw I18nError.invalidConfig(
        `No translations found for enum: ${this.getEnumName(enumObj)}`,
      );
    }

    const langTranslations = translations[language];
    if (!langTranslations) {
      throw I18nError.languageNotFound(language);
    }

    // Convert value to string for lookup
    const valueKey = String(value);
    let result = langTranslations[valueKey];

    // For numeric enums, also try the reverse mapping (string key to value)
    if (!result && typeof value === 'number') {
      const stringKey = Object.keys(enumObj).find(
        (key) => (enumObj as Record<string, TEnum>)[key] === value,
      );
      if (stringKey) {
        result = langTranslations[stringKey];
      }
    }

    // For branded enums, try looking up by the enum key name
    if (!result && isBrandedEnum(enumObj)) {
      const enumKey = Object.keys(enumObj).find(
        (key) => (enumObj as Record<string, unknown>)[key] === value,
      );
      if (enumKey) {
        result = langTranslations[enumKey];
      }
    }

    if (!result) {
      throw I18nError.translationMissing('enum', String(value), language);
    }

    return result;
  }

  /**
   * Checks if an enum has been registered.
   *
   * Works with both traditional and branded enums. Uses object reference
   * equality to check registration status.
   *
   * @param enumObj - The enum object to check
   * @returns `true` if the enum is registered, `false` otherwise
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
  has(enumObj: object): boolean {
    return this.translations.has(enumObj);
  }

  /**
   * Gets the human-readable name of an enum.
   * @param enumObj - The enum object
   * @returns The enum name or 'UnknownEnum' if not set
   */
  private getEnumName(enumObj: object): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }
}
