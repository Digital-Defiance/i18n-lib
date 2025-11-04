/**
 * Enum translation registry (v2 - no generics)
 */

import { I18nError } from '../errors';

export class EnumRegistry {
  private translations = new Map<any, Record<string, Record<string, string>>>();
  private enumNames = new WeakMap<any, string>();
  private translateFn?: (key: string, vars?: Record<string, any>) => string;

  constructor(translateFn?: (key: string, vars?: Record<string, any>) => string) {
    this.translateFn = translateFn;
  }

  register<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: Record<string, Record<TEnum, string>>,
    enumName: string,
  ): void {
    this.translations.set(enumObj, translations as any);
    this.enumNames.set(enumObj, enumName);
  }

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

    let result = langTranslations[value as any];
    if (!result && typeof value === 'number') {
      const stringKey = Object.keys(enumObj).find((key) => enumObj[key] === value);
      if (stringKey) {
        result = langTranslations[stringKey as any];
      }
    }

    if (!result) {
      throw I18nError.translationMissing('enum', String(value), language);
    }

    return result;
  }

  has(enumObj: any): boolean {
    return this.translations.has(enumObj);
  }

  private getEnumName(enumObj: any): string {
    return this.enumNames.get(enumObj) || 'UnknownEnum';
  }
}
