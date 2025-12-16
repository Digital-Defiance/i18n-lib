/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { ContextErrorType } from '../context-error-type';
import { CoreI18nComponentId } from '../core-component-id';
import { CoreStringKey } from '../core-string-key';
import { EnhancedErrorHelper } from './enhanced-error-base';

// Lazy reference to I18nEngine to avoid circular dependencies
let engineGetter: (() => any) | undefined;

/**
 * Error class for context-related failures in the i18n system.
 * Thrown when attempting to access or manipulate an invalid or non-existent context.
 *
 * **i18n Feature Support:**
 * - ICU MessageFormat variable substitution
 * - Nested message paths detection
 * - Number formatting for context depths/positions
 * - SelectOrdinal for context priority levels
 *
 * **Translation String Examples:**
 * ```typescript
 * // ICU plural
 * "Context has {count, plural, one {# issue} other {# issues}}"
 *
 * // ICU select + nested
 * "{severity, select, low {Minor context issue} high {Critical context error}}"
 *
 * // Number formatting
 * "Context exceeded {limit, number, integer} maximum depth"
 * ```
 */
export class ContextError extends Error {
  /** The type of context error */
  public override readonly type: ContextErrorType;
  /** The context key that caused the error, if applicable */
  public readonly contextKey?: string;
  /** Additional context metadata */
  public override readonly metadata?: Record<string, any>;

  /**
   * Creates a new ContextError instance.
   * @param type - The type of context error
   * @param contextKey - Optional context key that caused the error
   * @param variables - Additional variables for ICU message formatting
   * @param language - Optional language code
   */
  constructor(
    type: ContextErrorType,
    contextKey?: string,
    variables?: Record<string, string | number>,
    language?: string,
  ) {
    // Lazy initialization: get engine instance at runtime to avoid circular dependencies
    let message: string;
    try {
      // Lazy load I18nEngine to break circular dependency
      if (!engineGetter) {
        // Dynamically import at runtime
        const coreModule = eval('require')('../core');
        engineGetter = () => coreModule.I18nEngine.getInstance('default');
      }
      const engine = engineGetter();
      const allVars = { ...variables, contextKey: contextKey || '' };
      message = contextKey
        ? engine.safeTranslate(
            CoreI18nComponentId,
            CoreStringKey.Error_InvalidContextTemplate,
            allVars,
            language,
          )
        : engine.safeTranslate(
            CoreI18nComponentId,
            CoreStringKey.Error_InvalidContext,
            allVars,
            language,
          );
    } catch {
      // Fallback if engine not available
      message = contextKey
        ? `Invalid context: ${contextKey}`
        : 'Invalid context';
    }
    super(message);
    this.name = 'ContextError';
    this.type = type;
    this.contextKey = contextKey;
    this.metadata = variables;
  }

  /**
   * Create context error with nested path information
   * Demonstrates selectordinal for depth level
   */
  static withNestedPath(
    type: ContextErrorType,
    contextPath: string,
    language = 'en-US',
  ): ContextError {
    const analysis = EnhancedErrorHelper.analyzeKeyPath(contextPath);
    return new ContextError(
      type,
      contextPath,
      {
        depth: analysis.depth,
        isNested: analysis.isNested ? 'true' : 'false',
      },
      language,
    );
  }

  /**
   * Create context error with count information
   * Demonstrates plural formatting
   */
  static withCount(
    type: ContextErrorType,
    contextKey: string,
    count: number,
    language = 'en-US',
  ): ContextError {
    return new ContextError(type, contextKey, { count }, language);
  }
}
