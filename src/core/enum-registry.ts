/**
 * Enum translation registry (v2 - no generics)
 */

import { I18nError } from '../errors';

/**
 * Registry for managing translations of enum values across multiple languages.
 * Provides a centralized way to register and translate enum values.
 */
export class EnumRegistry {
  private translations = new Map<any, Record<string, Record<string, string>>>();
  private enumNames = new WeakMap<any, string>();
  private translateFn?: (key: string, vars?: Record<string, any>) => string;

  /**
   * Creates a new EnumRegistry instance.
   * @param translateFn - Optional translation function for error messages
   */
  constructor(
    translateFn?: (key: string, vars?: Record<string, any>) => string,
  ) {
    this.translateFn = translateFn;
  }

  /**
   * Registers an enum with its translations for all languages.
   * @template TEnum - The enum value type (string or number)
   * @param enumObj - The enum object to register
   * @param translations - Mapping of language codes to enum value translations
   * @param enumName - Human-readable name for the enum (used in error messages)
   */
  register<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: Record<string, Record<string, string>>,
    enumName: string,
  ): void {
    this.translations.set(enumObj, translations);
    this.enumNames.set(enumObj, enumName);
  }

  /**
   * Translates an enum value to a specific language.
   * @template TEnum - The enum value type
   * @param enumObj - The registered enum object
   * @param value - The enum value to translate
   * @param language - The target language code
   * @returns The translated string
   * @throws {I18nError} If the enum, language, or value is not found
   */
  translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
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
        (key) => enumObj[key] === value,
      );
      if (stringKey) {
        result = langTranslations[stringKey];
      }
    }

    if (!result) {
      throw I18nError.translationMissing('enum', String(value), language);
    }

    return result;
  }

  /**
   * Checks if an enum has been registered.
   * @param enumObj - The enum object to check
   * @returns True if the enum is registered, false otherwise
   */
  has(enumObj: any): boolean {
    return this.translations.has(enumObj);
  }

  /**
   * Gets the human-readable name of an enum.
   * @param enumObj - The enum object
   * @returns The enum name or 'UnknownEnum' if not set
   */
  private getEnumName(enumObj: any): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }
}
