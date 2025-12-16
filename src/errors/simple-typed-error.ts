/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
/**
 * TypedError class with proper type safety
 *
 * This class provides a type-safe way to create errors with additional
 * properties without using type casts. It extends the standard Error class
 * and adds support for:
 * - type: Error type classification
 * - componentId: Component identifier where error originated
 * - reasonMap: Map of reasons or context for the error
 * - metadata: Additional metadata associated with the error
 * - cause: Error cause chaining (ES2022 standard)
 */

export interface TypedErrorOptions {
  /**
   * Error type classification (e.g., 'validation', 'network', 'auth')
   */
  type: string;

  /**
   * Component identifier where the error originated
   */
  componentId?: string;

  /**
   * Map of reasons or context for the error
   */
  reasonMap?: Record<string, any>;

  /**
   * Additional metadata associated with the error
   */
  metadata?: Record<string, any>;

  /**
   * The cause of this error (for error chaining)
   */
  cause?: Error;
}

/**
 * TypedError class that extends Error with additional type-safe properties
 */
export class TypedError extends Error {
  public override readonly type: string;
  public override readonly componentId?: string;
  public override readonly reasonMap?: Record<string, any>;
  public override readonly metadata?: Record<string, any>;

  constructor(message: string, options: TypedErrorOptions) {
    super(message, { cause: options.cause });
    this.type = options.type;
    this.componentId = options.componentId;
    this.reasonMap = options.reasonMap;
    this.metadata = options.metadata;
    this.name = 'TypedError';

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, TypedError.prototype);
  }

  /**
   * Check if an error is a TypedError
   */
  static isTypedError(error: unknown): error is TypedError {
    return error instanceof TypedError;
  }

  /**
   * Convert a standard Error to a TypedError
   */
  static fromError(
    error: Error,
    options: Omit<TypedErrorOptions, 'cause'>,
  ): TypedError {
    return new TypedError(error.message, {
      ...options,
      cause: error,
    });
  }
}
