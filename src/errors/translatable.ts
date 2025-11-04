import { I18nEngine } from '../core/i18n-engine';

export class TranslatableError<TStringKey extends string = string> extends Error {
  constructor(
    componentId: string,
    stringKey: TStringKey,
    otherVars?: Record<string, string | number>,
    language?: string,
  ) {
    const engine = I18nEngine.getInstance('default');
    super(engine.safeTranslate(componentId, stringKey, otherVars, language));
    this.name = 'TranslatableError';
    Object.setPrototypeOf(this, TranslatableError.prototype);
  }
}
