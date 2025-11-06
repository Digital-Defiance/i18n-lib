import { EnumRegistry } from '../src/core/enum-registry';

enum TestEnum {
  Value1 = 'value1',
  Value2 = 'value2',
}

enum NumericEnum {
  First = 1,
  Second = 2,
}

describe('EnumRegistry coverage', () => {
  let registry: EnumRegistry;

  beforeEach(() => {
    registry = new EnumRegistry();
  });

  describe('translate with numeric enums', () => {
    it('should translate numeric enum by value', () => {
      registry.register(
        NumericEnum,
        {
          'en-US': { [NumericEnum.First]: 'First', [NumericEnum.Second]: 'Second' },
        },
        'NumericEnum',
      );

      const result = registry.translate(NumericEnum, NumericEnum.First, 'en-US');
      expect(result).toBe('First');
    });

    it('should translate numeric enum by string key fallback', () => {
      registry.register(
        NumericEnum,
        {
          'en-US': { First: 'First Value', Second: 'Second Value' },
        },
        'NumericEnum',
      );

      const result = registry.translate(NumericEnum, 1, 'en-US');
      expect(result).toBe('First Value');
    });

    it('should throw when numeric enum value not found', () => {
      registry.register(
        NumericEnum,
        {
          'en-US': { [NumericEnum.First]: 'First' },
        },
        'NumericEnum',
      );

      expect(() => {
        registry.translate(NumericEnum, 999 as NumericEnum, 'en-US');
      }).toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw when enum not registered', () => {
      expect(() => {
        registry.translate(TestEnum, TestEnum.Value1, 'en-US');
      }).toThrow('No translations found');
    });

    it('should throw when language not found', () => {
      registry.register(
        TestEnum,
        {
          'en-US': { [TestEnum.Value1]: 'Value 1' },
        },
        'TestEnum',
      );

      expect(() => {
        registry.translate(TestEnum, TestEnum.Value1, 'invalid-lang');
      }).toThrow();
    });
  });

  describe('has method', () => {
    it('should return false for unregistered enum', () => {
      expect(registry.has(TestEnum)).toBe(false);
    });

    it('should return true for registered enum', () => {
      registry.register(
        TestEnum,
        {
          'en-US': { [TestEnum.Value1]: 'Value 1' },
        },
        'TestEnum',
      );

      expect(registry.has(TestEnum)).toBe(true);
    });
  });
});
