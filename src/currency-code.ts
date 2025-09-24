import { codes } from 'currency-codes';
import { DefaultCurrencyCode } from './types';

/**
 * Class representing a validated currency code.
 */
export class CurrencyCode {
  private _value: string = DefaultCurrencyCode;
  /**
   * Gets the currency code value.
   */
  public get value(): string {
    return this._value;
  }
  /**
   * Sets the currency code value after validating it.
   */
  public set value(value: string) {
    if (!CurrencyCode.values.includes(value)) {
      throw new Error('Invalid currency code');
    }
    this._value = value;
  }

  /**
   * Gets the list of all valid currency codes.
   */
  public static get values(): string[] {
    return codes();
  }

  constructor(value: string = DefaultCurrencyCode) {
    this.value = value;
  }
}
