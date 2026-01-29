/**
 * Tests for branded string key integration
 */
import {
  createI18nStringKeys,
  createI18nStringKeysFromEnum,
  checkStringKeyCollisions,
  findStringKeySources,
  resolveStringKeyComponent,
  getRegisteredI18nComponents,
  getStringKeysByComponentId,
  isValidStringKey,
  mergeI18nStringKeys,
  getStringKeyValues,
} from '../src/branded-string-key';
import {
  CoreStringKeys,
  CoreStringKey,
  CoreStringKeyValue,
} from '../src/core-string-key';

// Clear the branded enum registry before each test to avoid pollution
// Note: This is a simplified approach - in a real scenario you might need
// to use a more sophisticated cleanup mechanism

describe('Branded String Keys', () => {
  describe('createI18nStringKeys', () => {
    it('should create a branded enum with the correct values', () => {
      const TestKeys = createI18nStringKeys('test-component', {
        Hello: 'test.hello',
        Goodbye: 'test.goodbye',
      } as const);

      expect(TestKeys.Hello).toBe('test.hello');
      expect(TestKeys.Goodbye).toBe('test.goodbye');
    });

    it('should register the enum with i18n: prefix', () => {
      const TestKeys = createI18nStringKeys('unique-test-1', {
        Key1: 'unique1.key1',
      } as const);

      const sources = findStringKeySources('unique1.key1');
      expect(sources).toContain('i18n:unique-test-1');
      const value: TestKeyValue = TestKeys.Key1;
      expect(value).toBe('unique1.key1');
    });

    it('should maintain type safety', () => {
      const TestKeys = createI18nStringKeys('type-test', {
        A: 'type.a',
        B: 'type.b',
      } as const);

      // TypeScript should infer the correct type
      type TestKeyValue = (typeof TestKeys)[keyof typeof TestKeys];
      const value: TestKeyValue = TestKeys.A;
      expect(value).toBe('type.a');
    });

    it('should be idempotent - return existing enum when called with same componentId', () => {
      const Keys1 = createI18nStringKeys('idempotent-test', {
        Key: 'idempotent.key',
      } as const);

      const Keys2 = createI18nStringKeys('idempotent-test', {
        Key: 'idempotent.key',
      } as const);

      // Should return the same reference (idempotent behavior)
      expect(Keys1).toBe(Keys2);
      expect(Keys1.Key).toBe('idempotent.key');
    });
  });

  describe('createI18nStringKeysFromEnum', () => {
    it('should convert a TypeScript enum to a branded enum', () => {
      enum LegacyKeys {
        First = 'legacy.first',
        Second = 'legacy.second',
      }

      const BrandedLegacyKeys = createI18nStringKeysFromEnum(
        'legacy-component',
        LegacyKeys,
      );

      expect(BrandedLegacyKeys.First).toBe('legacy.first');
      expect(BrandedLegacyKeys.Second).toBe('legacy.second');
    });
  });

  describe('checkStringKeyCollisions', () => {
    it('should detect no collisions when enums have unique values', () => {
      const Enum1 = createI18nStringKeys('collision-test-1', {
        A: 'collision1.a',
      } as const);

      const Enum2 = createI18nStringKeys('collision-test-2', {
        B: 'collision2.b',
      } as const);

      const result = checkStringKeyCollisions(Enum1, Enum2);
      expect(result.hasCollisions).toBe(false);
      expect(result.collisions).toHaveLength(0);
    });

    it('should detect collisions when enums share values', () => {
      const Enum1 = createI18nStringKeys('collision-test-3', {
        Shared: 'shared.value',
      } as const);

      const Enum2 = createI18nStringKeys('collision-test-4', {
        Shared: 'shared.value',
      } as const);

      const result = checkStringKeyCollisions(Enum1, Enum2);
      expect(result.hasCollisions).toBe(true);
      expect(result.collisions).toHaveLength(1);
      expect(result.collisions[0].value).toBe('shared.value');
      expect(result.collisions[0].componentIds).toContain(
        'i18n:collision-test-3',
      );
      expect(result.collisions[0].componentIds).toContain(
        'i18n:collision-test-4',
      );
    });
  });

  describe('findStringKeySources', () => {
    it('should find the source component for a string key', () => {
      const TestKeys = createI18nStringKeys('source-test', {
        FindMe: 'source.findme',
      } as const);

      const sources = findStringKeySources('source.findme');
      expect(sources).toContain('i18n:source-test');
      const value: TestKeyValue = TestKeys.FindMe;
      expect(value).toBe('source.findme');
    });

    it('should return empty array for unknown keys', () => {
      const sources = findStringKeySources('unknown.nonexistent.key');
      expect(sources).toHaveLength(0);
    });
  });

  describe('resolveStringKeyComponent', () => {
    it('should resolve a key to its component when unique', () => {
      createI18nStringKeys('resolve-test', {
        Unique: 'resolve.unique.key.12345',
      } as const);

      const componentId = resolveStringKeyComponent('resolve.unique.key.12345');
      expect(componentId).toBe('resolve-test');
    });

    it('should return null for ambiguous keys', () => {
      createI18nStringKeys('ambiguous-1', {
        Same: 'ambiguous.same.value',
      } as const);

      createI18nStringKeys('ambiguous-2', {
        Same: 'ambiguous.same.value',
      } as const);

      const componentId = resolveStringKeyComponent('ambiguous.same.value');
      expect(componentId).toBeNull();
    });

    it('should return null for unknown keys', () => {
      const componentId = resolveStringKeyComponent('totally.unknown.key.xyz');
      expect(componentId).toBeNull();
    });
  });

  describe('getRegisteredI18nComponents', () => {
    it('should return registered component IDs', () => {
      createI18nStringKeys('registered-test-1', { Key: 'reg1.key' } as const);
      createI18nStringKeys('registered-test-2', { Key: 'reg2.key' } as const);

      const components = getRegisteredI18nComponents();
      expect(components).toContain('registered-test-1');
      expect(components).toContain('registered-test-2');
    });
  });

  describe('getStringKeysByComponentId', () => {
    it('should retrieve a branded enum by component ID', () => {
      const Original = createI18nStringKeys('retrieve-test', {
        Key1: 'retrieve.key1',
        Key2: 'retrieve.key2',
      } as const);

      const retrieved = getStringKeysByComponentId('retrieve-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.Key1).toBe('retrieve.key1');
      expect(retrieved?.Key2).toBe('retrieve.key2');
      const value: TestKeyValue = Original.Key1;
      const value2: TestKeyValue = Original.Key2;
      expect(value).toBe('retrieve.key1');
      expect(value2).toBe('retrieve.key2');
    });

    it('should return undefined for unknown component ID', () => {
      const retrieved = getStringKeysByComponentId('nonexistent-component');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('isValidStringKey', () => {
    it('should return true for valid keys', () => {
      const TestKeys = createI18nStringKeys('valid-test', {
        Valid: 'valid.key',
      } as const);

      expect(isValidStringKey('valid.key', TestKeys)).toBe(true);
    });

    it('should return false for invalid keys', () => {
      const TestKeys = createI18nStringKeys('invalid-test', {
        Valid: 'valid.key2',
      } as const);

      expect(isValidStringKey('invalid.key', TestKeys)).toBe(false);
    });

    it('should return false for non-string values', () => {
      const TestKeys = createI18nStringKeys('nonstring-test', {
        Valid: 'valid.key3',
      } as const);

      expect(isValidStringKey(123, TestKeys)).toBe(false);
      expect(isValidStringKey(null, TestKeys)).toBe(false);
      expect(isValidStringKey(undefined, TestKeys)).toBe(false);
    });
  });

  describe('mergeI18nStringKeys', () => {
    it('should merge multiple branded enums', () => {
      const Enum1 = createI18nStringKeys('merge-1', {
        A: 'merge.a',
      } as const);

      const Enum2 = createI18nStringKeys('merge-2', {
        B: 'merge.b',
      } as const);

      const Merged = mergeI18nStringKeys('merged', Enum1, Enum2);
      expect(Merged.A).toBe('merge.a');
      expect(Merged.B).toBe('merge.b');
    });
  });

  describe('getStringKeyValues', () => {
    it('should return all values from a branded enum', () => {
      const TestKeys = createI18nStringKeys('values-test', {
        Key1: 'values.key1',
        Key2: 'values.key2',
        Key3: 'values.key3',
      } as const);

      const values = getStringKeyValues(TestKeys);
      expect(values).toContain('values.key1');
      expect(values).toContain('values.key2');
      expect(values).toContain('values.key3');
      expect(values).toHaveLength(3);
    });
  });
});

describe('CoreStringKeys (Branded)', () => {
  it('should have the same values as the legacy enum', () => {
    expect(CoreStringKeys.Common_Yes).toBe(CoreStringKey.Common_Yes);
    expect(CoreStringKeys.Common_No).toBe(CoreStringKey.Common_No);
    expect(CoreStringKeys.Error_NotFound).toBe(CoreStringKey.Error_NotFound);
  });

  it('should be registered in the i18n namespace', () => {
    const sources = findStringKeySources('common_yes');
    expect(sources).toContain('i18n:core');
  });

  it('should allow type-safe value extraction', () => {
    const value: CoreStringKeyValue = CoreStringKeys.Common_OK;
    expect(value).toBe('common_ok');
  });

  it('should validate core string keys', () => {
    expect(isValidStringKey('common_yes', CoreStringKeys)).toBe(true);
    expect(isValidStringKey('invalid_key', CoreStringKeys)).toBe(false);
  });
});
