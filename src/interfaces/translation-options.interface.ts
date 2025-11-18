/**
 * Translation options interface
 */

/**
 * Options that can be passed when requesting a translation.
 */
export interface TranslationOptions {
  /** Variables to replace in template strings */
  readonly variables?: Record<string, any>;
  /** Language code to use for the translation */
  readonly language?: string;
  /** Fallback value to return if translation fails */
  readonly fallback?: string;
}
