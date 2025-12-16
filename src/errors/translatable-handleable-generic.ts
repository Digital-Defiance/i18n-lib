/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { GenderCategory } from '../gender/gender-categories';
import { IHandleable } from '../interfaces/handleable';
import { TranslatableGenericError } from './translatable-generic';

/**
 * Generic translatable handleable error with full i18n feature support.
 *
 * Combines translation capabilities with handleable error patterns and provides
 * static factory methods for all i18n features.
 *
 * **Supported i18n Features:**
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - Nested messages: complex multi-level patterns
 *
 * **Usage Examples:**
 * ```typescript
 * // Pluralization with handleable options
 * throw TranslatableHandleableGenericError.withCount(
 *   'api', 'validationError', 5,
 *   {}, 'en-US', 'default',
 *   { statusCode: 400 }
 * );
 *
 * // Gender-aware messages
 * throw TranslatableHandleableGenericError.withGender(
 *   'user', 'accountError', 'female',
 *   {}, 'en-US', 'default',
 *   { statusCode: 403 }
 * );
 *
 * // Number formatting with error handling
 * throw TranslatableHandleableGenericError.withNumberFormat(
 *   'payment', 'amountExceeded', 1599.99,
 *   { limit: 1000 }, 'en-US', 'default',
 *   { statusCode: 402 }
 * );
 *
 * // Ordinal formatting (1st, 2nd, 3rd)
 * throw TranslatableHandleableGenericError.withOrdinal(
 *   'workflow', 'stepFailed', 3,
 *   {}, 'en-US', 'default',
 *   { statusCode: 500, retryable: true }
 * );
 * ```
 */
export class TranslatableHandleableGenericError<
    TStringKey extends string = string,
  >
  extends TranslatableGenericError<TStringKey>
  implements IHandleable
{
  private _handled = false;
  public override readonly cause?: Error;
  public readonly statusCode: number;
  public readonly sourceData?: unknown;

  /**
   * Create a translatable error
   * @param componentId - The component ID to translate from
   * @param stringKey - The translation key
   * @param variables - Variables for interpolation
   * @param language - Optional language override
   * @param metadata - Additional error metadata
   * @param instanceKey - Optional engine instance key
   */
  constructor(
    componentId: string,
    stringKey: TStringKey,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ) {
    super(componentId, stringKey, variables, language, metadata, instanceKey);
    this.statusCode = handleableOptions?.statusCode ?? 500;
    this.cause = handleableOptions?.cause;
    this.sourceData = handleableOptions?.sourceData;
    this.name = 'TranslatableHandleableGenericError';
  }
  public get handled(): boolean {
    return this._handled;
  }
  public set handled(value: boolean) {
    this._handled = value;
  }
  toJSON(): Record<string, any> {
    return {
      statusCode: this.statusCode,
      message: this.message,
      cause: this.cause,
      sourceData: this.sourceData,
    };
  }

  /**
   * Create error with pluralization support
   * Translation string should include: "{count, plural, one {...} other {...}}"
   */
  static override withCount<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    count: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ): TranslatableHandleableGenericError<TStringKey> {
    return new TranslatableHandleableGenericError(
      componentId,
      stringKey,
      { count, ...otherVars },
      language,
      undefined,
      instanceKey,
      handleableOptions,
    );
  }

  /**
   * Create error with gender-aware messages
   * Translation string should include: "{gender, select, male {...} female {...} other {...}}"
   */
  static override withGender<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    gender: GenderCategory,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ): TranslatableHandleableGenericError<TStringKey> {
    return new TranslatableHandleableGenericError(
      componentId,
      stringKey,
      { gender, ...otherVars },
      language,
      undefined,
      instanceKey,
      handleableOptions,
    );
  }

  /**
   * Create error with ordinal formatting (1st, 2nd, 3rd)
   * Translation string should include: "{number, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}"
   */
  static override withOrdinal<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    ordinalNumber: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ): TranslatableHandleableGenericError<TStringKey> {
    return new TranslatableHandleableGenericError(
      componentId,
      stringKey,
      { number: ordinalNumber, ...otherVars },
      language,
      undefined,
      instanceKey,
      handleableOptions,
    );
  }

  /**
   * Create error with number formatting (currency, percent, integer)
   * Translation string should include: "{value, number, integer}" or "{amount, number, currency}"
   */
  static override withNumberFormat<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    value: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ): TranslatableHandleableGenericError<TStringKey> {
    return new TranslatableHandleableGenericError(
      componentId,
      stringKey,
      { value, ...otherVars },
      language,
      undefined,
      instanceKey,
      handleableOptions,
    );
  }

  /**
   * Create error with multiple i18n features combined
   * Translation string can combine: plural, select, number formatting, etc.
   */
  static override withMultipleFeatures<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    features: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
    handleableOptions?: {
      statusCode?: number;
      cause?: Error;
      sourceData?: unknown;
    },
  ): TranslatableHandleableGenericError<TStringKey> {
    return new TranslatableHandleableGenericError(
      componentId,
      stringKey,
      features,
      language,
      undefined,
      instanceKey,
      handleableOptions,
    );
  }
}
