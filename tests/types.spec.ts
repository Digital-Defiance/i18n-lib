/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  createTranslations,
  EnumLanguageTranslation,
  EnumTranslation,
} from '../src/types';

enum TestStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

enum NumericEnum {
  First = 1,
  Second = 2,
  Third = 3,
}

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
}

describe('types utilities', () => {
  describe('createTranslations', () => {
    it('should create translations for string enum', () => {
      const translations: EnumLanguageTranslation<TestStatus, TestLanguages> = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
          [TestStatus.Inactive]: 'Inactive',
          [TestStatus.Pending]: 'Pending',
        },
        [TestLanguages.Spanish]: {
          [TestStatus.Active]: 'Activo',
          [TestStatus.Inactive]: 'Inactivo',
          [TestStatus.Pending]: 'Pendiente',
        },
      };

      const result = createTranslations(translations);

      expect(result).toEqual(translations);
      expect(result[TestLanguages.English]?.[TestStatus.Active]).toBe('Active');
      expect(result[TestLanguages.Spanish]?.[TestStatus.Active]).toBe('Activo');
    });

    it('should create translations for numeric enum', () => {
      const translations: EnumLanguageTranslation<number, TestLanguages> = {
        [TestLanguages.English]: {
          [NumericEnum.First]: 'First',
          [NumericEnum.Second]: 'Second',
          [NumericEnum.Third]: 'Third',
        },
        [TestLanguages.French]: {
          [NumericEnum.First]: 'Premier',
          [NumericEnum.Second]: 'Deuxième',
          [NumericEnum.Third]: 'Troisième',
        },
      };

      const result = createTranslations(translations);

      expect(result).toEqual(translations);
      expect(result[TestLanguages.English]?.[NumericEnum.First]).toBe('First');
      expect(result[TestLanguages.French]?.[NumericEnum.First]).toBe('Premier');
    });

    it('should handle partial translations', () => {
      const partialTranslations = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
          // Missing other statuses - this would be a TypeScript error with complete EnumTranslation
        },
      };

      const result = createTranslations(
        partialTranslations as EnumLanguageTranslation<
          TestStatus,
          TestLanguages
        >,
      );

      expect(result).toEqual(partialTranslations);
      expect(result[TestLanguages.English]?.[TestStatus.Active]).toBe('Active');
      expect(
        result[TestLanguages.English]?.[TestStatus.Inactive],
      ).toBeUndefined();
    });

    it('should handle empty translations', () => {
      const emptyTranslations = {
        [TestLanguages.English]: {},
      };

      const result = createTranslations(
        emptyTranslations as EnumLanguageTranslation<TestStatus, TestLanguages>,
      );

      expect(result).toEqual(emptyTranslations);
      expect(Object.keys(result[TestLanguages.English] || {})).toHaveLength(0);
    });

    it('should preserve type safety', () => {
      const translations: EnumLanguageTranslation<TestStatus, TestLanguages> = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
          [TestStatus.Inactive]: 'Inactive',
          [TestStatus.Pending]: 'Pending',
        },
      };

      const result = createTranslations(translations);

      // Type checking - these should compile without errors
      const activeTranslation: string | undefined =
        result[TestLanguages.English]?.[TestStatus.Active];
      const englishTranslations: EnumTranslation<TestStatus> | undefined =
        result[TestLanguages.English];

      expect(activeTranslation).toBe('Active');
      expect(englishTranslations?.[TestStatus.Active]).toBe('Active');
    });

    it('should handle mixed enum value types', () => {
      // Test with enum that has both string and numeric-like values
      enum MixedEnum {
        StringValue = 'string_value',
        NumericValue = 'numeric_value',
      }

      const translations: EnumLanguageTranslation<MixedEnum, TestLanguages> = {
        [TestLanguages.English]: {
          [MixedEnum.StringValue]: 'String Value',
          [MixedEnum.NumericValue]: 'Numeric Value',
        },
      };

      const result = createTranslations(translations);

      expect(result[TestLanguages.English]?.[MixedEnum.StringValue]).toBe(
        'String Value',
      );
      expect(result[TestLanguages.English]?.[MixedEnum.NumericValue]).toBe(
        'Numeric Value',
      );
    });
  });

  describe('type definitions', () => {
    it('should support EnumTranslation type', () => {
      const statusTranslations: EnumTranslation<TestStatus> = {
        [TestStatus.Active]: 'Active',
        [TestStatus.Inactive]: 'Inactive',
        [TestStatus.Pending]: 'Pending',
      };

      expect(statusTranslations[TestStatus.Active]).toBe('Active');
      expect(Object.keys(statusTranslations)).toHaveLength(3);
    });

    it('should require complete EnumTranslation', () => {
      // This would be a TypeScript error - EnumTranslation requires all enum values
      const partialTranslations = {
        [TestStatus.Active]: 'Active',
        // Missing other values - this is now a compile-time error
      };

      expect(partialTranslations[TestStatus.Active]).toBe('Active');
      expect(
        partialTranslations[
          TestStatus.Inactive as keyof typeof partialTranslations
        ],
      ).toBeUndefined();
    });

    it('should support numeric enum translations', () => {
      const numericTranslations: EnumTranslation<number> = {
        [NumericEnum.First]: 'First',
        [NumericEnum.Second]: 'Second',
        [NumericEnum.Third]: 'Third',
      };

      expect(numericTranslations[NumericEnum.First]).toBe('First');
      expect(numericTranslations[1]).toBe('First'); // Should work with numeric access too
    });

    it('should support custom language types', () => {
      type CustomLanguages = 'German' | 'Italian' | 'Portuguese';

      const customTranslations: EnumLanguageTranslation<
        TestStatus,
        CustomLanguages
      > = {
        German: {
          [TestStatus.Active]: 'Aktiv',
          [TestStatus.Inactive]: 'Inaktiv',
          [TestStatus.Pending]: 'Ausstehend',
        },
        Italian: {
          [TestStatus.Active]: 'Attivo',
          [TestStatus.Inactive]: 'Inattivo',
          [TestStatus.Pending]: 'In attesa',
        },
      };

      const result = createTranslations(customTranslations);

      expect(result.German?.[TestStatus.Active]).toBe('Aktiv');
      expect(result.Italian?.[TestStatus.Active]).toBe('Attivo');
    });
  });
});
