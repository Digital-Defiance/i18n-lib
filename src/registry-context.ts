import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';

/**
 * Translation context similar to existing I18nContext
 */
export interface RegistryContext<TLanguages extends string> {
  currentLanguage: TLanguages;
  fallbackLanguage: TLanguages;
  currencyCode: CurrencyCode;
  timezone: Timezone;
  adminTimezone: Timezone;
}
