/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { SelectFormatter } from '../../../src/icu/formatters/select-formatter';

describe('SelectFormatter', () => {
  let formatter: SelectFormatter;

  beforeEach(() => {
    formatter = new SelectFormatter();
  });

  it('should return string value', () => {
    expect(formatter.format('male', undefined, { locale: 'en-US' })).toBe(
      'male',
    );
  });

  it('should convert numbers to strings', () => {
    expect(formatter.format(123, undefined, { locale: 'en-US' })).toBe('123');
  });

  it('should handle null', () => {
    expect(formatter.format(null, undefined, { locale: 'en-US' })).toBe('null');
  });

  it('should handle undefined', () => {
    expect(formatter.format(undefined, undefined, { locale: 'en-US' })).toBe(
      'undefined',
    );
  });
});
