/**
 * Configuration for component registration validation
 */
export interface ValidationConfig {
  /** Whether to require all languages to have all strings */
  readonly requireCompleteStrings: boolean;
  /** Whether to allow registration with missing strings (will use fallbacks) */
  readonly allowPartialRegistration: boolean;
  /** Default language to fall back to for missing strings */
  readonly fallbackLanguageId: string;
}
