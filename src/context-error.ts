import { ContextErrorType } from './context-error-type';
import { CoreLanguage } from './core-language';
import { CoreStringKey } from './core-string-key';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { CoreTypedError } from './typed-error';

export class ContextError extends CoreTypedError<typeof ContextErrorType> {
  constructor(type: ContextErrorType, contextKey?: string) {
    const engine = PluginI18nEngine.getInstance<CoreLanguage>();
    super(
      engine,
      type,
      {
        [ContextErrorType.InvalidContext]:
          CoreStringKey.Error_InvalidContextTemplate,
      },
      undefined,
      { ...(contextKey && { contextKey }) },
    );
  }
}
