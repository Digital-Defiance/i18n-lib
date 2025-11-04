/**
 * Translation options interface
 */

export interface TranslationOptions {
  readonly variables?: Record<string, any>;
  readonly language?: string;
  readonly fallback?: string;
}
