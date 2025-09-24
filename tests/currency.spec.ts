import { CurrencyPosition } from '../src';
import { getCurrencyFormat } from '../src/currency';

describe('getCurrencyFormat', () => {
  it('should return correct format for USD in en-US', () => {
    const format = getCurrencyFormat('en-US', 'USD');
    expect(format).toEqual({
      symbol: '$',
      position: 'prefix',
      groupSeparator: ',',
      decimalSeparator: '.',
    });
  });

  it('should return correct format for EUR in de-DE', () => {
    const format = getCurrencyFormat('de-DE', 'EUR');
    expect(format).toEqual({
      symbol: '€',
      position: 'postfix',
      groupSeparator: '.',
      decimalSeparator: ',',
    });
  });

  it('should return correct format for JPY in ja-JP', () => {
    const format = getCurrencyFormat('ja-JP', 'JPY');
    expect(format).toEqual({
      symbol: '￥',
      position: 'prefix',
      groupSeparator: ',',
      decimalSeparator: '.',
    });
  });

  it('should return correct format for GBP in en-GB', () => {
    const format = getCurrencyFormat('en-GB', 'GBP');
    expect(format).toEqual({
      symbol: '£',
      position: 'prefix',
      groupSeparator: ',',
      decimalSeparator: '.',
    });
  });

  it('should handle currencies without decimal places', () => {
    const format = getCurrencyFormat('ja-JP', 'JPY');
    expect(format.symbol).toBe('￥');
    expect(format.position).toBe('prefix');
  });

  it('should return valid position types', () => {
    const validPositions: CurrencyPosition[] = ['prefix', 'postfix', 'infix'];

    const usdFormat = getCurrencyFormat('en-US', 'USD');
    const eurFormat = getCurrencyFormat('de-DE', 'EUR');

    expect(validPositions).toContain(usdFormat.position);
    expect(validPositions).toContain(eurFormat.position);
  });

  it('should handle unknown currencies gracefully', () => {
    expect(() => {
      getCurrencyFormat('en-US', 'XYZ');
    }).not.toThrow();
  });

  it('should handle unknown locales gracefully', () => {
    expect(() => {
      getCurrencyFormat('xx-XX', 'USD');
    }).not.toThrow();
  });

  it('should return consistent separators for same locale', () => {
    const usdFormat = getCurrencyFormat('en-US', 'USD');
    const eurInUsFormat = getCurrencyFormat('en-US', 'EUR');

    expect(usdFormat.groupSeparator).toBe(eurInUsFormat.groupSeparator);
    expect(usdFormat.decimalSeparator).toBe(eurInUsFormat.decimalSeparator);
  });

  it('should handle currencies with no decimal places correctly', () => {
    const jpyFormat = getCurrencyFormat('ja-JP', 'JPY');
    const krwFormat = getCurrencyFormat('ko-KR', 'KRW');
    
    expect(jpyFormat.symbol).toBe('￥');
    expect(krwFormat.symbol).toBe('₩');
  });

  it('should handle edge case locales', () => {
    expect(() => {
      getCurrencyFormat('', 'USD');
    }).toThrow();
    
    // Some invalid locales may not throw in all environments
    const result = getCurrencyFormat('invalid-locale', 'USD');
    expect(result).toHaveProperty('symbol');
    expect(result).toHaveProperty('position');
  });

  it('should handle edge case currencies', () => {
    expect(() => {
      getCurrencyFormat('en-US', '');
    }).toThrow();
    
    expect(() => {
      getCurrencyFormat('en-US', 'INVALID');
    }).toThrow();
  });

  it('should return valid CurrencyFormat structure', () => {
    const format = getCurrencyFormat('en-US', 'USD');
    
    expect(format).toHaveProperty('symbol');
    expect(format).toHaveProperty('position');
    expect(format).toHaveProperty('groupSeparator');
    expect(format).toHaveProperty('decimalSeparator');
    
    expect(typeof format.symbol).toBe('string');
    expect(typeof format.position).toBe('string');
    expect(typeof format.groupSeparator).toBe('string');
    expect(typeof format.decimalSeparator).toBe('string');
  });

  it('should handle various European currencies', () => {
    const formats = [
      getCurrencyFormat('fr-FR', 'EUR'),
      getCurrencyFormat('it-IT', 'EUR'),
      getCurrencyFormat('es-ES', 'EUR'),
    ];
    
    formats.forEach(format => {
      expect(format.symbol).toBe('€');
      expect(['prefix', 'postfix', 'infix']).toContain(format.position);
    });
  });
});
