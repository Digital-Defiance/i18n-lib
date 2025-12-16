/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

/**
 * Interface for errors that can be marked as handled and serialized to JSON.
 */
export interface IHandleable {
  /**
   * Converts the error to a JSON-serializable object.
   * @returns A plain object representation of the error
   */
  toJSON(): Record<string, any>;
  /**
   * Gets the handled state of this error.
   * @returns True if the error has been handled, false otherwise
   */
  get handled(): boolean;
  /**
   * Sets the handled state of this error.
   * @param value - The new handled state
   */
  set handled(value: boolean);
}
