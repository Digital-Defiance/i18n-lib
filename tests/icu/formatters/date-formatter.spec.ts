/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { DateFormatter } from '../../../src/icu/formatters/date-formatter';

describe('DateFormatter', () => {
  let formatter: DateFormatter;
  const testDate = new Date('2024-03-15T10:30:00Z');

  beforeEach(() => {
    formatter = new DateFormatter();
  });

  it('should format short date', () => {
    const result = formatter.format(testDate, 'short', { locale: 'en-US' });
    expect(result).toContain('3');
    expect(result).toContain('15');
  });

  it('should format medium date', () => {
    const result = formatter.format(testDate, 'medium', { locale: 'en-US' });
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });

  it('should format long date', () => {
    const result = formatter.format(testDate, 'long', { locale: 'en-US' });
    expect(result).toContain('March');
    expect(result).toContain('15');
  });

  it('should format full date', () => {
    const result = formatter.format(testDate, 'full', { locale: 'en-US' });
    expect(result).toContain('2024');
  });

  it('should handle string dates', () => {
    const result = formatter.format('2024-03-15', 'short', { locale: 'en-US' });
    expect(result).toContain('3');
  });

  it('should handle invalid dates', () => {
    expect(formatter.format('invalid', 'short', { locale: 'en-US' })).toBe(
      'invalid',
    );
  });

  it('should default to medium', () => {
    const result = formatter.format(testDate, undefined, { locale: 'en-US' });
    expect(result).toContain('Mar');
  });

  it('should support different locales', () => {
    const result = formatter.format(testDate, 'long', { locale: 'fr-FR' });
    expect(result).toContain('15');
  });
});
