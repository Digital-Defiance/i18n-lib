import { HandleableErrorOptions } from './i-handleable-error-options';
import { IHandleable } from './i-handleable';
import { HandleableError } from './handleable';
import { CompleteReasonMap, TranslationEngine } from './typed-error';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { CoreStringKey } from './core-string-key';
import { CoreLanguageCode } from './core-i18n';

export class TypedHandleableError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TLanguage extends CoreLanguageCode = CoreLanguageCode,
> extends HandleableError implements IHandleable {
  public readonly type: TEnum[keyof TEnum];
  public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>;
  public readonly engine: TranslationEngine<TStringKey>;
  public readonly language?: TLanguage;
  public readonly otherVars?: Record<string, string | number>;

  constructor(
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    engine: TranslationEngine<TStringKey>,
    language?: TLanguage,
    otherVars?: Record<string, string | number>,
    options?: HandleableErrorOptions,
  ) {
    const key = reasonMap[type];
    if (!key) {
      const coreEngine = PluginI18nEngine.getInstance<TLanguage>();
      throw new Error(coreEngine.translate('core', CoreStringKey.Error_MissingTranslationKeyTemplate, {
        stringKey: key as string,
      }));
    }
    
    let message: string = String(type);
    try {
      const keyString = key as TStringKey;
      const translated = engine.translate(keyString, otherVars, language);
      message = String(translated || type);
    } catch (error) {
      message = String(type);
    }
    
    super(new Error(message), options);
    
    this.type = type;
    this.reasonMap = reasonMap;
    this.language = language;
    this.otherVars = otherVars;
    this.engine = engine;
  }

  public toJSON(): Record<string, unknown> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      type: this.type,
    };
  }
}
