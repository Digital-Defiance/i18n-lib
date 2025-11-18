import { IHandleable } from '../interfaces/handleable';
import { HandleableErrorOptions } from '../interfaces/handleable-error-options';

/**
 * Extended Error constructor type that includes stack trace capture functionality.
 */
type ErrorConstructorWithStack = ErrorConstructor & {
  captureStackTrace?: (target: Error, constructorOpt?: Function) => void;
};

/**
 * Base error class that implements IHandleable interface.
 * Provides enhanced error handling capabilities including status codes, handled state tracking,
 * and source data preservation.
 */
export class HandleableError extends Error implements IHandleable {
  /** The original error that caused this error */
  public override readonly cause?: Error;
  /** HTTP status code associated with this error */
  public readonly statusCode: number;
  /** Optional source data related to the error */
  public readonly sourceData?: unknown;
  /** Internal tracking of whether this error has been handled */
  private _handled: boolean;

  /**
   * Creates a new HandleableError instance.
   * @param source - The original error being wrapped
   * @param options - Optional configuration for the error
   */
  constructor(source: Error, options?: HandleableErrorOptions) {
    super(source.message);
    this.name = this.constructor.name;
    this.cause = options?.cause ?? source;
    this.statusCode = options?.statusCode ?? 500;
    this._handled = options?.handled ?? false;
    this.sourceData = options?.sourceData;
    this.name = 'HandleableError';

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
  }

  /**
   * Gets the handled state of this error.
   * @returns True if the error has been handled, false otherwise
   */
  public get handled(): boolean {
    return this._handled;
  }

  /**
   * Sets the handled state of this error.
   * @param value - The new handled state
   */
  public set handled(value: boolean) {
    this._handled = value;
  }

  /**
   * Serializes a value to a JSON-compatible format.
   * Handles objects with toJSON methods, Error instances, arrays, and plain objects.
   * @param value - The value to serialize
   * @returns The serialized value
   */
  private serializeValue(value: unknown): unknown {
    if (
      value &&
      typeof value === 'object' &&
      'toJSON' in value &&
      typeof value.toJSON === 'function'
    ) {
      return value.toJSON();
    }
    if (value instanceof Error) {
      return value.message;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item));
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, this.serializeValue(v)]),
      );
    }
    return value;
  }

  /**
   * Converts the error to a JSON-serializable object.
   * Includes name, message, status code, handled state, stack trace, and optional source data.
   * @returns A plain object representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      handled: this.handled,
      stack: this.stack,
      cause: this.serializeValue(this.cause),
      ...(this.sourceData
        ? { sourceData: this.serializeValue(this.sourceData) }
        : {}),
    };
  }
}
