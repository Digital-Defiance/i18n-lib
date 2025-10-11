import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';
import {
  LanguageCodeCollection,
  LanguageContext,
  MasterStringsCollection,
} from './types';

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
