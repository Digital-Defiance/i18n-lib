/**
 * Interface for errors that can be marked as handled and serialized to JSON.
 */
export interface IHandleable {
  /**
   * Converts the error to a JSON-serializable object.
   * @returns A plain object representation of the error
   */
  toJSON(): Record<string, unknown>;
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
