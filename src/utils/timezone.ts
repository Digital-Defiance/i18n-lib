/**
 * Timezone utilities (v2)
 */

import moment from 'moment-timezone';

export class Timezone {
  private readonly _value: string;

  constructor(timezone: string) {
    if (!Timezone.isValid(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
    this._value = timezone;
  }

  get value(): string {
    return this._value;
  }

  get name(): string {
    return this._value;
  }

  static isValid(timezone: string): boolean {
    return moment.tz.zone(timezone) !== null;
  }

  static getAll(): string[] {
    return moment.tz.names();
  }

  static guess(): string {
    return moment.tz.guess();
  }
}

export function isValidTimezone(timezone: string): boolean {
  return Timezone.isValid(timezone);
}
