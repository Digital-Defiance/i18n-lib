/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { DefaultStringKey } from '../src';
import { EnumTranslationRegistry } from '../src/enum-registry';
import { EnumLanguageTranslation } from '../src/types';

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

describe('EnumTranslationRegistry', () => {
  let registry: EnumTranslationRegistry<DefaultStringKey, TestLanguages>;

  beforeEach(() => {
    registry = new EnumTranslationRegistry<DefaultStringKey, TestLanguages>([
      TestLanguages.English,
      TestLanguages.Spanish,
    ]);
  });

  describe('register', () => {
    it('should register enum translations', () => {
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

      expect(() => {
        registry.register(TestStatus, translations, 'TestStatus');
      }).not.toThrow();

      expect(registry.has(TestStatus)).toBe(true);
    });

    it('should validate available languages', () => {
      const invalidTranslations = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
        },
        French: {
          [TestStatus.Active]: 'Actif',
        },
      };

      expect(() => {
        registry.register(TestStatus, invalidTranslations as any, 'TestStatus');
      }).toThrow(
        "Language 'French' in enum 'TestStatus' is not available in this registry",
      );
    });

    it('should register numeric enum translations', () => {
      const translations: EnumLanguageTranslation<number, TestLanguages> = {
        [TestLanguages.English]: {
          [NumericEnum.First]: 'First',
          [NumericEnum.Second]: 'Second',
          [NumericEnum.Third]: 'Third',
        },
        [TestLanguages.Spanish]: {
          [NumericEnum.First]: 'Primero',
          [NumericEnum.Second]: 'Segundo',
          [NumericEnum.Third]: 'Tercero',
        },
      };

      expect(() => {
        registry.register(
          NumericEnum as unknown as Record<string, number>,
          translations,
          'NumericEnum',
        );
      }).not.toThrow();

      expect(
        registry.has(NumericEnum as unknown as Record<string, number>),
      ).toBe(true);
    });
  });

  describe('translate', () => {
    beforeEach(() => {
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
      registry.register(TestStatus, translations, 'TestStatus');
    });

    it('should translate enum values', () => {
      const result = registry.translate(
        TestStatus,
        TestStatus.Active,
        TestLanguages.English,
      );
      expect(result).toBe('Active');
    });

    it('should translate to different languages', () => {
      const englishResult = registry.translate(
        TestStatus,
        TestStatus.Active,
        TestLanguages.English,
      );
      const spanishResult = registry.translate(
        TestStatus,
        TestStatus.Active,
        TestLanguages.Spanish,
      );

      expect(englishResult).toBe('Active');
      expect(spanishResult).toBe('Activo');
    });

    it('should translate all enum values', () => {
      expect(
        registry.translate(
          TestStatus,
          TestStatus.Active,
          TestLanguages.English,
        ),
      ).toBe('Active');
      expect(
        registry.translate(
          TestStatus,
          TestStatus.Inactive,
          TestLanguages.English,
        ),
      ).toBe('Inactive');
      expect(
        registry.translate(
          TestStatus,
          TestStatus.Pending,
          TestLanguages.English,
        ),
      ).toBe('Pending');
    });

    it('should handle numeric enums', () => {
      const numericTranslations: EnumLanguageTranslation<
        number,
        TestLanguages
      > = {
        [TestLanguages.English]: {
          [NumericEnum.First]: 'First',
          [NumericEnum.Second]: 'Second',
          [NumericEnum.Third]: 'Third',
        },
      };
      registry.register(
        NumericEnum as unknown as Record<string, number>,
        numericTranslations,
        'NumericEnum',
      );

      const result = registry.translate(
        NumericEnum as unknown as Record<string, number>,
        NumericEnum.First,
        TestLanguages.English,
      );
      expect(result).toBe('First');
    });

    it('should use translation function for error messages when provided', () => {
      const mockTranslateFn = jest.fn((key: string) => `Translated: ${key}`);
      const registryWithTranslation = new EnumTranslationRegistry<
        DefaultStringKey,
        TestLanguages
      >([TestLanguages.English], mockTranslateFn);

      expect(() => {
        registryWithTranslation.translate(
          { Unknown: 'unknown' },
          'unknown' as any,
          TestLanguages.English,
        );
      }).toThrow('Translated: Error_EnumNotFoundTemplate');

      expect(mockTranslateFn).toHaveBeenCalledWith(
        'Error_EnumNotFoundTemplate',
        { enumName: 'UnknownEnum' },
      );
    });

    it('should handle numeric enum values by finding string keys', () => {
      const numericTranslations: EnumLanguageTranslation<
        string,
        TestLanguages
      > = {
        [TestLanguages.English]: {
          First: 'First Item',
          Second: 'Second Item',
          Third: 'Third Item',
        },
      };
      const enumRef = NumericEnum as unknown as Record<string, number>;
      registry.register(
        enumRef,
        numericTranslations as EnumLanguageTranslation<number, TestLanguages>,
        'NumericEnum',
      );

      // Test with the actual numeric value - the registry should find the string key 'First' for value 1
      const result = registry.translate(
        enumRef,
        1 as number,
        TestLanguages.English,
      );
      expect(result).toBe('First Item');
    });

    it('should throw error for unregistered enum', () => {
      const unregisteredEnum = { Test: 'test' };

      expect(() => {
        registry.translate(
          unregisteredEnum,
          'test' as any,
          TestLanguages.English,
        );
      }).toThrow('No translations found for enum: UnknownEnum');
    });

    it('should throw error for unsupported language', () => {
      expect(() => {
        registry.translate(TestStatus, TestStatus.Active, TestLanguages.French);
      }).toThrow('No translations found for language: French');
    });

    it('should throw error for missing translation', () => {
      const incompleteTranslations = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
          // Missing Inactive and Pending - this will be a runtime error
        },
      };
      registry.register(
        TestStatus,
        incompleteTranslations as EnumLanguageTranslation<
          TestStatus,
          TestLanguages
        >,
        'IncompleteStatus',
      );

      expect(() => {
        registry.translate(
          TestStatus,
          TestStatus.Inactive,
          TestLanguages.English,
        );
      }).toThrow('No translation found for value: inactive');
    });

    it('should use enum name in error messages', () => {
      const customEnum = { Custom: 'custom' };
      registry.register(
        customEnum,
        {
          [TestLanguages.English]: { Custom: 'Custom Value' },
        } as EnumLanguageTranslation<string, TestLanguages>,
        'CustomEnum',
      );

      expect(() => {
        registry.translate(
          customEnum,
          'nonexistent' as any,
          TestLanguages.English,
        );
      }).toThrow('No translation found for value: nonexistent');
    });
  });

  describe('has', () => {
    it('should return true for registered enums', () => {
      const translations = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
        },
      };
      registry.register(
        TestStatus,
        translations as EnumLanguageTranslation<TestStatus, TestLanguages>,
        'TestStatus',
      );

      expect(registry.has(TestStatus)).toBe(true);
    });

    it('should return false for unregistered enums', () => {
      const unregisteredEnum = { Test: 'test' };
      expect(registry.has(unregisteredEnum)).toBe(false);
    });

    it('should handle multiple registrations', () => {
      const translations1 = {
        [TestLanguages.English]: { [TestStatus.Active]: 'Active' },
      };
      const translations2 = {
        [TestLanguages.English]: { [NumericEnum.First]: 'First' },
      };

      registry.register(
        TestStatus,
        translations1 as EnumLanguageTranslation<TestStatus, TestLanguages>,
        'TestStatus',
      );
      registry.register(
        NumericEnum as unknown as Record<string, number>,
        translations2 as EnumLanguageTranslation<number, TestLanguages>,
        'NumericEnum',
      );

      expect(registry.has(TestStatus)).toBe(true);
      expect(
        registry.has(NumericEnum as unknown as Record<string, number>),
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty translations', () => {
      const emptyTranslations = {
        [TestLanguages.English]: {},
      };

      expect(() => {
        registry.register(
          TestStatus,
          emptyTranslations as EnumLanguageTranslation<
            TestStatus,
            TestLanguages
          >,
          'EmptyStatus',
        );
      }).not.toThrow();

      expect(() => {
        registry.translate(
          TestStatus,
          TestStatus.Active,
          TestLanguages.English,
        );
      }).toThrow('No translation found for value: active');
    });

    it('should handle partial language coverage', () => {
      const partialTranslations = {
        [TestLanguages.English]: {
          [TestStatus.Active]: 'Active',
          [TestStatus.Inactive]: 'Inactive',
        },
        // Missing Spanish translations
      };
      registry.register(
        TestStatus,
        partialTranslations as EnumLanguageTranslation<
          TestStatus,
          TestLanguages
        >,
        'PartialStatus',
      );

      expect(
        registry.translate(
          TestStatus,
          TestStatus.Active,
          TestLanguages.English,
        ),
      ).toBe('Active');
      expect(() => {
        registry.translate(
          TestStatus,
          TestStatus.Active,
          TestLanguages.Spanish,
        );
      }).toThrow('No translations found for language: Spanish');
    });
  });
});
