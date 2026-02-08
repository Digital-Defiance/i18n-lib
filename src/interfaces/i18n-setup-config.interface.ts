import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import type { PluralString } from '../types/plural-types';
import type { I18nComponentPackage } from './i18n-component-package.interface';

/**
 * Configuration for the createI18nSetup factory function.
 */
export interface I18nSetupConfig {
  /** Unique component ID for the application */
  readonly componentId: string;
  /** Branded string key enum for the application component */
  readonly stringKeyEnum: AnyBrandedEnum;
  /** Translation strings organized by language code, then by key */
  readonly strings: Record<string, Record<string, string | PluralString>>;
  /** Optional aliases for the application component */
  readonly aliases?: readonly string[];
  /** Optional constants to merge into the engine */
  readonly constants?: Record<string, unknown>;
  /** Library component packages to register before the app component */
  readonly libraryComponents?: readonly I18nComponentPackage[];
  /** Default language code (defaults to 'en-US') */
  readonly defaultLanguage?: string;
  /** Engine instance key (defaults to 'default') */
  readonly instanceKey?: string;
}
