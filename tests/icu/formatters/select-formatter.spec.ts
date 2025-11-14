import { SelectFormatter } from '../../../src/icu/formatters/select-formatter';

describe('SelectFormatter', () => {
  let formatter: SelectFormatter;

  beforeEach(() => {
    formatter = new SelectFormatter();
  });

  it('should return string value', () => {
    expect(formatter.format('male', undefined, { locale: 'en-US' })).toBe('male');
  });

  it('should convert numbers to strings', () => {
    expect(formatter.format(123, undefined, { locale: 'en-US' })).toBe('123');
  });

  it('should handle null', () => {
    expect(formatter.format(null, undefined, { locale: 'en-US' })).toBe('null');
  });

  it('should handle undefined', () => {
    expect(formatter.format(undefined, undefined, { locale: 'en-US' })).toBe('undefined');
  });
});
