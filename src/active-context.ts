import { CurrencyCode } from './utils/currency';
import { Timezone } from './utils/timezone';
import { LanguageContextSpace } from './types';

/**
 * Represents the active internationalization context for user and admin interfaces,
 * including language, currency, and timezone settings.
 *
 * @template TLanguage The type of language codes (e.g., 'en-US', 'fr').
 */
export interface IActiveContext<TLanguage extends string> {
  /**
   * The default language for the user-facing application.
   */
  language: TLanguage;

  /**
   * The default language for the admin interface.
   */
  adminLanguage: TLanguage;

  /**
   * The default currency code for the user-facing application.
   */
  currencyCode: CurrencyCode;

  /**
   * The current language context space (e.g., 'user' or 'admin').
   */
  currentContext: LanguageContextSpace;

  /**
   * The default timezone for the user-facing application.
   */
  timezone: Timezone;

  /**
   * The default timezone for the admin interface.
   */
  adminTimezone: Timezone;
}
