/**
 * Warning about string key collisions between components
 */
export interface CollisionWarning {
  /** The string key value that collides */
  readonly stringKey: string;
  /** The component IDs that share this key */
  readonly componentIds: readonly string[];
  /** Human-readable warning message */
  readonly message: string;
}

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
  /**
   * Warnings about string key collisions with other components.
   * These are non-fatal but may indicate routing issues.
   */
  collisionWarnings?: CollisionWarning[];
}
