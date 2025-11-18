/**
 * Validation result interface
 */

/**
 * Result of validating a component registration or the entire engine.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  readonly isValid: boolean;
  /** Array of validation errors */
  readonly errors: readonly string[];
  /** Array of validation warnings */
  readonly warnings: readonly string[];
  /** Detailed information about missing translation keys */
  readonly missingKeys?: readonly {
    /** The language ID where the key is missing */
    languageId: string;
    /** The component ID where the key is missing */
    componentId: string;
    /** The string key that is missing */
    stringKey: string;
  }[];
}
