import { TimeFormatter } from '../../../src/icu/formatters/time-formatter';

describe('TimeFormatter', () => {
  let formatter: TimeFormatter;
  const testDate = new Date('2024-03-15T14:30:45Z');

  beforeEach(() => {
    formatter = new TimeFormatter();
  });

  it('should format short time', () => {
    const result = formatter.format(testDate, 'short', { locale: 'en-US' });
    expect(result).toMatch(/\d+:\d+/);
  });

  it('should format medium time', () => {
    const result = formatter.format(testDate, 'medium', { locale: 'en-US' });
    expect(result).toMatch(/\d+:\d+:\d+/);
  });

  it('should format long time', () => {
    const result = formatter.format(testDate, 'long', { locale: 'en-US' });
    expect(result).toContain(':');
  });

  it('should format full time', () => {
    const result = formatter.format(testDate, 'full', { locale: 'en-US' });
    expect(result).toContain(':');
  });

  it('should handle string dates', () => {
    const result = formatter.format('2024-03-15T14:30:00Z', 'short', { locale: 'en-US' });
    expect(result).toMatch(/\d+:\d+/);
  });

  it('should handle invalid dates', () => {
    expect(formatter.format('invalid', 'short', { locale: 'en-US' })).toBe('invalid');
  });

  it('should default to medium', () => {
    const result = formatter.format(testDate, undefined, { locale: 'en-US' });
    expect(result).toMatch(/\d+:\d+:\d+/);
  });
});
