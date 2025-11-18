/**
 * Language definition interface
 */

/**
 * Defines a language with its metadata.
 */
export interface LanguageDefinition {
  /** Unique identifier for the language (e.g., 'en-US') */
  readonly id: string;
  /** Display name in the native language */
  readonly name: string;
  /** ISO language code */
  readonly code: string;
  /** Whether this is the default/fallback language */
  readonly isDefault?: boolean;
}
