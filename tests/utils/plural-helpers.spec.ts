import { createPluralString, createGenderedString, getRequiredPluralForms } from '../../src/utils/plural-helpers';

describe('Plural Helpers', () => {
  describe('createPluralString', () => {
    it('should create plural string with one and other', () => {
      const result = createPluralString({ one: '1 item', other: '{count} items' });
      expect(result).toEqual({ one: '1 item', other: '{count} items' });
    });

    it('should create plural string with all forms', () => {
      const result = createPluralString({
        zero: 'No items',
        one: '1 item',
        two: '2 items',
        few: '{count} items',
        many: '{count} items',
        other: '{count} items'
      });
      expect(result).toHaveProperty('zero');
      expect(result).toHaveProperty('many');
    });

    it('should create partial plural string', () => {
      const result = createPluralString({ one: '1 item' });
      expect(result).toEqual({ one: '1 item' });
    });

    it('should handle empty object', () => {
      const result = createPluralString({});
      expect(result).toEqual({});
    });
  });

  describe('createGenderedString', () => {
    it('should create gendered string with male and female', () => {
      const result = createGenderedString({ male: 'He', female: 'She' });
      expect(result).toEqual({ male: 'He', female: 'She' });
    });

    it('should create gendered string with all forms', () => {
      const result = createGenderedString({
        male: 'He',
        female: 'She',
        neutral: 'They',
        other: 'Person'
      });
      expect(result).toHaveProperty('neutral');
      expect(result).toHaveProperty('other');
    });

    it('should create partial gendered string', () => {
      const result = createGenderedString({ male: 'He' });
      expect(result).toEqual({ male: 'He' });
    });

    it('should handle empty object', () => {
      const result = createGenderedString({});
      expect(result).toEqual({});
    });
  });

  describe('getRequiredPluralForms', () => {
    it('should return required forms for English', () => {
      const forms = getRequiredPluralForms('en');
      expect(forms).toEqual(['one', 'other']);
    });

    it('should return required forms for Russian', () => {
      const forms = getRequiredPluralForms('ru');
      expect(forms).toEqual(['one', 'few', 'many']);
    });

    it('should return required forms for Arabic', () => {
      const forms = getRequiredPluralForms('ar');
      expect(forms).toEqual(['zero', 'one', 'two', 'few', 'many', 'other']);
    });

    it('should return required forms for Japanese', () => {
      const forms = getRequiredPluralForms('ja');
      expect(forms).toEqual(['other']);
    });

    it('should fallback to English for unknown language', () => {
      const forms = getRequiredPluralForms('unknown');
      expect(forms).toEqual(['one', 'other']);
    });
  });

  describe('Type safety', () => {
    it('should accept valid plural categories', () => {
      const result = createPluralString({
        zero: 'zero',
        one: 'one',
        two: 'two',
        few: 'few',
        many: 'many',
        other: 'other'
      });
      expect(result).toBeDefined();
    });

    it('should accept valid gender categories', () => {
      const result = createGenderedString({
        male: 'male',
        female: 'female',
        neutral: 'neutral',
        other: 'other'
      });
      expect(result).toBeDefined();
    });
  });
});
