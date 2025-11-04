import { CoreI18nComponentId, getCoreI18nEngine } from '../core-i18n';

export class TranslatableError<TStringKey extends string> extends Error {
  constructor(
    string: TStringKey,
    otherVars?: Record<string, string | number>,
    language?: string,
  ) {
    const engine = getCoreI18nEngine();
    super(engine.safeTranslate(CoreI18nComponentId, string, otherVars, language));
    this.name = 'TranslatableError';
    Object.setPrototypeOf(this, TranslatableError.prototype);
  }
}
