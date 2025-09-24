import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';

/**
 * Standard language contexts
 */
export type LanguageContext = 'admin' | 'user' | 'system' | 'api';

/**
 * Default currency code
 */
export const DefaultCurrencyCode: string = 'USD';

/**
 * Currency position type
 */
export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

/**
 * Custom language context type
 */
export type CustomLanguageContext<T extends string = LanguageContext> = T;

/**
 * Collection of localized strings for a specific language
 */
export type StringsCollection<TStringKey extends string> = Partial<
  Record<TStringKey, string>
>;

/**
 * Mapping of languages to their respective string collections
 */
export type MasterStringsCollection<
  TStringKey extends string,
  TLanguage extends string,
> = Partial<Record<TLanguage, StringsCollection<TStringKey>>>;

/**
 * Mapping of language codes to their respective languages
 */
export type LanguageCodeCollection<TLanguage extends string> = Partial<
  Record<TLanguage, string>
>;

/**
 * Mapping of enumeration values to their translations in multiple languages
 */
export type EnumTranslationMap<
  TEnum extends string | number,
  TLanguage extends string,
> = Partial<Record<TLanguage, Partial<Record<TEnum, string>>>>;

/**
 * I18n configuration interface
 */
export interface I18nConfig<
  TStringKey extends string,
  TLanguage extends string,
  TConstants extends Record<string, any> = Record<string, any>,
  TTranslationContext extends string = LanguageContext,
> {
  stringNames: TStringKey[];
  strings: MasterStringsCollection<TStringKey, TLanguage>;
  defaultLanguage: TLanguage;
  defaultTranslationContext: TTranslationContext;
  defaultCurrencyCode: CurrencyCode;
  languageCodes: LanguageCodeCollection<TLanguage>;
  languages: TLanguage[];
  constants?: TConstants;
  enumName?: string;
  enumObj?: Record<string, TStringKey>;
  timezone: Timezone;
  adminTimezone: Timezone;
}

/**
 * I18n context interface
 */
export interface I18nContext<
  TLanguage extends string,
  TTranslationContext extends string = LanguageContext,
> {
  language: TLanguage;
  adminLanguage: TLanguage;
  currencyCode: CurrencyCode;
  currentContext: TTranslationContext;
  timezone: Timezone;
  adminTimezone: Timezone;
}

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
