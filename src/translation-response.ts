
/**
 * Translation response interface
 */
export interface TranslationResponse {
  readonly translation: string;
  readonly actualLanguage: string;
  readonly wasFallback: boolean;
}