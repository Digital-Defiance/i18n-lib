import { EnumLanguageTranslation } from './types';

/**
 * Registry for managing enum translations across multiple languages.
 */
export class EnumTranslationRegistry<TStringKey extends string, TLanguage extends string> {
  protected translations = new Map<
    any,
    EnumLanguageTranslation<any, TLanguage>
  >();
  protected enumNames = new WeakMap<any, string>();
  protected availableLanguages: Set<TLanguage>;
  protected translateFn?: (key: TStringKey, vars?: Record<string, any>) => string;

  constructor(
    availableLanguages: TLanguage[],
    translateFn?: (key: TStringKey, vars?: Record<string, any>) => string
  ) {
    this.availableLanguages = new Set(availableLanguages);
    this.translateFn = translateFn;
  }

  /**
   * Registers an enumeration with its translations and a name.
   * @param enumObj The enumeration object
   * @param translations The translations for the enumeration
   * @param enumName The name of the enumeration
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
   * Translates a value from the given enumeration to the specified language.
   * @param enumObj The enumeration object
   * @param value The value to translate
   * @param language The target language for translation
   * @returns The translated string
   */
  public translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language: TLanguage,
  ): string {
    const translations = this.translations.get(enumObj);
    if (!translations) {
      const message = this.translateFn
        ? this.translateFn('Error_EnumNotFoundTemplate' as TStringKey, { enumName: this.getEnumName(enumObj) })
        : `No translations found for enum: ${this.getEnumName(enumObj)}`;
      throw new Error(message);
    }

    const langTranslations = translations[language];
    if (!langTranslations) {
      const message = this.translateFn
        ? this.translateFn('Error_EnumLanguageNotFoundTemplate' as TStringKey, { language })
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
        ? this.translateFn('Error_EnumValueNotFoundTemplate' as TStringKey, { value: String(value) })
        : `No translation found for value: ${String(value)}`;
      throw new Error(message);
    }

    return result;
  }

  /**
   * Gets the name of the enumeration.
   * @param enumObj The enumeration object
   * @returns The name of the enumeration
   */
  private getEnumName(enumObj: any): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }

  /**
   * Checks if the registry has translations for the given enumeration.
   * @param enumObj The enumeration object
   * @returns True if translations exist, false otherwise
   */
  has(enumObj: any): boolean {
    return this.translations.has(enumObj);
  }

  /**
   * Validates that enum translations only contain available languages.
   * @param translations The translations to validate
   * @param enumName The name of the enumeration for error messages
   */
  private validateTranslations<TEnum extends string | number>(
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName: string,
  ): void {
    for (const language of Object.keys(translations) as TLanguage[]) {
      if (!this.availableLanguages.has(language)) {
        const message = this.translateFn
          ? this.translateFn('Error_EnumLanguageNotAvailableTemplate' as TStringKey, { language, enumName })
          : `Language '${language}' in enum '${enumName}' is not available in this engine instance`;
        throw new Error(message);
      }
    }
  }
}
