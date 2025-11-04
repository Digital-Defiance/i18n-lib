/**
 * Language definition interface
 */

export interface LanguageDefinition {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isDefault?: boolean;
}
