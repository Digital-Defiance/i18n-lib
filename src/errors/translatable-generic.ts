import { I18nEngine } from '../core';

/**
 * Generic translatable error that works with any plugin engine and component
 */
export class TranslatableGenericError<TStringKey extends string = string> extends Error {
  public readonly stringKey: TStringKey;
  public readonly componentId: string;
  public readonly language?: string;
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
    language?: string,
    metadata?: Record<string, any>,
    instanceKey?: string,
  ) {
    let translatedMessage: string;

    try {
      const engine = I18nEngine.getInstance(instanceKey);
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
  }

  /**
   * Create error with explicit engine instance
   */
  static withEngine<TStringKey extends string>(
    engine: I18nEngine,
    componentId: string,
    stringKey: TStringKey,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
  ): TranslatableGenericError<TStringKey> {
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
  retranslate(language: string, instanceKey?: string): string {
    try {
      const engine = I18nEngine.getInstance(instanceKey);
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
