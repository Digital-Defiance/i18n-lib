/**
 * Validation result for component registration
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly missingKeys: ReadonlyArray<{
    readonly languageId: string;
    readonly componentId: string;
    readonly stringKey: string;
  }>;
  readonly errors: readonly string[];
}
