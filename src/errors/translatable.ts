import { I18nEngine } from '../core/i18n-engine';
import { PluralCategory } from '../pluralization/plural-categories';
import { GenderCategory } from '../gender/gender-categories';

/**
 * Translatable error class with full i18n 3.0/3.5 feature support.
 * 
 * **Supported Features:**
 * - ICU MessageFormat (variables, plural, select, selectordinal)
 * - Pluralization (37 languages, CLDR rules)
 * - Gender-aware translations
 * - Number formatting (integer, currency, percent)
 * - Date/Time formatting
 * - Nested messages (4 levels deep)
 * - Context variables
 * 
 * **Translation String Examples:**
 * ```typescript
 * // ICU plural
 * "{count, plural, one {# error occurred} other {# errors occurred}}"
 * 
 * // ICU select + gender
 * "{gender, select, male {He encountered} female {She encountered}} an error"
 * 
 * // Number formatting
 * "Threshold {limit, number, integer} exceeded by {value, number, percent}"
 * 
 * // SelectOrdinal
 * "Failed at {step, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} step"
 * 
 * // Nested messages
 * "{severity, select, low {Minor: {count, plural, one {# issue} other {# issues}}} high {Critical error}}"
 * ```
 */
export class TranslatableError<TStringKey extends string = string> extends Error {
  public readonly componentId: string;
  public readonly stringKey: TStringKey;
  public readonly variables?: Record<string, string | number>;
  public readonly language?: string;

  constructor(
    componentId: string,
    stringKey: TStringKey,
    otherVars?: Record<string, string | number>,
    language?: string,
  ) {
    const engine = I18nEngine.getInstance('default');
    super(engine.safeTranslate(componentId, stringKey, otherVars, language));
    this.name = 'TranslatableError';
    this.componentId = componentId;
    this.stringKey = stringKey;
    this.variables = otherVars;
    this.language = language;
    Object.setPrototypeOf(this, TranslatableError.prototype);
  }

  /**
   * Create error with plural count
   * Translation string should use: {count, plural, one {...} other {...}}
   */
  static withCount<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    count: number,
    otherVars?: Record<string, string | number>,
    language?: string,
  ): TranslatableError<TStringKey> {
    return new TranslatableError(
      componentId,
      stringKey,
      { ...otherVars, count },
      language,
    );
  }

  /**
   * Create error with gender context
   * Translation string should use: {gender, select, male {...} female {...} other {...}}
   */
  static withGender<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    gender: GenderCategory,
    otherVars?: Record<string, string | number>,
    language?: string,
  ): TranslatableError<TStringKey> {
    return new TranslatableError(
      componentId,
      stringKey,
      { ...otherVars, gender },
      language,
    );
  }

  /**
   * Create error with ordinal number
   * Translation string should use: {number, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}
   */
  static withOrdinal<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    number: number,
    otherVars?: Record<string, string | number>,
    language?: string,
  ): TranslatableError<TStringKey> {
    return new TranslatableError(
      componentId,
      stringKey,
      { ...otherVars, number },
      language,
    );
  }

  /**
   * Create error with formatted number
   * Translation string should use: {value, number, integer|currency|percent}
   */
  static withNumber<TStringKey extends string>(
    componentId: string,
    stringKey: TStringKey,
    value: number,
    otherVars?: Record<string, string | number>,
    language?: string,
  ): TranslatableError<TStringKey> {
    return new TranslatableError(
      componentId,
      stringKey,
      { ...otherVars, value },
      language,
    );
  }
}
