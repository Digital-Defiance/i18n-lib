import { isValidTimezone } from './utils';

/**
 * Class representing a validated timezone.
 */
export class Timezone {
  private readonly _timezone: string;
  constructor(timezone: string) {
    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
    this._timezone = timezone;
  }
  /**
   * Gets the timezone value.
   */
  public get value(): string {
    return this._timezone;
  }
}
