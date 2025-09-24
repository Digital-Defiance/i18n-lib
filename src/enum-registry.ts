import { EnumLanguageTranslation } from './types';

export class EnumTranslationRegistry<TLanguage extends string> {
  private translations = new Map<
    any,
    EnumLanguageTranslation<any, TLanguage>
  >();
  private enumNames = new WeakMap<any, string>();

  register<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName: string,
  ): void {
    this.translations.set(enumObj, translations);
    this.enumNames.set(enumObj, enumName);
  }

  translate<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language: TLanguage,
  ): string {
    const translations = this.translations.get(enumObj);
    if (!translations) {
      throw new Error(
        `No translations found for enum: ${this.getEnumName(enumObj)}`,
      );
    }

    const langTranslations = translations[language];
    if (!langTranslations) {
      throw new Error(`No translations found for language: ${language}`);
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
      throw new Error(`No translation found for value: ${String(value)}`);
    }

    return result;
  }

  private getEnumName(enumObj: any): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }

  has(enumObj: any): boolean {
    return this.translations.has(enumObj);
  }
}
