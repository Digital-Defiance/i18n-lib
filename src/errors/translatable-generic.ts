import { I18nEngine } from '../core';
import { GenderCategory } from '../gender/gender-categories';

/**
 * Generic translatable error that works with any plugin engine and component.
 *
 * **Full i18n 3.0/3.5 Feature Support:**
 * - ICU MessageFormat (all formatters: plural, select, selectordinal)
 * - Pluralization for 37 languages with CLDR rules
 * - Gender-aware translations (male, female, neutral, other)
 * - Number formatting (integer, currency, percent)
 * - Date/Time formatting (short, medium, long, full)
 * - Nested messages up to 4 levels deep
 * - Context variable injection
 *
 * **Usage Examples:**
 * ```typescript
 * // Plural-aware error
 * new TranslatableGenericError('component', 'errorKey', { count: 5 });
 * // Translation: \"{count, plural, one {# error} other {# errors}}\"
 *
 * // Gender-aware error
 * new TranslatableGenericError('component', 'userError', { gender: 'female', name: 'Alice' });
 * // Translation: \"{gender, select, male {He} female {She}} {name} caused an error\"
 *
 * // Number formatting
 * new TranslatableGenericError('component', 'thresholdError', { value: 1500.50, limit: 1000 });
 * // Translation: \"Value {value, number, currency} exceeds {limit, number, currency}\"
 *
 * // SelectOrdinal
 * new TranslatableGenericError('component', 'stepError', { step: 3 });
 * // Translation: \"Failed at {step, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} step\"
 * ```
 */
export class TranslatableGenericError<
  TStringKey extends string = string,
> extends Error {
  public readonly stringKey: TStringKey;
  public override readonly componentId: string;
  public readonly language?: string;
  public readonly variables?: Record<string, string | number>;
  public override readonly metadata?: Record<string, any>;

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
  ) {
    let translatedMessage: string;

    try {
      const engine = I18nEngine.getInstance(instanceKey);
      translatedMessage = engine.safeTranslate(
        componentId,
        stringKey,
        variables,
        language,
      );
    } catch (error) {
      // If engine not found or translation fails, use fallback format
      translatedMessage = `[${componentId}.${stringKey}]`;
    }

    super(translatedMessage);
    this.name = 'TranslatableGenericError';
    this.stringKey = stringKey;
    this.componentId = componentId;
    this.language = language;
    this.variables = variables;
    this.metadata = metadata;
  }

  /**
   * Create error with explicit engine instance
   */
  static withEngine<TStringKey extends string>(
    engine: I18nEngine,
    componentId: string,
    stringKey: TStringKey,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
  ): TranslatableGenericError<TStringKey> {
    const translatedMessage = engine.safeTranslate(
      componentId,
      stringKey,
      variables,
      language,
    );

    const error = Object.create(TranslatableGenericError.prototype);
    Error.call(error, translatedMessage);
    error.name = 'TranslatableGenericError';
    error.stringKey = stringKey;
    error.componentId = componentId;
    error.language = language;
    error.variables = variables;
    error.metadata = metadata;
    error.message = translatedMessage;

    return error;
  }

  /**
   * Retranslate the error message in a different language
   */
  retranslate(language: string, instanceKey?: string): string {
    try {
      const engine = I18nEngine.getInstance(instanceKey);
      return engine.safeTranslate(
        this.componentId,
        this.stringKey,
        this.variables,
        language,
      );
    } catch (error) {
      return `[${this.componentId}.${this.stringKey}]`;
    }
  }

  /**
   * Create error with plural count
   * Translation string should use ICU plural format
   */
  static withCount<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    count: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
  ): TranslatableGenericError<TStringKey> {
    return new TranslatableGenericError(
      componentId,
      stringKey,
      { ...otherVars, count },
      language,
      undefined,
      instanceKey,
    );
  }

  /**
   * Create error with gender context
   * Translation string should use ICU select format
   */
  static withGender<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    gender: GenderCategory,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
  ): TranslatableGenericError<TStringKey> {
    return new TranslatableGenericError(
      componentId,
      stringKey,
      { ...otherVars, gender },
      language,
      undefined,
      instanceKey,
    );
  }

  /**
   * Create error with ordinal number
   * Translation string should use ICU selectordinal format
   */
  static withOrdinal<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    ordinalNumber: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
  ): TranslatableGenericError<TStringKey> {
    return new TranslatableGenericError(
      componentId,
      stringKey,
      { ...otherVars, ordinalNumber },
      language,
      undefined,
      instanceKey,
    );
  }

  /**
   * Create error with number formatting
   * Translation string should use ICU number format
   */
  static withNumberFormat<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    value: number,
    otherVars?: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
  ): TranslatableGenericError<TStringKey> {
    return new TranslatableGenericError(
      componentId,
      stringKey,
      { ...otherVars, value },
      language,
      undefined,
      instanceKey,
    );
  }

  /**
   * Create error with multiple i18n features combined
   * Translation string can use nested ICU messages
   */
  static withMultipleFeatures<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    features: Record<string, string | number>,
    language?: string,
    instanceKey?: string,
  ): TranslatableGenericError<TStringKey> {
    return new TranslatableGenericError(
      componentId,
      stringKey,
      features,
      language,
      undefined,
      instanceKey,
    );
  }
}
