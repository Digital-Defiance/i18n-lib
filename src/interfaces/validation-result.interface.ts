/**
 * Validation result interface
 */

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly missingKeys?: readonly {
    languageId: string;
    componentId: string;
    stringKey: string;
  }[];
}
