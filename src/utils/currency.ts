/**
 * Currency utilities (v2)
 */

import { codes, data } from 'currency-codes';

/**
 * Position of the currency symbol relative to the amount.
 */
export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

/**
 * Configuration for formatting currency values in a specific locale.
 */
export interface CurrencyFormat {
  /** The currency symbol (e.g., "$", "€") */
  symbol: string;
  /** Position of the symbol relative to the amount */
  position: CurrencyPosition;
  /** Character used to separate thousands (e.g., ",") */
  groupSeparator: string;
  /** Character used to separate decimal places (e.g., ".") */
  decimalSeparator: string;
}

/**
 * Detailed information about a currency.
 */
export interface CurrencyData {
  /** ISO 4217 currency code (e.g., "USD") */
  code: string;
  /** Numeric currency code */
  number: string;
  /** Number of decimal digits */
  digits: number;
  /** Currency name */
  currency: string;
  /** Countries using this currency */
  countries: string[];
}

/**
 * Represents a valid ISO 4217 currency code with validation.
 */
export class CurrencyCode {
  private _value: string;

  /**
   * Creates a new CurrencyCode instance.
   * @param value - The ISO 4217 currency code (defaults to 'USD')
   * @throws {Error} If the currency code is invalid
   */
  constructor(value: string = 'USD') {
    if (!CurrencyCode.isValid(value)) {
      throw new Error(`Invalid currency code: ${value}`);
    }
    this._value = value;
  }

  /**
   * Gets the currency code value.
   * @returns The ISO 4217 currency code
   */
  get value(): string {
    return this._value;
  }

  /**
   * Gets the currency code (alias for value).
   * @returns The ISO 4217 currency code
   */
  get code(): string {
    return this._value;
  }

  /**
   * Checks if a currency code is valid according to ISO 4217.
   * @param code - The currency code to validate
   * @returns True if the code is valid, false otherwise
   */
  static isValid(code: string): boolean {
    return codes().includes(code);
  }

  /**
   * Gets all valid ISO 4217 currency codes.
   * @returns Array of currency codes
   */
  static getAll(): string[] {
    return codes();
  }

  /**
   * Gets detailed information for all currencies.
   * @returns Array of currency data objects
   */
  static getAllData(): CurrencyData[] {
    return data as CurrencyData[];
  }
}

/**
 * Gets the currency formatting rules for a specific locale and currency.
 * @param locale - The locale code (e.g., 'en-US', 'fr-FR')
 * @param currencyCode - The ISO 4217 currency code
 * @returns Currency format configuration including symbol, position, and separators
 */
export function getCurrencyFormat(
  locale: string,
  currencyCode: string,
): CurrencyFormat {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  });

  const parts = formatter.formatToParts(1234567.89);
  const symbol = parts.find((part) => part.type === 'currency')?.value || '';
  const symbolIndex = parts.findIndex((part) => part.type === 'currency');
  const decimalIndex = parts.findIndex((part) => part.type === 'decimal');
  const integerIndex = parts.findIndex((part) => part.type === 'integer');

  let position: CurrencyPosition;
  if (decimalIndex === -1) {
    position = symbolIndex < integerIndex ? 'prefix' : 'postfix';
  } else if (symbolIndex < decimalIndex && symbolIndex < integerIndex) {
    position = 'prefix';
  } else if (symbolIndex > decimalIndex) {
    position = 'postfix';
  } else {
    position = 'infix';
  }

  return {
    symbol,
    position,
    groupSeparator: parts.find((part) => part.type === 'group')?.value || ',',
    decimalSeparator:
      parts.find((part) => part.type === 'decimal')?.value || '.',
  };
}
