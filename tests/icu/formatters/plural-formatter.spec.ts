import { PluralFormatter } from '../../../src/icu/formatters/plural-formatter';

describe('PluralFormatter', () => {
  let formatter: PluralFormatter;

  beforeEach(() => {
    formatter = new PluralFormatter();
  });

  it('should return one for 1 in English', () => {
    expect(formatter.format(1, undefined, { locale: 'en-US' })).toBe('one');
  });

  it('should return other for 2 in English', () => {
    expect(formatter.format(2, undefined, { locale: 'en-US' })).toBe('other');
  });

  it('should return other for 0 in English', () => {
    expect(formatter.format(0, undefined, { locale: 'en-US' })).toBe('other');
  });

  it('should handle Russian plurals', () => {
    expect(formatter.format(1, undefined, { locale: 'ru' })).toBe('one');
    expect(formatter.format(2, undefined, { locale: 'ru' })).toBe('few');
    expect(formatter.format(5, undefined, { locale: 'ru' })).toBe('many');
  });

  it('should handle Arabic plurals', () => {
    expect(formatter.format(0, undefined, { locale: 'ar' })).toBe('zero');
    expect(formatter.format(1, undefined, { locale: 'ar' })).toBe('one');
    expect(formatter.format(2, undefined, { locale: 'ar' })).toBe('two');
  });

  it('should handle NaN', () => {
    expect(formatter.format('invalid', undefined, { locale: 'en-US' })).toBe('other');
  });

  it('should default to en-US', () => {
    expect(formatter.format(1)).toBe('one');
  });
});
