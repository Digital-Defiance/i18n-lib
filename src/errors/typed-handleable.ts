import { CoreI18nComponentId } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';
import { HandleableError } from './handleable';
import { IHandleable } from '../interfaces/handleable';
import { HandleableErrorOptions } from '../interfaces/handleable-error-options';
import { PluginI18nEngine } from '../plugin-i18n-engine';
import { CompleteReasonMap } from './typed';
import { I18nEngine } from '../core';

export class TypedHandleableError<
    TEnum extends Record<string, string>,
    TStringKey extends string,
  >
  extends HandleableError
  implements IHandleable
{
  public readonly type: TEnum[keyof TEnum];
  public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>;
  public readonly language?: string;
  public readonly otherVars?: Record<string, string | number>;

  constructor(
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    componentId: string,
    language?: string,
    otherVars?: Record<string, string | number>,
    options?: HandleableErrorOptions,
  ) {
    const key = reasonMap[type];
    if (!key) {
      const coreEngine = PluginI18nEngine.getInstance();
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
      const translated = engine.translate(componentId, keyString, otherVars, language);
      message = String(translated || type);
    } catch (error) {
      message = String(type);
    }

    super(new Error(message), options);

    this.type = type;
    this.reasonMap = reasonMap;
    this.language = language;
    this.otherVars = otherVars;
  }

  public override toJSON(): Record<string, unknown> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      type: this.type,
    };
  }
}
