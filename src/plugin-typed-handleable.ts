import { HandleableErrorOptions } from './i-handleable-error-options';
import { HandleableError } from './handleable';
import { IHandleable } from './i-handleable';
import { CompleteReasonMap, PluginTypedError } from './typed-error';
import { PluginI18nEngine } from './plugin-i18n-engine';

export class PluginTypedHandleableError<TEnum extends Record<string, string>, TStringKey extends string, TLanguages extends string = string> extends PluginTypedError<TEnum, TStringKey, TLanguages> implements IHandleable {
  public readonly cause?: Error;
  public readonly statusCode: number;
  public readonly sourceData?: unknown;
  private _handled: boolean;

  constructor(engine: PluginI18nEngine<TLanguages>, componentId: string, type: TEnum[keyof TEnum], reasonMap: CompleteReasonMap<TEnum, TStringKey>, source: Error, options?: HandleableErrorOptions, language?: TLanguages, otherVars?: Record<string, string | number>) {
    super(
      engine,
      componentId,
      type,
      reasonMap,
      language,
      otherVars
    );
    this.cause = options?.cause ?? source;
    this.statusCode = options?.statusCode ?? 500;
    this._handled = options?.handled ?? false;
    this.sourceData = options?.sourceData;

    // Capture stack trace - prioritize source stack, then capture new one
    if (source.stack) {
      this.stack = source.stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.name = this.constructor.name;
  }

  
  public get handled(): boolean {
    return this._handled;
  }

  public set handled(value: boolean) {
    this._handled = value;
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      handled: this.handled,
      stack: this.stack,
      cause:
        this.cause instanceof HandleableError || this.cause instanceof PluginTypedHandleableError
          ? this.cause.toJSON()
          : this.cause?.message,
      ...(this.sourceData ? { sourceData: this.sourceData } : {}),
    };
  }
}