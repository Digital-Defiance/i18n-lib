/**
 * Type-level tests for branded enum type aliases
 *
 * This test file validates the type system behavior for branded enum support
 * in the i18n library. It covers:
 *
 * - **Property 1: Type Alias Equivalence** (Requirements 3.1, 3.2)
 * - **Property 2: Type Safety for Branded Enum Values** (Requirements 4.1, 4.4)
 * - **Property 3: ExtractStringKeys Correctness** (Requirements 4.2, 4.3)
 * - **Property 4: Backward Compatibility** (Requirements 6.1, 6.2)
 *
 * @module branded-types.spec
 */
import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
import { createI18nStringKeys } from '../src/branded-string-key';
import type { ComponentDefinition } from '../src/component-definition';
import type {
  StringsCollection,
  MasterStringsCollection,
  BrandedStringsCollection,
  BrandedMasterStringsCollection,
  ExtractStringKeys,
  EnumLanguageTranslation,
  EnumTranslationMap,
} from '../src/types';

/**
 * Type-level utility to assert two types are exactly equal.
 * If A and B are not equal, this will produce a type error.
 */
type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

/**
 * Helper type that produces a compile error if the condition is false.
 * Used to verify type equivalence at compile time.
 */
type AssertTrue<T extends true> = T;

/**
 * Test branded enum for type-level testing.
 *
 * This branded enum is used across all property tests to verify:
 * - Type alias equivalence (Property 1)
 * - Type safety for branded enum values (Property 2)
 * - ExtractStringKeys correctness (Property 3)
 * - Backward compatibility (Property 4)
 *
 * Created with `createI18nStringKeys` to ensure it has proper branded enum metadata.
 */
const TestKeys = createI18nStringKeys('test-branded-types-spec', {
  Welcome: 'test.welcome',
  Goodbye: 'test.goodbye',
} as const);

/**
 * Test language type for multi-language type testing.
 *
 * Used to verify MasterStringsCollection and BrandedMasterStringsCollection
 * work correctly with language type parameters.
 */
type TestLanguages = 'en-US' | 'es';

/**
 * Test ComponentDefinition for ExtractStringKeys testing.
 *
 * This definition is used to verify that ExtractStringKeys correctly
 * extracts BrandedEnumValue<E> from ComponentDefinition<E>.
 */
const _TestComponentDefinition: ComponentDefinition<typeof TestKeys> = {
  id: 'test-branded-types-spec',
  name: 'Test Component for Branded Types',
  stringKeys: TestKeys,
};

/**
 * Compile-time type assertions for Property 1: Type Alias Equivalence
 *
 * These type aliases will cause a compile error if the types are not equivalent.
 * The fact that this file compiles successfully proves the type equivalence.
 */

// **Validates: Requirement 3.1**
// BrandedStringsCollection<E> should be equivalent to StringsCollection<BrandedEnumValue<E>>
type BrandedStringsCollectionExpected = StringsCollection<
  BrandedEnumValue<typeof TestKeys>
>;
type BrandedStringsCollectionActual = BrandedStringsCollection<typeof TestKeys>;
type _AssertBrandedStringsCollectionEquivalence = AssertTrue<
  AssertEqual<BrandedStringsCollectionActual, BrandedStringsCollectionExpected>
>;

// **Validates: Requirement 3.2**
// BrandedMasterStringsCollection<E, TLanguage> should be equivalent to
// MasterStringsCollection<BrandedEnumValue<E>, TLanguage>
type BrandedMasterStringsCollectionExpected = MasterStringsCollection<
  BrandedEnumValue<typeof TestKeys>,
  TestLanguages
>;
type BrandedMasterStringsCollectionActual = BrandedMasterStringsCollection<
  typeof TestKeys,
  TestLanguages
>;
type _AssertBrandedMasterStringsCollectionEquivalence = AssertTrue<
  AssertEqual<
    BrandedMasterStringsCollectionActual,
    BrandedMasterStringsCollectionExpected
  >
>;

/**
 * Second branded enum for cross-enum type safety testing.
 *
 * This branded enum is used to verify that values from one branded enum
 * cannot be used with another branded enum's types (Property 2, test case 3).
 *
 * Created with a different component ID to ensure it's a distinct branded enum.
 */
const OtherKeys = createI18nStringKeys('other-component-spec', {
  Title: 'other.title',
  Content: 'other.content',
} as const);

describe('Branded Enum Type Aliases', () => {
  describe('Property 1: Type Alias Equivalence', () => {
    /**
     * **Validates: Requirement 3.1**
     *
     * BrandedStringsCollection<E> should be equivalent to StringsCollection<BrandedEnumValue<E>>
     *
     * This test verifies at runtime that values assignable to one type are assignable to the other.
     * The compile-time assertion above (_AssertBrandedStringsCollectionEquivalence) provides
     * the actual type equivalence guarantee.
     */
    it('BrandedStringsCollection should be equivalent to StringsCollection<BrandedEnumValue<E>>', () => {
      // Create a value using the ergonomic alias
      const stringsViaAlias: BrandedStringsCollectionActual = {
        'test.welcome': 'Welcome!',
        'test.goodbye': 'Goodbye!',
      };

      // Assign to the expanded type - this would fail to compile if types weren't equivalent
      const stringsViaExpanded: BrandedStringsCollectionExpected =
        stringsViaAlias;

      // And vice versa
      const backToAlias: BrandedStringsCollectionActual = stringsViaExpanded;

      expect(stringsViaAlias).toBeDefined();
      expect(stringsViaExpanded).toBeDefined();
      expect(backToAlias).toBeDefined();
      expect(stringsViaAlias['test.welcome']).toBe('Welcome!');
    });

    /**
     * **Validates: Requirement 3.2**
     *
     * BrandedMasterStringsCollection<E, TLanguage> should be equivalent to
     * MasterStringsCollection<BrandedEnumValue<E>, TLanguage>
     *
     * This test verifies at runtime that values assignable to one type are assignable to the other.
     * The compile-time assertion above (_AssertBrandedMasterStringsCollectionEquivalence) provides
     * the actual type equivalence guarantee.
     */
    it('BrandedMasterStringsCollection should be equivalent to MasterStringsCollection<BrandedEnumValue<E>, TLang>', () => {
      // Create a value using the ergonomic alias
      const masterViaAlias: BrandedMasterStringsCollectionActual = {
        'en-US': { 'test.welcome': 'Welcome!', 'test.goodbye': 'Goodbye!' },
        es: { 'test.welcome': '¡Bienvenido!', 'test.goodbye': '¡Adiós!' },
      };

      // Assign to the expanded type - this would fail to compile if types weren't equivalent
      const masterViaExpanded: BrandedMasterStringsCollectionExpected =
        masterViaAlias;

      // And vice versa
      const backToAlias: BrandedMasterStringsCollectionActual =
        masterViaExpanded;

      expect(masterViaAlias).toBeDefined();
      expect(masterViaExpanded).toBeDefined();
      expect(backToAlias).toBeDefined();
      expect(masterViaAlias['en-US']?.['test.welcome']).toBe('Welcome!');
      expect(masterViaAlias['es']?.['test.welcome']).toBe('¡Bienvenido!');
    });
  });

  /**
   * Property 2: Type Safety for Branded Enum Values
   *
   * **Validates: Requirements 4.1, 4.4**
   *
   * *For any* branded enum `E` created with `createI18nStringKeys`, when a value
   * is used with `BrandedStringsCollection<typeof E>` or
   * `BrandedMasterStringsCollection<typeof E, TLanguage>`, TypeScript SHALL accept
   * only values that are members of `BrandedEnumValue<typeof E>` and reject all
   * other string literals.
   *
   * This property ensures that the type system correctly enforces type safety
   * for branded enum values, catching errors at compile time rather than runtime.
   */
  describe('Property 2: Type Safety for Branded Enum Values', () => {
    /**
     * **Validates: Requirement 4.1**
     *
     * Valid branded enum values should be accepted by BrandedStringsCollection.
     * This test verifies that values which are members of the branded enum
     * can be used as keys in the collection.
     */
    it('should accept valid branded enum values in BrandedStringsCollection', () => {
      // Valid keys from TestKeys branded enum
      const validStrings: BrandedStringsCollection<typeof TestKeys> = {
        'test.welcome': 'Welcome!',
        'test.goodbye': 'Goodbye!',
      };

      expect(validStrings).toBeDefined();
      expect(validStrings['test.welcome']).toBe('Welcome!');
      expect(validStrings['test.goodbye']).toBe('Goodbye!');
    });

    /**
     * **Validates: Requirement 4.1**
     *
     * Valid branded enum values should be accepted by BrandedMasterStringsCollection.
     * This test verifies that values which are members of the branded enum
     * can be used as keys in the master collection across multiple languages.
     */
    it('should accept valid branded enum values in BrandedMasterStringsCollection', () => {
      // Valid keys from TestKeys branded enum across multiple languages
      const validMaster: BrandedMasterStringsCollection<
        typeof TestKeys,
        TestLanguages
      > = {
        'en-US': {
          'test.welcome': 'Welcome!',
          'test.goodbye': 'Goodbye!',
        },
        es: {
          'test.welcome': '¡Bienvenido!',
          'test.goodbye': '¡Adiós!',
        },
      };

      expect(validMaster).toBeDefined();
      expect(validMaster['en-US']?.['test.welcome']).toBe('Welcome!');
      expect(validMaster['es']?.['test.goodbye']).toBe('¡Adiós!');
    });

    /**
     * **Validates: Requirement 4.1**
     *
     * Invalid string keys should be rejected by TypeScript.
     * This test uses @ts-expect-error to verify that the type system
     * correctly rejects string literals that are not valid branded enum values.
     */
    it('should reject invalid string keys in BrandedStringsCollection', () => {
      // @ts-expect-error - 'invalid.key' is not a valid key in TestKeys
      const invalidStrings: BrandedStringsCollection<typeof TestKeys> = {
        'invalid.key': 'This should not compile',
      };

      // This line exists only to prevent unused variable warning
      // The real test is the @ts-expect-error above
      expect(invalidStrings).toBeDefined();
    });

    /**
     * **Validates: Requirement 4.1**
     *
     * Invalid string keys should be rejected in BrandedMasterStringsCollection.
     * This test uses @ts-expect-error to verify that the type system
     * correctly rejects string literals that are not valid branded enum values
     * within the master collection structure.
     */
    it('should reject invalid string keys in BrandedMasterStringsCollection', () => {
      // @ts-expect-error - 'invalid.key' is not a valid key in TestKeys
      const invalidMaster: BrandedMasterStringsCollection<
        typeof TestKeys,
        TestLanguages
      > = {
        'en-US': {
          'invalid.key': 'This should not compile',
        },
      };

      // This line exists only to prevent unused variable warning
      // The real test is the @ts-expect-error above
      expect(invalidMaster).toBeDefined();
    });

    /**
     * **Validates: Requirement 4.4**
     *
     * Values from one branded enum cannot be used with another branded enum's types.
     * This test verifies that TypeScript correctly rejects attempts to use
     * keys from OtherKeys with a collection typed for TestKeys.
     *
     * This is a critical type safety feature that prevents accidental mixing
     * of string keys from different components.
     */
    it('should reject values from a different branded enum in BrandedStringsCollection', () => {
      // @ts-expect-error - 'other.title' is from OtherKeys, not TestKeys
      const crossEnumStrings: BrandedStringsCollection<typeof TestKeys> = {
        'other.title': 'This should not compile',
      };

      // This line exists only to prevent unused variable warning
      // The real test is the @ts-expect-error above
      expect(crossEnumStrings).toBeDefined();
    });

    /**
     * **Validates: Requirement 4.4**
     *
     * Values from one branded enum cannot be used with another branded enum's
     * master collection types. This test verifies cross-enum type safety
     * in the context of BrandedMasterStringsCollection.
     */
    it('should reject values from a different branded enum in BrandedMasterStringsCollection', () => {
      // @ts-expect-error - 'other.content' is from OtherKeys, not TestKeys
      const crossEnumMaster: BrandedMasterStringsCollection<
        typeof TestKeys,
        TestLanguages
      > = {
        'en-US': {
          'other.content': 'This should not compile',
        },
      };

      // This line exists only to prevent unused variable warning
      // The real test is the @ts-expect-error above
      expect(crossEnumMaster).toBeDefined();
    });

    /**
     * **Validates: Requirements 4.1, 4.4**
     *
     * Verify that each branded enum works correctly with its own types.
     * This test confirms that OtherKeys values work with OtherKeys types,
     * demonstrating that the type system correctly distinguishes between
     * different branded enums.
     */
    it('should accept values from the correct branded enum for each type', () => {
      // TestKeys values work with TestKeys types
      const testKeysStrings: BrandedStringsCollection<typeof TestKeys> = {
        'test.welcome': 'Welcome!',
        'test.goodbye': 'Goodbye!',
      };

      // OtherKeys values work with OtherKeys types
      const otherKeysStrings: BrandedStringsCollection<typeof OtherKeys> = {
        'other.title': 'Title',
        'other.content': 'Content',
      };

      expect(testKeysStrings['test.welcome']).toBe('Welcome!');
      expect(otherKeysStrings['other.title']).toBe('Title');
    });
  });

  /**
   * Property 3: ExtractStringKeys Correctness
   *
   * **Validates: Requirements 4.2, 4.3**
   *
   * *For any* `ComponentDefinition<E>` where `E` is a branded enum,
   * `ExtractStringKeys<ComponentDefinition<E>>` SHALL produce the type `BrandedEnumValue<E>`.
   *
   * This property ensures that the ExtractStringKeys utility type correctly
   * extracts the branded enum value type from a ComponentDefinition, enabling
   * type-safe access to string keys defined in component definitions.
   */
  describe('Property 3: ExtractStringKeys Correctness', () => {
    /**
     * Compile-time type assertions for Property 3: ExtractStringKeys Correctness
     *
     * These type aliases will cause a compile error if ExtractStringKeys does not
     * correctly extract BrandedEnumValue<E> from ComponentDefinition<E>.
     * The fact that this file compiles successfully proves the property holds.
     */

    // **Validates: Requirement 4.2**
    // ExtractStringKeys<ComponentDefinition<E>> should produce BrandedEnumValue<E>
    type ExtractedFromTestComponentDefinition = ExtractStringKeys<
      typeof _TestComponentDefinition
    >;
    type ExpectedBrandedEnumValue = BrandedEnumValue<typeof TestKeys>;
    type _AssertExtractStringKeysCorrectness = AssertTrue<
      AssertEqual<
        ExtractedFromTestComponentDefinition,
        ExpectedBrandedEnumValue
      >
    >;

    // **Validates: Requirement 4.3**
    // ExtractStringKeys should work with ComponentDefinition type directly
    type TestDefinitionType = ComponentDefinition<typeof TestKeys>;
    type ExtractedFromDefinitionType = ExtractStringKeys<TestDefinitionType>;
    type _AssertExtractStringKeysFromType = AssertTrue<
      AssertEqual<ExtractedFromDefinitionType, ExpectedBrandedEnumValue>
    >;

    /**
     * **Validates: Requirement 4.2**
     *
     * ExtractStringKeys<ComponentDefinition<E>> should produce BrandedEnumValue<E>.
     * This test verifies at runtime that the extracted type can be used to
     * create valid string collections.
     */
    it('ExtractStringKeys should extract BrandedEnumValue from ComponentDefinition', () => {
      // Use the extracted type to create a strings collection
      // This would fail to compile if ExtractStringKeys didn't produce the correct type
      const stringsUsingExtracted: StringsCollection<ExtractedFromTestComponentDefinition> =
        {
          'test.welcome': 'Welcome!',
          'test.goodbye': 'Goodbye!',
        };

      // Use BrandedEnumValue directly for comparison
      const stringsUsingBrandedEnumValue: StringsCollection<ExpectedBrandedEnumValue> =
        {
          'test.welcome': 'Welcome!',
          'test.goodbye': 'Goodbye!',
        };

      // Both should be assignable to each other (type equivalence)
      const assignedFromExtracted: StringsCollection<ExpectedBrandedEnumValue> =
        stringsUsingExtracted;
      const assignedFromBrandedEnumValue: StringsCollection<ExtractedFromTestComponentDefinition> =
        stringsUsingBrandedEnumValue;

      expect(stringsUsingExtracted).toBeDefined();
      expect(stringsUsingBrandedEnumValue).toBeDefined();
      expect(assignedFromExtracted).toBeDefined();
      expect(assignedFromBrandedEnumValue).toBeDefined();
      expect(stringsUsingExtracted['test.welcome']).toBe('Welcome!');
    });

    /**
     * **Validates: Requirement 4.3**
     *
     * The extracted type can be used interchangeably with BrandedEnumValue<typeof E>.
     * This test verifies that values created with one type can be assigned to the other.
     */
    it('extracted type should be interchangeable with BrandedEnumValue<typeof E>', () => {
      // Create a value using the extracted type
      const valueFromExtracted: ExtractedFromTestComponentDefinition =
        TestKeys.Welcome;

      // Create a value using BrandedEnumValue directly
      const valueFromBrandedEnumValue: ExpectedBrandedEnumValue =
        TestKeys.Goodbye;

      // Both should be assignable to each other
      const assignedToExtracted: ExtractedFromTestComponentDefinition =
        valueFromBrandedEnumValue;
      const assignedToBrandedEnumValue: ExpectedBrandedEnumValue =
        valueFromExtracted;

      expect(valueFromExtracted).toBe('test.welcome');
      expect(valueFromBrandedEnumValue).toBe('test.goodbye');
      expect(assignedToExtracted).toBe('test.goodbye');
      expect(assignedToBrandedEnumValue).toBe('test.welcome');
    });

    /**
     * **Validates: Requirement 4.3**
     *
     * ExtractStringKeys should continue to work correctly with branded enum
     * component definitions. This test verifies that the utility type works
     * with different component definitions.
     */
    it('ExtractStringKeys should work with different ComponentDefinitions', () => {
      // Create a second component definition with OtherKeys
      const _OtherComponentDefinition: ComponentDefinition<typeof OtherKeys> = {
        id: 'other-component-spec',
        name: 'Other Component for Testing',
        stringKeys: OtherKeys,
      };

      // Extract string keys from both definitions
      type ExtractedFromOther = ExtractStringKeys<
        typeof _OtherComponentDefinition
      >;
      type ExpectedOtherValue = BrandedEnumValue<typeof OtherKeys>;

      // Compile-time assertion for OtherKeys extraction
      type _AssertOtherExtraction = AssertTrue<
        AssertEqual<ExtractedFromOther, ExpectedOtherValue>
      >;

      // Runtime verification
      const otherStrings: StringsCollection<ExtractedFromOther> = {
        'other.title': 'Title',
        'other.content': 'Content',
      };

      expect(otherStrings['other.title']).toBe('Title');
      expect(otherStrings['other.content']).toBe('Content');
    });

    /**
     * **Validates: Requirements 4.2, 4.3**
     *
     * ExtractStringKeys should reject invalid types (non-ComponentDefinition).
     * When applied to a type that is not a ComponentDefinition, it should
     * produce `never`.
     */
    it('ExtractStringKeys should produce never for non-ComponentDefinition types', () => {
      // ExtractStringKeys on a non-ComponentDefinition type should produce never
      type ExtractedFromString = ExtractStringKeys<string>;
      type ExtractedFromNumber = ExtractStringKeys<number>;
      type ExtractedFromObject = ExtractStringKeys<{ foo: string }>;

      // Compile-time assertions that these produce never
      type _AssertStringIsNever = AssertTrue<
        AssertEqual<ExtractedFromString, never>
      >;
      type _AssertNumberIsNever = AssertTrue<
        AssertEqual<ExtractedFromNumber, never>
      >;
      type _AssertObjectIsNever = AssertTrue<
        AssertEqual<ExtractedFromObject, never>
      >;

      // Runtime verification (these are just to satisfy the test runner)
      expect(true).toBe(true);
    });

    /**
     * **Validates: Requirements 4.2, 4.3**
     *
     * ExtractStringKeys should work correctly with MasterStringsCollection.
     * This test verifies that the extracted type can be used to create
     * properly typed master string collections.
     */
    it('ExtractStringKeys should work with MasterStringsCollection', () => {
      // Use ExtractStringKeys to create a MasterStringsCollection
      const masterStrings: MasterStringsCollection<
        ExtractedFromTestComponentDefinition,
        TestLanguages
      > = {
        'en-US': {
          'test.welcome': 'Welcome!',
          'test.goodbye': 'Goodbye!',
        },
        es: {
          'test.welcome': '¡Bienvenido!',
          'test.goodbye': '¡Adiós!',
        },
      };

      expect(masterStrings['en-US']?.['test.welcome']).toBe('Welcome!');
      expect(masterStrings['es']?.['test.goodbye']).toBe('¡Adiós!');
    });
  });

  /**
   * Property 4: Backward Compatibility
   *
   * **Validates: Requirements 6.1, 6.2**
   *
   * *For any* existing code using `StringsCollection<string>`, `MasterStringsCollection<string, string>`,
   * or `EnumLanguageTranslation<T, TLanguage>`, the code SHALL continue to compile without errors
   * after the type updates.
   *
   * This property ensures that the type updates maintain full backward compatibility with
   * existing code patterns, allowing developers to upgrade without breaking changes.
   */
  describe('Property 4: Backward Compatibility', () => {
    /**
     * Traditional TypeScript enum for backward compatibility testing.
     *
     * This enum represents the pattern used in existing codebases before
     * branded enums were introduced. It is used to verify that
     * `EnumLanguageTranslation` continues to work correctly.
     */
    enum LegacyStringKeys {
      Title = 'title',
      Description = 'description',
      Submit = 'submit',
    }

    /**
     * **Validates: Requirement 6.1**
     *
     * StringsCollection<string> should continue to work and accept any string keys.
     * This test verifies that existing code using the generic string type parameter
     * continues to compile and function correctly.
     */
    it('StringsCollection<string> should continue to work with any string keys', () => {
      // Legacy pattern: using string as the type parameter
      const legacyStrings: StringsCollection<string> = {
        'any.key': 'Any value',
        'another.key': 'Another value',
        'completely.arbitrary.key': 'Arbitrary value',
      };

      expect(legacyStrings).toBeDefined();
      expect(legacyStrings['any.key']).toBe('Any value');
      expect(legacyStrings['another.key']).toBe('Another value');
      expect(legacyStrings['completely.arbitrary.key']).toBe('Arbitrary value');
    });

    /**
     * **Validates: Requirement 6.1**
     *
     * MasterStringsCollection<string, string> should continue to work.
     * This test verifies that existing code using generic string type parameters
     * for both string keys and language codes continues to compile and function correctly.
     */
    it('MasterStringsCollection<string, string> should continue to work', () => {
      // Legacy pattern: using string for both type parameters
      const legacyMaster: MasterStringsCollection<string, string> = {
        en: {
          'key.one': 'Value one',
          'key.two': 'Value two',
        },
        es: {
          'key.one': 'Valor uno',
          'key.two': 'Valor dos',
        },
        fr: {
          'key.one': 'Valeur un',
          'key.two': 'Valeur deux',
        },
      };

      expect(legacyMaster).toBeDefined();
      expect(legacyMaster['en']?.['key.one']).toBe('Value one');
      expect(legacyMaster['es']?.['key.one']).toBe('Valor uno');
      expect(legacyMaster['fr']?.['key.two']).toBe('Valeur deux');
    });

    /**
     * **Validates: Requirement 6.2**
     *
     * EnumLanguageTranslation<T, TLanguage> should continue to work with traditional enums.
     * This test verifies that existing code using EnumLanguageTranslation with
     * EnumTranslationRegistry continues to compile and function correctly.
     */
    it('EnumLanguageTranslation should continue to work with traditional enums', () => {
      // Legacy pattern: using EnumLanguageTranslation with traditional TypeScript enums
      type LegacyLanguages = 'en' | 'es' | 'fr';

      const legacyTranslations: EnumLanguageTranslation<
        LegacyStringKeys,
        LegacyLanguages
      > = {
        en: {
          [LegacyStringKeys.Title]: 'Title',
          [LegacyStringKeys.Description]: 'Description',
          [LegacyStringKeys.Submit]: 'Submit',
        },
        es: {
          [LegacyStringKeys.Title]: 'Título',
          [LegacyStringKeys.Description]: 'Descripción',
          [LegacyStringKeys.Submit]: 'Enviar',
        },
        fr: {
          [LegacyStringKeys.Title]: 'Titre',
          [LegacyStringKeys.Description]: 'Description',
          [LegacyStringKeys.Submit]: 'Soumettre',
        },
      };

      expect(legacyTranslations).toBeDefined();
      expect(legacyTranslations['en']?.[LegacyStringKeys.Title]).toBe('Title');
      expect(legacyTranslations['es']?.[LegacyStringKeys.Description]).toBe(
        'Descripción',
      );
      expect(legacyTranslations['fr']?.[LegacyStringKeys.Submit]).toBe(
        'Soumettre',
      );
    });

    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * The deprecated EnumTranslationMap type should still compile for backward compatibility.
     * Although deprecated, this type must remain functional to avoid breaking existing code.
     * The deprecation warning guides developers toward better alternatives without forcing
     * immediate migration.
     */
    it('deprecated EnumTranslationMap should still compile for backward compatibility', () => {
      // Legacy pattern: using the deprecated EnumTranslationMap type
      // Note: This type is deprecated but must remain functional
      type LegacyLanguages = 'en' | 'es';

      const deprecatedMap: EnumTranslationMap<
        LegacyStringKeys,
        LegacyLanguages
      > = {
        en: {
          [LegacyStringKeys.Title]: 'Title',
          [LegacyStringKeys.Description]: 'Description',
          [LegacyStringKeys.Submit]: 'Submit',
        },
        es: {
          [LegacyStringKeys.Title]: 'Título',
          [LegacyStringKeys.Description]: 'Descripción',
          [LegacyStringKeys.Submit]: 'Enviar',
        },
      };

      expect(deprecatedMap).toBeDefined();
      expect(deprecatedMap['en']?.[LegacyStringKeys.Title]).toBe('Title');
      expect(deprecatedMap['es']?.[LegacyStringKeys.Submit]).toBe('Enviar');
    });

    /**
     * **Validates: Requirement 6.1**
     *
     * StringsCollection with specific string literal unions should continue to work.
     * This test verifies that the common pattern of using string literal unions
     * (without branded enums) continues to function correctly.
     */
    it('StringsCollection with string literal unions should continue to work', () => {
      // Common pattern: using string literal unions for type safety
      type MyKeys = 'welcome' | 'goodbye' | 'hello';

      const typedStrings: StringsCollection<MyKeys> = {
        welcome: 'Welcome!',
        goodbye: 'Goodbye!',
        hello: 'Hello!',
      };

      expect(typedStrings).toBeDefined();
      expect(typedStrings['welcome']).toBe('Welcome!');
      expect(typedStrings['goodbye']).toBe('Goodbye!');
      expect(typedStrings['hello']).toBe('Hello!');
    });

    /**
     * **Validates: Requirement 6.1**
     *
     * MasterStringsCollection with specific type parameters should continue to work.
     * This test verifies that the common pattern of using specific string literal
     * unions for both keys and languages continues to function correctly.
     */
    it('MasterStringsCollection with specific type parameters should continue to work', () => {
      // Common pattern: using specific string literal unions
      type MyKeys = 'title' | 'content';
      type MyLangs = 'en-US' | 'de';

      const typedMaster: MasterStringsCollection<MyKeys, MyLangs> = {
        'en-US': {
          title: 'Title',
          content: 'Content',
        },
        de: {
          title: 'Titel',
          content: 'Inhalt',
        },
      };

      expect(typedMaster).toBeDefined();
      expect(typedMaster['en-US']?.['title']).toBe('Title');
      expect(typedMaster['de']?.['content']).toBe('Inhalt');
    });

    /**
     * **Validates: Requirement 6.2**
     *
     * EnumLanguageTranslation should work with numeric enums.
     * This test verifies that the type continues to support numeric enum values,
     * which is a valid use case in existing codebases.
     */
    it('EnumLanguageTranslation should work with numeric enums', () => {
      // Legacy pattern: numeric enums (less common but valid)
      enum NumericKeys {
        First = 0,
        Second = 1,
        Third = 2,
      }

      type NumericLanguages = 'en' | 'es';

      const numericTranslations: EnumLanguageTranslation<
        NumericKeys,
        NumericLanguages
      > = {
        en: {
          [NumericKeys.First]: 'First',
          [NumericKeys.Second]: 'Second',
          [NumericKeys.Third]: 'Third',
        },
        es: {
          [NumericKeys.First]: 'Primero',
          [NumericKeys.Second]: 'Segundo',
          [NumericKeys.Third]: 'Tercero',
        },
      };

      expect(numericTranslations).toBeDefined();
      expect(numericTranslations['en']?.[NumericKeys.First]).toBe('First');
      expect(numericTranslations['es']?.[NumericKeys.Third]).toBe('Tercero');
    });
  });
});
