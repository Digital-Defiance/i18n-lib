import { CoreI18nComponentId } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';
import { HandleableError } from './handleable';
import { IHandleable } from '../interfaces/handleable';
import { HandleableErrorOptions } from '../interfaces/handleable-error-options';

import { CompleteReasonMap } from './typed';
import { I18nEngine } from '../core';

export class TypedHandleableError<
    TEnum extends Record<string, string>,
    TStringKey extends string,
  >
  extends HandleableError
  implements IHandleable
{
  public readonly componentId: string;
  public readonly type: TEnum[keyof TEnum];
  public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>;
  public readonly language?: string;
  public readonly otherVars?: Record<string, string | number>;

  constructor(
    componentId: string,
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    source: Error,
    options?: HandleableErrorOptions,
    language?: string,
    otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    if (!key) {
      const coreEngine = I18nEngine.getInstance();
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

    // Create a new error with the translated message
    const errorWithMessage = new Error(message);
    if (source?.stack) {
      errorWithMessage.stack = source.stack;
    }
    
    // Pass source as cause if not already specified in options
    const finalOptions = options?.cause ? options : { ...options, cause: source };
    super(errorWithMessage, finalOptions);

    this.componentId = componentId;
    this.type = type;
    this.reasonMap = reasonMap;
    this.language = language;
    this.otherVars = otherVars;
    this.name = 'TypedHandleableError';
  }

  public override toJSON(): Record<string, unknown> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      type: this.type,
    };
  }
}
