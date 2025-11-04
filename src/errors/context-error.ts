import { ContextErrorType } from '../context-error-type';
import { CoreI18nComponentId, getCoreI18nEngine } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';

export class ContextError extends Error {
  public readonly type: ContextErrorType;
  public readonly contextKey?: string;

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
