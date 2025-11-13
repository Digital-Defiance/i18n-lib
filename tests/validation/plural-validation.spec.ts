import { validatePluralForms, validateCountVariable } from '../../src/validation/plural-validator';
import { PluralString } from '../../src/types/plural-types';

describe('Plural Validation', () => {
  describe('validatePluralForms - English', () => {
    it('should pass with required forms', () => {
      const value: PluralString = { one: '{count} item', other: '{count} items' };
      const result = validatePluralForms(value, 'en', 'items');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about missing "other" form', () => {
      const value: PluralString = { one: '{count} item' };
      const result = validatePluralForms(value, 'en', 'items');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Missing required plural form 'other' for language 'en' in key 'items'");
    });

    it('should error in strict mode for missing forms', () => {
      const value: PluralString = { one: '{count} item' };
      const result = validatePluralForms(value, 'en', 'items', { strict: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required plural form 'other' for language 'en' in key 'items'");
    });

    it('should pass for simple strings', () => {
      const value = 'simple string';
      const result = validatePluralForms(value, 'en', 'simple');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePluralForms - Russian', () => {
    it('should pass with all required forms', () => {
      const value: PluralString = {
        one: '{count} товар',
        few: '{count} товара',
        many: '{count} товаров',
      };
      const result = validatePluralForms(value, 'ru', 'items');
      expect(result.isValid).toBe(true);
    });

    it('should warn about missing "few" form', () => {
      const value: PluralString = { one: '{count} товар', many: '{count} товаров' };
      const result = validatePluralForms(value, 'ru', 'items');
      expect(result.warnings).toContain("Missing required plural form 'few' for language 'ru' in key 'items'");
    });

    it('should warn about missing "many" form', () => {
      const value: PluralString = { one: '{count} товар', few: '{count} товара' };
      const result = validatePluralForms(value, 'ru', 'items');
      expect(result.warnings).toContain("Missing required plural form 'many' for language 'ru' in key 'items'");
    });
  });

  describe('validatePluralForms - Arabic', () => {
    it('should pass with all 6 required forms', () => {
      const value: PluralString = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{count} عناصر',
        many: '{count} عنصرًا',
        other: '{count} عنصر',
      };
      const result = validatePluralForms(value, 'ar', 'items');
      expect(result.isValid).toBe(true);
    });

    it('should warn about missing forms', () => {
      const value: PluralString = { one: 'عنصر واحد', other: '{count} عنصر' };
      const result = validatePluralForms(value, 'ar', 'items');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('zero'))).toBe(true);
      expect(result.warnings.some(w => w.includes('two'))).toBe(true);
    });
  });

  describe('validatePluralForms - checkUnused', () => {
    it('should warn about unused forms', () => {
      const value: PluralString = {
        one: '{count} item',
        other: '{count} items',
        two: '{count} items',
      };
      const result = validatePluralForms(value, 'en', 'items', { checkUnused: true });
      expect(result.warnings).toContain("Unused plural form 'two' for language 'en' in key 'items'");
    });

    it('should not warn when checkUnused is false', () => {
      const value: PluralString = {
        one: '{count} item',
        other: '{count} items',
        two: '{count} items',
      };
      const result = validatePluralForms(value, 'en', 'items', { checkUnused: false });
      expect(result.warnings.some(w => w.includes('Unused'))).toBe(false);
    });
  });

  describe('validatePluralForms - checkVariables', () => {
    it('should warn about inconsistent variables', () => {
      const value: PluralString = {
        one: '{count} {name} item',
        other: '{count} items',
      };
      const result = validatePluralForms(value, 'en', 'items', { checkVariables: true });
      expect(result.warnings.some(w => w.includes('missing variables'))).toBe(true);
    });

    it('should pass with consistent variables', () => {
      const value: PluralString = {
        one: '{count} {name} item',
        other: '{count} {name} items',
      };
      const result = validatePluralForms(value, 'en', 'items', { checkVariables: true });
      expect(result.warnings.some(w => w.includes('missing variables'))).toBe(false);
    });

    it('should not check when checkVariables is false', () => {
      const value: PluralString = {
        one: '{count} {name} item',
        other: '{count} items',
      };
      const result = validatePluralForms(value, 'en', 'items', { checkVariables: false });
      expect(result.warnings.some(w => w.includes('missing variables'))).toBe(false);
    });
  });

  describe('validateCountVariable', () => {
    it('should warn when plural forms used without count', () => {
      const value: PluralString = { one: 'item', other: 'items' };
      const result = validateCountVariable(value, undefined, 'items');
      expect(result.warnings).toContain("Plural forms used in key 'items' but no 'count' variable provided");
    });

    it('should warn when count is missing from variables', () => {
      const value: PluralString = { one: 'item', other: 'items' };
      const result = validateCountVariable(value, { name: 'test' }, 'items');
      expect(result.warnings).toContain("Plural forms used in key 'items' but no 'count' variable provided");
    });

    it('should pass when count is provided', () => {
      const value: PluralString = { one: 'item', other: 'items' };
      const result = validateCountVariable(value, { count: 5 }, 'items');
      expect(result.warnings).toHaveLength(0);
    });

    it('should pass for simple strings', () => {
      const value = 'simple string';
      const result = validateCountVariable(value, undefined, 'simple');
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty plural object', () => {
      const value: PluralString = {};
      const result = validatePluralForms(value, 'en', 'empty');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle unknown language', () => {
      const value: PluralString = { one: 'item', other: 'items' };
      const result = validatePluralForms(value, 'unknown-lang', 'items');
      expect(result.isValid).toBe(true);
    });
  });
});
