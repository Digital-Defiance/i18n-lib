import { DefaultStringKey, Language, StringKey } from './default-config';
import { I18nEngine } from './i18n-engine';

/**
 * Type constraint to ensure reasonMap has entries for all enum values
 */
type CompleteReasonMap<TEnum extends Record<string, string | number>, TStringKey extends string> = 
  Record<TEnum[keyof TEnum], TStringKey>;

/**
 * Type-safe TypedError that ensures complete enum coverage
 */
export abstract class TypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string = StringKey
> extends Error {
  constructor(
    engine: I18nEngine<TStringKey, Language, Record<string, any>, string>,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: Language,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    if (!key) throw new Error(engine.translate(DefaultStringKey.Error_MissingTranslationKeyTemplate as any, { type }, language));
    super(engine.translate(key, otherVars, language));
    this.name = this.constructor.name;
  }
}

// Export the type for external use
export type { CompleteReasonMap };
