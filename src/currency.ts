/**
 * Currency formatting utilities
 */

export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

export interface CurrencyFormat {
  symbol: string;
  position: CurrencyPosition;
  groupSeparator: string;
  decimalSeparator: string;
}

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
    // No decimal separator
    if (symbolIndex < integerIndex) {
      position = 'prefix';
    } else {
      position = 'postfix';
    }
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
