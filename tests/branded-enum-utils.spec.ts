/**
 * Unit tests for branded enum utility functions
 *
 * Tests the isBrandedEnum, getBrandedEnumComponentId, and getBrandedEnumId
 * utility functions for detecting and extracting information from branded enums.
 */

import { createBrandedEnum } from '@digitaldefiance/branded-enum';
import {
  isBrandedEnum,
  getBrandedEnumComponentId,
  getBrandedEnumId,
} from '../src/branded-enum-utils';
import { createI18nStringKeys } from '../src/branded-string-key';

describe('branded-enum-utils', () => {
  // Test fixtures
  const brandedEnum = createBrandedEnum('test-enum', {
    A: 'a',
    B: 'b',
    C: 'c',
  });

  const i18nBrandedEnum = createI18nStringKeys('my-component', {
    Welcome: 'welcome',
    Goodbye: 'goodbye',
  });

  const traditionalEnum = {
    A: 'a',
    B: 'b',
    C: 'c',
  };

  // TypeScript enum simulation (numeric)
  const numericEnum = {
    First: 0,
    Second: 1,
    0: 'First',
    1: 'Second',
  };

  describe('isBrandedEnum', () => {
    it('should return true for branded enums', () => {
      expect(isBrandedEnum(brandedEnum)).toBe(true);
    });

    it('should return true for i18n branded enums', () => {
      expect(isBrandedEnum(i18nBrandedEnum)).toBe(true);
    });

    it('should return false for traditional enums (plain objects)', () => {
      expect(isBrandedEnum(traditionalEnum)).toBe(false);
    });

    it('should return false for numeric enums', () => {
      expect(isBrandedEnum(numericEnum)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isBrandedEnum(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isBrandedEnum(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isBrandedEnum('string')).toBe(false);
      expect(isBrandedEnum(123)).toBe(false);
      expect(isBrandedEnum(true)).toBe(false);
      expect(isBrandedEnum(Symbol('test'))).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isBrandedEnum(['a', 'b', 'c'])).toBe(false);
    });

    it('should return false for objects with non-string __brand', () => {
      // These are not branded enums - they're just objects with a __brand property
      // The branded-enum library uses Symbols, not __brand property
      expect(isBrandedEnum({ __brand: 123 })).toBe(false);
      expect(isBrandedEnum({ __brand: null })).toBe(false);
      expect(isBrandedEnum({ __brand: undefined })).toBe(false);
      expect(isBrandedEnum({ __brand: {} })).toBe(false);
    });

    it('should return false for objects with string __brand (not real branded enums)', () => {
      // Objects with __brand property are NOT branded enums
      // Real branded enums use Symbols internally
      expect(isBrandedEnum({ __brand: 'custom-brand', A: 'a' })).toBe(false);
    });
  });

  describe('getBrandedEnumComponentId', () => {
    it('should return component ID for branded enums without i18n prefix', () => {
      expect(getBrandedEnumComponentId(brandedEnum)).toBe('test-enum');
    });

    it('should strip i18n: prefix for i18n branded enums', () => {
      expect(getBrandedEnumComponentId(i18nBrandedEnum)).toBe('my-component');
    });

    it('should return null for traditional enums', () => {
      expect(getBrandedEnumComponentId(traditionalEnum)).toBeNull();
    });

    it('should return null for null', () => {
      expect(getBrandedEnumComponentId(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(getBrandedEnumComponentId(undefined)).toBeNull();
    });

    it('should return null for primitives', () => {
      expect(getBrandedEnumComponentId('string')).toBeNull();
      expect(getBrandedEnumComponentId(123)).toBeNull();
    });

    it('should handle custom branded objects', () => {
      // Objects with __brand property are NOT real branded enums
      const customBranded = { __brand: 'custom-id', value: 'test' };
      expect(getBrandedEnumComponentId(customBranded)).toBeNull();
    });

    it('should handle i18n prefixed custom branded objects', () => {
      // Objects with __brand property are NOT real branded enums
      const customI18nBranded = {
        __brand: 'i18n:custom-component',
        value: 'test',
      };
      expect(getBrandedEnumComponentId(customI18nBranded)).toBeNull();
    });
  });

  describe('getBrandedEnumId', () => {
    it('should return raw brand ID for branded enums', () => {
      expect(getBrandedEnumId(brandedEnum)).toBe('test-enum');
    });

    it('should return raw brand ID with i18n prefix for i18n branded enums', () => {
      expect(getBrandedEnumId(i18nBrandedEnum)).toBe('i18n:my-component');
    });

    it('should return null for traditional enums', () => {
      expect(getBrandedEnumId(traditionalEnum)).toBeNull();
    });

    it('should return null for null', () => {
      expect(getBrandedEnumId(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(getBrandedEnumId(undefined)).toBeNull();
    });

    it('should return null for primitives', () => {
      expect(getBrandedEnumId('string')).toBeNull();
      expect(getBrandedEnumId(123)).toBeNull();
    });
  });

  describe('integration between functions', () => {
    it('should have consistent behavior: isBrandedEnum true implies non-null IDs', () => {
      const testObjects = [brandedEnum, i18nBrandedEnum];

      for (const obj of testObjects) {
        if (isBrandedEnum(obj)) {
          expect(getBrandedEnumId(obj)).not.toBeNull();
          expect(getBrandedEnumComponentId(obj)).not.toBeNull();
        }
      }
    });

    it('should have consistent behavior: isBrandedEnum false implies null IDs', () => {
      const testObjects = [
        traditionalEnum,
        null,
        undefined,
        'string',
        123,
        [],
        { A: 'a' },
        { __brand: 'fake' }, // Not a real branded enum
      ];

      for (const obj of testObjects) {
        if (!isBrandedEnum(obj)) {
          expect(getBrandedEnumId(obj)).toBeNull();
          expect(getBrandedEnumComponentId(obj)).toBeNull();
        }
      }
    });
  });
});
