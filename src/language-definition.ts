/**
 * Language definition with its properties
 */
export interface LanguageDefinition {
  /** Unique identifier for the language */
  readonly id: string;
  /** Display name in the native language */
  readonly name: string;
  /** ISO language code (e.g., 'en', 'fr', 'zh-CN') */
  readonly code: string;
  /** Whether this is the fallback/default language */
  readonly isDefault?: boolean;
}
