/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { parse } from '../../src/icu/parser';

describe('Security: Recursion Limits', () => {
  it('should limit ICU nesting depth', () => {
    const nested = '{a, select, x {'.repeat(20) + 'text' + '}}'.repeat(20);
    expect(() => parse(nested)).toThrow(/depth/i);
  });

  it('should handle reasonable nesting', () => {
    const nested = '{a, select, x {{b, select, y {text}}}}';
    expect(() => parse(nested)).not.toThrow();
  });

  it('should reject deeply nested plural', () => {
    const nested = '{n, plural, one {'.repeat(15) + 'text' + '}}'.repeat(15);
    expect(() => parse(nested)).toThrow(/depth/i);
  });

  it('should handle mixed nesting', () => {
    const msg = '{a, select, x {{b, plural, one {{c, select, y {text}}}}}}';
    expect(() => parse(msg)).not.toThrow();
  });
});
