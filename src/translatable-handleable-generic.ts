import { IHandleable } from './i-handleable';
import { TranslatableGenericError } from './translatable-generic-error';

/**
 * Generic translatable error that works with any plugin engine and component
 */
export class TranslatableHandleableGenericError<
  TStringKey extends string = string,
  TLanguage extends string = string,
> extends TranslatableGenericError<TStringKey, TLanguage> implements IHandleable {
  private _handled = false;
  public readonly cause?: Error;
  public readonly statusCode: number;
  public readonly sourceData?: unknown;

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
    handleableOptions?: { statusCode?: number; cause?: Error; sourceData?: unknown },
  ) {
    super(componentId, stringKey, variables, language, metadata, instanceKey);
    this.statusCode = handleableOptions?.statusCode ?? 500;
    this.cause = handleableOptions?.cause;
    this.sourceData = handleableOptions?.sourceData;
  }
  public get handled(): boolean {
    return this._handled;
  }
  public set handled(value: boolean) {
    this._handled = value;
  }
  toJSON(): Record<string, unknown> {
    return {
      statusCode: this.statusCode,
      message: this.message,
      cause: this.cause,
      sourceData: this.sourceData,
    };
  }
}
