import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';
import { LanguageContextSpace } from './types';

/**
 * I18n context interface
 */
export interface I18nContext<TLanguage extends string> {
  language: TLanguage;
  adminLanguage: TLanguage;
  currencyCode: CurrencyCode;
  currentContext: LanguageContextSpace;
  timezone: Timezone;
  adminTimezone: Timezone;
}
