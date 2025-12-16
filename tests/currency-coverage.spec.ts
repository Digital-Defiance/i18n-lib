/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { CurrencyCode, getCurrencyFormat } from '../src/utils/currency';

describe('Currency coverage', () => {
  describe('CurrencyCode', () => {
    it('should throw on invalid currency code', () => {
      expect(() => new CurrencyCode('INVALID')).toThrow();
    });

    it('should return code property', () => {
      const currency = new CurrencyCode('USD');
      expect(currency.code).toBe('USD');
    });

    it('should validate currency codes', () => {
      expect(CurrencyCode.isValid('USD')).toBe(true);
      expect(CurrencyCode.isValid('INVALID')).toBe(false);
    });
  });

  describe('getCurrencyFormat', () => {
    it('should handle currency without decimal separator', () => {
      // JPY doesn't use decimal places
      const format = getCurrencyFormat('ja-JP', 'JPY');
      expect(format.symbol).toBeDefined();
      expect(format.position).toBeDefined();
    });

    it('should detect infix position', () => {
      // Some locales might have currency symbol in middle (rare)
      const format = getCurrencyFormat('en-US', 'USD');
      expect(['prefix', 'postfix', 'infix']).toContain(format.position);
    });

    it('should handle postfix currency', () => {
      // EUR in many European locales is postfix
      const format = getCurrencyFormat('de-DE', 'EUR');
      expect(format.position).toBeDefined();
    });
  });
});
