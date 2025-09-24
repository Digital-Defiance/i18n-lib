import { LanguageContext } from './types';
import { Timezone } from './timezone';
import { CurrencyCode } from './currency-code';

export interface IActiveContext<TLanguage extends string> {
  /**
   * The default language for the user facing application
   */
  language: TLanguage;
  /**
   * The default language for the admin interface
   */
  adminLanguage: TLanguage;
  /**
   * The default currency code for the user facing application
   */
  currencyCode: CurrencyCode;
  /**
   * The default language context for the current context
   */
  currentContext: LanguageContext;
  /**
   * The default timezone for the user facing application
   */
  timezone: Timezone;
  /**
   * The default timezone for the admin interface
   */
  adminTimezone: Timezone;
}
