/**
 * Timezone utilities (v2)
 */

import moment from 'moment-timezone';

/**
 * Represents a valid timezone with validation.
 * Uses moment-timezone for validation and timezone database.
 */
export class Timezone {
  private readonly _value: string;

  /**
   * Creates a new Timezone instance.
   * @param timezone - The timezone name (e.g., 'America/New_York', 'UTC')
   * @throws {Error} If the timezone is invalid
   */
  constructor(timezone: string) {
    if (!Timezone.isValid(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
    this._value = timezone;
  }

  /**
   * Gets the timezone name.
   * @returns The timezone name
   */
  get value(): string {
    return this._value;
  }

  /**
   * Gets the timezone name (alias for value).
   * @returns The timezone name
   */
  get name(): string {
    return this._value;
  }

  /**
   * Checks if a timezone name is valid.
   * @param timezone - The timezone name to validate
   * @returns True if the timezone is valid, false otherwise
   */
  static isValid(timezone: string): boolean {
    return moment.tz.zone(timezone) !== null;
  }

  /**
   * Gets all available timezone names.
   * @returns Array of timezone names
   */
  static getAll(): string[] {
    return moment.tz.names();
  }

  /**
   * Attempts to guess the user's timezone based on their system settings.
   * @returns The guessed timezone name
   */
  static guess(): string {
    return moment.tz.guess();
  }
}

/**
 * Checks if a timezone name is valid.
 * This is a convenience function that delegates to Timezone.isValid().
 * @param timezone - The timezone name to validate
 * @returns True if the timezone is valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
  return Timezone.isValid(timezone);
}
