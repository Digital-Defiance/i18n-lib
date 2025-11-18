/**
 * Options for creating a HandleableError.
 */
export interface HandleableErrorOptions {
  /** The original error that caused this error */
  cause?: Error;
  /** Whether this error has been handled */
  handled?: boolean;
  /** HTTP status code associated with this error */
  statusCode?: number;
  /** Optional source data related to the error */
  sourceData?: unknown;
}
