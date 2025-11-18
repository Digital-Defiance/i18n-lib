import { ContextErrorType } from '../context-error-type';
import { CoreI18nComponentId, getCoreI18nEngine } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';

/**
 * Error class for context-related failures in the i18n system.
 * Thrown when attempting to access or manipulate an invalid or non-existent context.
 */
export class ContextError extends Error {
  /** The type of context error */
  public readonly type: ContextErrorType;
  /** The context key that caused the error, if applicable */
  public readonly contextKey?: string;

  /**
   * Creates a new ContextError instance.
   * @param type - The type of context error
   * @param contextKey - Optional context key that caused the error
   */
  constructor(type: ContextErrorType, contextKey?: string) {
    const engine = getCoreI18nEngine();
    const message = contextKey
      ? engine.safeTranslate(CoreI18nComponentId, CoreStringKey.Error_InvalidContextTemplate, {contextKey})
      : engine.safeTranslate(CoreI18nComponentId, CoreStringKey.Error_InvalidContext);
    super(message);
    this.name = 'ContextError';
    this.type = type;
    this.contextKey = contextKey;
  }
}
