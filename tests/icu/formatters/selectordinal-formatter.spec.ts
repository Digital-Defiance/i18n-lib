/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { SelectOrdinalFormatter } from '../../../src/icu/formatters/selectordinal-formatter';

describe('SelectOrdinalFormatter', () => {
  let formatter: SelectOrdinalFormatter;

  beforeEach(() => {
    formatter = new SelectOrdinalFormatter();
  });

  it('should return one for 1st in English', () => {
    expect(formatter.format(1, undefined, { locale: 'en-US' })).toBe('one');
  });

  it('should return two for 2nd in English', () => {
    expect(formatter.format(2, undefined, { locale: 'en-US' })).toBe('two');
  });

  it('should return few for 3rd in English', () => {
    expect(formatter.format(3, undefined, { locale: 'en-US' })).toBe('few');
  });

  it('should return other for 4th in English', () => {
    expect(formatter.format(4, undefined, { locale: 'en-US' })).toBe('other');
  });

  it('should handle 11th, 12th, 13th', () => {
    expect(formatter.format(11, undefined, { locale: 'en-US' })).toBe('other');
    expect(formatter.format(12, undefined, { locale: 'en-US' })).toBe('other');
    expect(formatter.format(13, undefined, { locale: 'en-US' })).toBe('other');
  });

  it('should handle 21st, 22nd, 23rd', () => {
    expect(formatter.format(21, undefined, { locale: 'en-US' })).toBe('one');
    expect(formatter.format(22, undefined, { locale: 'en-US' })).toBe('two');
    expect(formatter.format(23, undefined, { locale: 'en-US' })).toBe('few');
  });

  it('should handle NaN', () => {
    expect(formatter.format('invalid', undefined, { locale: 'en-US' })).toBe(
      'other',
    );
  });
});
