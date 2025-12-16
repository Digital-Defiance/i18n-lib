import { EnumLanguageTranslation } from './types';
/**
 * Registry for managing translations of enum values across multiple languages.
 *
 * @template TStringKey Type of translation key used in error messages.
 * @template TLanguage Type of supported language codes.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnumTranslationRegistry<
  TStringKey extends string,
  TLanguage extends string,
> {
  protected translations = new Map<
    any,
    EnumLanguageTranslation<any, TLanguage>
  >();
  protected enumNames = new WeakMap<any, string>();
  protected availableLanguages: Set<TLanguage>;
  protected translateFn?: (
    key: TStringKey,
    vars?: Record<string, any>,
  ) => string;

  /**
   * Creates a new EnumTranslationRegistry.
   *
   * @param availableLanguages Array of supported language codes.
   * @param translateFn Optional translation function for error templates.
   */
  constructor(
    availableLanguages: TLanguage[],
    translateFn?: (key: TStringKey, vars?: Record<string, any>) => string,
  ) {
    this.availableLanguages = new Set(availableLanguages);
    this.translateFn = translateFn;
  }

  /**
   * Registers an enum and its language-specific translations.
   *
   * @template TEnum Enum value type (string or number).
   * @param enumObj The enum object to register.
   * @param translations Mapping of language codes to value-to-string translations.
   * @param enumName Human-readable name of the enum (used in errors).
   * @throws {Error} If translations contain languages not in availableLanguages.
   */
  public register<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName: string,
  ): void {
    this.validateTranslations(translations, enumName);
    this.translations.set(enumObj, translations);
    this.enumNames.set(enumObj, enumName);
  }

  /**
   * Translates a specific enum value into the target language.
   *
   * @template TEnum Enum value type.
   * @param enumObj The enum object registered previously.
   * @param value The enum value to translate.
   * @param language The target language code.
   * @returns The translated string.
   * @throws {Error} If the enum or language or value is not found.
   */
  public translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
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

    let result = langTranslations[value];
    if (!result && typeof value === 'number') {
      const stringKey = Object.keys(enumObj).find(
        (key) => enumObj[key] === value,
      );
      if (stringKey) {
        result = langTranslations[stringKey as TEnum];
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
   * @param enumObj The enum object to check.
   * @returns True if registered, false otherwise.
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
