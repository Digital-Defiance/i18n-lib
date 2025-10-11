import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';
import { LanguageContext } from './types';

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
