/**
 * Currency utilities (v2)
 */

import { codes, data } from 'currency-codes';
import { TranslatableError } from '../errors/translatable';
import { CoreStringKey } from '../core-string-key';

export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

export interface CurrencyFormat {
  symbol: string;
  position: CurrencyPosition;
  groupSeparator: string;
  decimalSeparator: string;
}

export interface CurrencyData {
  code: string;
  number: string;
  digits: number;
  currency: string;
  countries: string[];
}

export class CurrencyCode {
  private _value: string;

  constructor(value: string = 'USD') {
    if (!CurrencyCode.isValid(value)) {
      throw new TranslatableError<CoreStringKey>(
        'core',
        CoreStringKey.Error_InvalidCurrencyCodeTemplate,
        { value },
      );
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  get code(): string {
    return this._value;
  }

  static isValid(code: string): boolean {
    return codes().includes(code);
  }

  static getAll(): string[] {
    return codes();
  }

  static getAllData(): CurrencyData[] {
    return data as CurrencyData[];
  }
}

export function getCurrencyFormat(locale: string, currencyCode: string): CurrencyFormat {
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
    decimalSeparator: parts.find((part) => part.type === 'decimal')?.value || '.',
  };
}
