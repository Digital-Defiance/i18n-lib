import { PluginI18nEngine } from './plugin-i18n-engine';

/**
 * Generic translatable error that works with any plugin engine and component
 */
export class TranslatableGenericError<
  TStringKey extends string = string,
  TLanguage extends string = string,
> extends Error {
  public readonly stringKey: TStringKey;
  public readonly componentId: string;
  public readonly language?: TLanguage;
  public readonly variables?: Record<string, string | number>;
  public readonly metadata?: Record<string, any>;

  /**
   * Create a translatable error
   * @param componentId - The component ID to translate from
   * @param stringKey - The translation key
   * @param variables - Variables for interpolation
   * @param language - Optional language override
   * @param metadata - Additional error metadata
   * @param instanceKey - Optional engine instance key
   */
  constructor(
    componentId: string,
    stringKey: TStringKey,
    variables?: Record<string, string | number>,
    language?: TLanguage,
    metadata?: Record<string, any>,
    instanceKey?: string,
  ) {
    let translatedMessage: string;

    try {
      const engine = PluginI18nEngine.getInstance<TLanguage>(instanceKey);
      translatedMessage = engine.safeTranslate(
        componentId,
        stringKey,
        variables,
        language,
      );
    } catch (error) {
      // If engine not found or translation fails, use fallback format
      translatedMessage = `[${componentId}.${stringKey}]`;
    }

    super(translatedMessage);
    this.name = 'TranslatableGenericError';
    this.stringKey = stringKey;
    this.componentId = componentId;
    this.language = language;
    this.variables = variables;
    this.metadata = metadata;

    // Ensure proper prototype chain for instanceof checks across transpiled targets
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Create error with explicit engine instance
   */
  static withEngine<TStringKey extends string, TLanguage extends string>(
    engine: PluginI18nEngine<TLanguage>,
    componentId: string,
    stringKey: TStringKey,
    variables?: Record<string, string | number>,
    language?: TLanguage,
    metadata?: Record<string, any>,
  ): TranslatableGenericError<TStringKey, TLanguage> {
    const translatedMessage = engine.safeTranslate(
      componentId,
      stringKey,
      variables,
      language,
    );

    const error = Object.create(TranslatableGenericError.prototype);
    Error.call(error, translatedMessage);
    error.name = 'TranslatableGenericError';
    error.stringKey = stringKey;
    error.componentId = componentId;
    error.language = language;
    error.variables = variables;
    error.metadata = metadata;
    error.message = translatedMessage;

    return error;
  }

  /**
   * Retranslate the error message in a different language
   */
  retranslate(language: TLanguage, instanceKey?: string): string {
    try {
      const engine = PluginI18nEngine.getInstance<TLanguage>(instanceKey);
      return engine.safeTranslate(
        this.componentId,
        this.stringKey,
        this.variables,
        language,
      );
    } catch (error) {
      return `[${this.componentId}.${this.stringKey}]`;
    }
  }
}
