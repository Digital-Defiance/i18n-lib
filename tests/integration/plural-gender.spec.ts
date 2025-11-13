import { resolveGenderForm } from '../../src/gender/gender-resolver';
import { resolvePluralString } from '../../src/types/plural-types';
import { getPluralCategory } from '../../src/pluralization/language-plural-map';
import { PluralString } from '../../src/types/plural-types';
import { GenderedString } from '../../src/gender/gender-categories';

describe('Plural + Gender Integration', () => {
  describe('Plural then Gender', () => {
    it('should resolve plural then gender', () => {
      const value = {
        one: { male: 'He has {count} item', female: 'She has {count} item' },
        other: { male: 'He has {count} items', female: 'She has {count} items' },
      };
      
      const category = getPluralCategory('en', 1);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'male');
      
      expect(result).toBe('He has {count} item');
    });

    it('should handle count=5 with female', () => {
      const value = {
        one: { male: 'He has {count} item', female: 'She has {count} item' },
        other: { male: 'He has {count} items', female: 'She has {count} items' },
      };
      
      const category = getPluralCategory('en', 5);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'female');
      
      expect(result).toBe('She has {count} items');
    });
  });

  describe('Gender then Plural', () => {
    it('should resolve gender then plural', () => {
      const value = {
        male: { one: 'He has {count} item', other: 'He has {count} items' },
        female: { one: 'She has {count} item', other: 'She has {count} items' },
      };
      
      const genderResolved = value.male;
      const category = getPluralCategory('en', 1);
      const result = resolvePluralString(genderResolved, category);
      
      expect(result).toBe('He has {count} item');
    });

    it('should handle female with count=5', () => {
      const value = {
        male: { one: 'He has {count} item', other: 'He has {count} items' },
        female: { one: 'She has {count} item', other: 'She has {count} items' },
      };
      
      const genderResolved = value.female;
      const category = getPluralCategory('en', 5);
      const result = resolvePluralString(genderResolved, category);
      
      expect(result).toBe('She has {count} items');
    });
  });

  describe('Fallback logic', () => {
    it('should fallback when gender missing in plural form', () => {
      const value = {
        one: { male: 'He has {count} item', neutral: 'They have {count} item' },
        other: { male: 'He has {count} items', neutral: 'They have {count} items' },
      };
      
      const category = getPluralCategory('en', 1);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'female');
      
      expect(result).toBe('They have {count} item');
    });

    it('should fallback when plural missing in gender form', () => {
      const value = {
        male: { one: 'He has {count} item' },
        female: { one: 'She has {count} item', other: 'She has {count} items' },
      };
      
      const genderResolved = value.male;
      const category = getPluralCategory('en', 5);
      const result = resolvePluralString(genderResolved, category);
      
      expect(result).toBe('He has {count} item');
    });
  });

  describe('Complex languages', () => {
    it('should handle Russian plural + gender', () => {
      const value = {
        one: { male: 'У него {count} товар', female: 'У неё {count} товар' },
        few: { male: 'У него {count} товара', female: 'У неё {count} товара' },
        many: { male: 'У него {count} товаров', female: 'У неё {count} товаров' },
      };
      
      const category = getPluralCategory('ru', 2);
      const pluralResolved = value[category as 'one' | 'few' | 'many'];
      const result = resolveGenderForm(pluralResolved, 'female');
      
      expect(result).toBe('У неё {count} товара');
    });

    it('should handle Arabic plural + gender (6 forms)', () => {
      const value = {
        zero: { male: 'ليس لديه عناصر', female: 'ليس لديها عناصر' },
        one: { male: 'لديه عنصر واحد', female: 'لديها عنصر واحد' },
        two: { male: 'لديه عنصران', female: 'لديها عنصران' },
        few: { male: 'لديه {count} عناصر', female: 'لديها {count} عناصر' },
        many: { male: 'لديه {count} عنصرًا', female: 'لديها {count} عنصرًا' },
        other: { male: 'لديه {count} عنصر', female: 'لديها {count} عنصر' },
      };
      
      const category = getPluralCategory('ar', 3);
      const pluralResolved = value[category as keyof typeof value];
      const result = resolveGenderForm(pluralResolved, 'male');
      
      expect(result).toBe('لديه {count} عناصر');
    });

    it('should handle all Russian plural forms with both genders', () => {
      const value = {
        one: { male: 'Он', female: 'Она' },
        few: { male: 'Он', female: 'Она' },
        many: { male: 'Он', female: 'Она' },
      };
      
      expect(resolveGenderForm(value.one, 'male')).toBe('Он');
      expect(resolveGenderForm(value.one, 'female')).toBe('Она');
      expect(resolveGenderForm(value.few, 'male')).toBe('Он');
      expect(resolveGenderForm(value.few, 'female')).toBe('Она');
      expect(resolveGenderForm(value.many, 'male')).toBe('Он');
      expect(resolveGenderForm(value.many, 'female')).toBe('Она');
    });
  });

  describe('Edge cases in integration', () => {
    it('should handle missing gender in some plural forms', () => {
      const value = {
        one: { male: 'He has {count} item' },
        other: { male: 'He has {count} items', female: 'She has {count} items' },
      };
      
      const category = getPluralCategory('en', 1);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'female');
      
      // Should fallback to first available (male)
      expect(result).toBe('He has {count} item');
    });

    it('should handle missing plural in some gender forms', () => {
      const value = {
        male: { one: 'He has {count} item', other: 'He has {count} items' },
        female: { one: 'She has {count} item' },
      };
      
      const genderResolved = value.female;
      const category = getPluralCategory('en', 5);
      const result = resolvePluralString(genderResolved, category);
      
      // Should fallback to first available (one)
      expect(result).toBe('She has {count} item');
    });

    it('should handle neutral gender with plurals', () => {
      const value = {
        one: { male: 'He', female: 'She', neutral: 'They' },
        other: { male: 'He', female: 'She', neutral: 'They' },
      };
      
      const category = getPluralCategory('en', 1);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'neutral');
      
      expect(result).toBe('They');
    });

    it('should handle count=0 with gender', () => {
      const value = {
        one: { male: 'He has {count} item', female: 'She has {count} item' },
        other: { male: 'He has {count} items', female: 'She has {count} items' },
      };
      
      const category = getPluralCategory('en', 0);
      const pluralResolved = value[category as 'one' | 'other'];
      const result = resolveGenderForm(pluralResolved, 'female');
      
      expect(result).toBe('She has {count} items');
    });
  });
});
