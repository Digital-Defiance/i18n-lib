import { CurrencyCode } from './currency-code';
import { I18nContext } from './i18n-context';
import { Timezone } from './timezone';
import { LanguageContextSpace } from './types';

/**
 * Creates a new I18n context with default values.
 * @param defaultLanguage - The default language for the context
 * @param defaultContext - The default language context
 * @param defaultCurrencyCode - The default currency code (defaults to USD)
 * @param defaultTimezone - The default timezone (defaults to UTC)
 * @param defaultAdminTimezone - The default admin timezone (defaults to UTC)
 * @returns A new I18nContext instance
 */
export function createContext<TLanguage extends string>(
  defaultLanguage: TLanguage,
  defaultContext: LanguageContextSpace = 'admin',
  defaultCurrencyCode: CurrencyCode = new CurrencyCode('USD'),
  defaultTimezone: Timezone = new Timezone('UTC'),
  defaultAdminTimezone: Timezone = new Timezone('UTC'),
): I18nContext<TLanguage> {
  return {
    language: defaultLanguage,
    adminLanguage: defaultLanguage,
    currencyCode: defaultCurrencyCode,
    currentContext: defaultContext,
    timezone: defaultTimezone,
    adminTimezone: defaultAdminTimezone,
  };
}

/**
 * Sets the language for the given I18n context.
 * @param context - The I18n context to modify
 * @param language - The language to set
 */
export function setLanguage<TLanguage extends string>(
  context: I18nContext<TLanguage>,
  language: TLanguage,
): void {
  context.language = language;
}

/**
 * Sets the admin language for the given I18n context.
 * @param context - The I18n context to modify
 * @param language - The admin language to set
 */
export function setAdminLanguage<TLanguage extends string>(
  context: I18nContext<TLanguage>,
  language: TLanguage,
): void {
  context.adminLanguage = language;
}

/**
 * Sets the current context for the given I18n context.
 * @param context - The I18n context to modify
 * @param languageContext - The language context to set
 */
export function setContext<TLanguage extends string>(
  context: I18nContext<TLanguage>,
  languageContext: LanguageContextSpace,
): void {
  context.currentContext = languageContext;
}

/**
 * Sets the timezone for the given I18n context.
 * @param context - The I18n context to modify
 * @param timezone - The timezone to set
 */
export function setTimezone<TLanguage extends string>(
  context: I18nContext<TLanguage>,
  timezone: Timezone,
): void {
  context.timezone = timezone;
}

/**
 * Sets the admin timezone for the given I18n context.
 * @param context - The I18n context to modify
 * @param timezone - The admin timezone to set
 */
export function setAdminTimezone<TLanguage extends string>(
  context: I18nContext<TLanguage>,
  timezone: Timezone,
): void {
  context.adminTimezone = timezone;
}
