import { NumberFormatter } from '../../../src/icu/formatters/number-formatter';

describe('NumberFormatter', () => {
  let formatter: NumberFormatter;

  beforeEach(() => {
    formatter = new NumberFormatter();
  });

  describe('Basic formatting', () => {
    it('should format integer', () => {
      expect(formatter.format(1234, undefined, { locale: 'en-US' })).toBe('1,234');
    });

    it('should format decimal', () => {
      expect(formatter.format(1234.56, undefined, { locale: 'en-US' })).toBe('1,234.56');
    });

    it('should format zero', () => {
      expect(formatter.format(0, undefined, { locale: 'en-US' })).toBe('0');
    });

    it('should format negative', () => {
      expect(formatter.format(-1234, undefined, { locale: 'en-US' })).toBe('-1,234');
    });
  });

  describe('Integer style', () => {
    it('should format as integer', () => {
      expect(formatter.format(1234.56, 'integer', { locale: 'en-US' })).toBe('1,235');
    });

    it('should round decimals', () => {
      expect(formatter.format(1234.4, 'integer', { locale: 'en-US' })).toBe('1,234');
    });
  });

  describe('Currency style', () => {
    it('should format USD', () => {
      const result = formatter.format(1234.56, 'currency', { locale: 'en-US', currency: 'USD' });
      expect(result).toContain('1,234.56');
    });

    it('should format EUR', () => {
      const result = formatter.format(1234.56, 'currency', { locale: 'de-DE', currency: 'EUR' });
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should default to USD', () => {
      const result = formatter.format(100, 'currency', { locale: 'en-US' });
      expect(result).toContain('100');
    });
  });

  describe('Percent style', () => {
    it('should format as percent', () => {
      expect(formatter.format(0.5, 'percent', { locale: 'en-US' })).toBe('50%');
    });

    it('should format decimal as percent', () => {
      expect(formatter.format(0.123, 'percent', { locale: 'en-US' })).toBe('12.3%');
    });

    it('should format whole number as percent', () => {
      expect(formatter.format(1, 'percent', { locale: 'en-US' })).toBe('100%');
    });
  });

  describe('Locale support', () => {
    it('should format for French locale', () => {
      const result = formatter.format(1234.56, undefined, { locale: 'fr-FR' });
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format for German locale', () => {
      const result = formatter.format(1234.56, undefined, { locale: 'de-DE' });
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should default to en-US', () => {
      expect(formatter.format(1234)).toBe('1,234');
    });
  });

  describe('Edge cases', () => {
    it('should handle NaN', () => {
      expect(formatter.format('invalid', undefined, { locale: 'en-US' })).toBe('invalid');
    });

    it('should handle string numbers', () => {
      expect(formatter.format('1234', undefined, { locale: 'en-US' })).toBe('1,234');
    });

    it('should handle very large numbers', () => {
      const result = formatter.format(1234567890, undefined, { locale: 'en-US' });
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should handle very small decimals', () => {
      const result = formatter.format(0.000123, undefined, { locale: 'en-US' });
      expect(result).toContain('0');
    });
  });
});
