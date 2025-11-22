import { CoreI18nComponentId } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';
import { IHandleable } from '../interfaces/handleable';
import { HandleableErrorOptions } from '../interfaces/handleable-error-options';
import { HandleableError } from './handleable';

import { I18nEngine } from '../core';
import { CompleteReasonMap } from './typed';

/**
 * TypedHandleableError with full i18n feature support.
 *
 * Combines typed errors with handleable error patterns and full i18n capabilities.
 *
 * **Supported i18n Features** (via translation strings):
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - Nested messages: up to 4 levels deep
 *
 * **Translation String Examples:**
 * ```typescript
 * // Define error types
 * enum NetworkError {
 *   Timeout = 'timeout',
 *   RateLimit = 'rateLimit'
 * }
 *
 * // Register translations with ICU
 * engine.registerComponent({
 *   component: { id: 'network', stringKeys: ['timeout', 'rateLimit'] },
 *   strings: {
 *     'en-US': {
 *       timeout: \"{count, plural, one {# request timed out} other {# requests timed out}} after {seconds, number, integer} seconds\",
 *       rateLimit: \"Rate limit exceeded. {remaining, number, integer} requests remaining. Resets in {minutes, number, integer} minutes.\"
 *     }
 *   }
 * });
 *
 * // Use typed handleable error
 * try {
 *   await apiCall();
 * } catch (error) {
 *   throw new TypedHandleableError(
 *     'network',
 *     NetworkError.Timeout,
 *     reasonMap,
 *     error,
 *     { retryable: true },
 *     'en-US',
 *     { count: 1, seconds: 30 }
 *   );
 * }
 * // Result: \"1 request timed out after 30 seconds\"
 * ```
 */
export class TypedHandleableError<
    TEnum extends Record<string, string>,
    TStringKey extends string,
  >
  extends HandleableError
  implements IHandleable
{
  public override readonly componentId: string;
  public override readonly type: TEnum[keyof TEnum];
  public override readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>;
  public readonly language?: string;
  public readonly otherVars?: Record<string, string | number>;

  constructor(
    componentId: string,
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    source: Error,
    options?: HandleableErrorOptions,
    language?: string,
    otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    if (!key) {
      const coreEngine = I18nEngine.getInstance();
      throw new Error(
        coreEngine.translate(
          CoreI18nComponentId,
          CoreStringKey.Error_MissingTranslationKeyTemplate,
          {
            stringKey: key as string,
          },
        ),
      );
    }

    let message: string = String(type);
    try {
      const keyString = key as TStringKey;
      const engine = I18nEngine.getInstance('default');
      const translated = engine.translate(
        componentId,
        keyString,
        otherVars,
        language,
      );
      message = String(translated || type);
    } catch (error) {
      message = String(type);
    }

    // Create a new error with the translated message
    const errorWithMessage = new Error(message);
    if (source?.stack) {
      errorWithMessage.stack = source.stack;
    }

    // Pass source as cause if not already specified in options
    const finalOptions = options?.cause
      ? options
      : { ...options, cause: source };
    super(errorWithMessage, finalOptions);

    this.componentId = componentId;
    this.type = type;
    this.reasonMap = reasonMap;
    this.language = language;
    this.otherVars = otherVars;
    this.name = 'TypedHandleableError';
  }

  public override toJSON(): Record<string, unknown> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      type: this.type,
    };
  }
}
