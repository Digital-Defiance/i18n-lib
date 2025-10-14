import { CurrencyPosition } from './types';

/**
 * Represents the format details for a specific currency in a given locale.
 */
export interface CurrencyFormat {
  symbol: string;
  position: CurrencyPosition;
  groupSeparator: string;
  decimalSeparator: string;
}
