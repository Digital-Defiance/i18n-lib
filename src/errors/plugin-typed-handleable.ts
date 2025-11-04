import { HandleableError } from './handleable';
import { IHandleable } from '../interfaces/handleable';
import { HandleableErrorOptions } from '../interfaces/handleable-error-options';
import { CompleteReasonMap, PluginTypedError } from './typed';

type ErrorConstructorWithStack = ErrorConstructor & {
  captureStackTrace?: (target: Error, constructorOpt?: Function) => void;
};

export class PluginTypedHandleableError<
    TEnum extends Record<string, string>,
    TStringKey extends string,
  >
  extends PluginTypedError<TEnum, TStringKey>
  implements IHandleable
{
  public override readonly cause?: Error;
  public readonly statusCode: number;
  public readonly sourceData?: unknown;
  private _handled: boolean;

  constructor(
    componentId: string,
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    source: Error,
    options?: HandleableErrorOptions,
    language?: string,
    otherVars?: Record<string, string | number>,
  ) {
    super(componentId, type, reasonMap, language, otherVars);
    this.cause = options?.cause ?? source;
    this.statusCode = options?.statusCode ?? 500;
    this._handled = options?.handled ?? false;
    this.sourceData = options?.sourceData;

    // Capture stack trace - prioritize source stack, then capture new one
    if (source.stack) {
      this.stack = source.stack;
    } else if ((Error as ErrorConstructorWithStack).captureStackTrace) {
      (Error as ErrorConstructorWithStack).captureStackTrace?.(
        this,
        this.constructor,
      );
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
        this.cause instanceof HandleableError ||
        this.cause instanceof PluginTypedHandleableError
          ? this.cause.toJSON()
          : this.cause?.message,
      ...(this.sourceData ? { sourceData: this.sourceData } : {}),
    };
  }
}
