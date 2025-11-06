import { defineLanguageStrings, CompleteLanguageStrings } from '../src/strict-types';

enum TestKey {
  Key1 = 'key1',
  Key2 = 'key2',
}

describe('strict-types coverage', () => {
  describe('defineLanguageStrings', () => {
    it('should return the input object unchanged', () => {
      const input: CompleteLanguageStrings<TestKey> = {
        [TestKey.Key1]: 'Value 1',
        [TestKey.Key2]: 'Value 2',
      };
      const result = defineLanguageStrings(input);
      expect(result).toBe(input);
      expect(result).toEqual(input);
    });

    it('should work with string literal types', () => {
      type Keys = 'a' | 'b' | 'c';
      const input: CompleteLanguageStrings<Keys> = {
        a: 'A',
        b: 'B',
        c: 'C',
      };
      const result = defineLanguageStrings(input);
      expect(result).toEqual(input);
    });
  });
});
