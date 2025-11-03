import { Language } from './default-config';
import { I18nEngine } from './i18n-engine';

export class TranslatableError<TStringKey extends string> extends Error {
  constructor(
    engine: I18nEngine<TStringKey, Language, any, any>,
    string: TStringKey,
    otherVars?: Record<string, string | number>,
    language?: Language,
  ) {
    super(engine.translate(string, otherVars, language));
    this.name = 'TranslatableError';
    Object.setPrototypeOf(this, TranslatableError.prototype);
  }
}
