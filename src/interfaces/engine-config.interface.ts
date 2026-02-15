/**
 * Engine configuration interface
 */

import type { II18nConstants } from './i18n-constants.interface';

/**
 * Configuration options for the I18n engine.
 */
export interface EngineConfig {
  /** Default language to use when none is specified */
  defaultLanguage?: string;
  /** Fallback language to use when a translation is missing */
  fallbackLanguage?: string;
  /** Constants available for variable replacement in templates */
  constants?: II18nConstants;
  /** Validation configuration */
  validation?: {
    /** Whether all string keys must be provided for all languages */
    requireCompleteStrings?: boolean;
    /** Whether to allow component registration with missing translations */
    allowPartialRegistration?: boolean;
  };
}
