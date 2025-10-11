import { CurrencyCode } from './currency-code';
import { Timezone } from './timezone';
import { ValidationConfig } from './validation-config';

/**
 * Registry configuration
 */
export interface RegistryConfig<TLanguages extends string> {
  readonly defaultLanguage: TLanguages;
  readonly fallbackLanguage: TLanguages;
  readonly defaultCurrencyCode: CurrencyCode;
  readonly timezone: Timezone;
  readonly adminTimezone: Timezone;
  readonly validation: ValidationConfig;
}
