/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for plural type definitions
 */

import {
  PluralString,
  isPluralString,
  resolvePluralString,
} from '../../src/types/plural-types';

describe('Plural Types', () => {
  describe('PluralString type', () => {
    it('should accept simple string', () => {
      const value: PluralString = 'Hello';
      expect(value).toBe('Hello');
    });

    it('should accept plural object', () => {
      const value: PluralString = {
        one: '1 item',
        other: '{count} items',
      };
      expect(value).toHaveProperty('one');
      expect(value).toHaveProperty('other');
    });

    it('should accept partial plural object', () => {
      const value: PluralString = {
        one: '1 item',
      };
      expect(value).toHaveProperty('one');
    });
  });

  describe('isPluralString', () => {
    it('should return false for simple string', () => {
      expect(isPluralString('Hello')).toBe(false);
    });

    it('should return true for plural object', () => {
      expect(isPluralString({ one: 'One', other: 'Other' })).toBe(true);
    });

    it('should return false for null', () => {
      expect(isPluralString(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPluralString(undefined)).toBe(false);
    });

    it('should return false for array', () => {
      expect(isPluralString(['one', 'other'])).toBe(false);
    });

    it('should return false for number', () => {
      expect(isPluralString(42)).toBe(false);
    });
  });

  describe('resolvePluralString', () => {
    it('should return simple string as-is', () => {
      expect(resolvePluralString('Hello', 'one')).toBe('Hello');
      expect(resolvePluralString('Hello', 'other')).toBe('Hello');
    });

    it('should return exact match from plural object', () => {
      const value = { one: 'One item', other: 'Many items' };
      expect(resolvePluralString(value, 'one')).toBe('One item');
      expect(resolvePluralString(value, 'other')).toBe('Many items');
    });

    it('should fallback to "other" when category not found', () => {
      const value = { one: 'One item', other: 'Many items' };
      expect(resolvePluralString(value, 'few')).toBe('Many items');
      expect(resolvePluralString(value, 'many')).toBe('Many items');
    });

    it('should fallback to first available form when "other" not found', () => {
      const value = { one: 'One item', few: 'Few items' };
      expect(resolvePluralString(value, 'many')).toBe('One item');
    });

    it('should return undefined for empty plural object', () => {
      expect(resolvePluralString({}, 'one')).toBeUndefined();
    });

    it('should handle all CLDR categories', () => {
      const value = {
        zero: 'Zero',
        one: 'One',
        two: 'Two',
        few: 'Few',
        many: 'Many',
        other: 'Other',
      };
      expect(resolvePluralString(value, 'zero')).toBe('Zero');
      expect(resolvePluralString(value, 'one')).toBe('One');
      expect(resolvePluralString(value, 'two')).toBe('Two');
      expect(resolvePluralString(value, 'few')).toBe('Few');
      expect(resolvePluralString(value, 'many')).toBe('Many');
      expect(resolvePluralString(value, 'other')).toBe('Other');
    });
  });

  describe('Type inference', () => {
    it('should infer string type', () => {
      const value: PluralString = 'test';
      if (typeof value === 'string') {
        expect(value.length).toBeGreaterThan(0);
      }
    });

    it('should infer object type', () => {
      const value: PluralString = { one: 'test' };
      if (isPluralString(value)) {
        expect(value.one).toBe('test');
      }
    });
  });

  describe('Backward compatibility', () => {
    it('should handle simple strings in mixed scenarios', () => {
      const strings: Record<string, PluralString> = {
        simple: 'Simple string',
        plural: { one: 'One', other: 'Other' },
      };

      expect(resolvePluralString(strings.simple, 'one')).toBe('Simple string');
      expect(resolvePluralString(strings.plural, 'one')).toBe('One');
    });
  });
});
