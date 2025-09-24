"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../src/types");
var TestStatus;
(function (TestStatus) {
    TestStatus["Active"] = "active";
    TestStatus["Inactive"] = "inactive";
    TestStatus["Pending"] = "pending";
})(TestStatus || (TestStatus = {}));
var NumericEnum;
(function (NumericEnum) {
    NumericEnum[NumericEnum["First"] = 1] = "First";
    NumericEnum[NumericEnum["Second"] = 2] = "Second";
    NumericEnum[NumericEnum["Third"] = 3] = "Third";
})(NumericEnum || (NumericEnum = {}));
var TestLanguages;
(function (TestLanguages) {
    TestLanguages["English"] = "English";
    TestLanguages["Spanish"] = "Spanish";
    TestLanguages["French"] = "French";
})(TestLanguages || (TestLanguages = {}));
describe('types utilities', () => {
    describe('createTranslations', () => {
        it('should create translations for string enum', () => {
            const translations = {
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
            const result = (0, types_1.createTranslations)(translations);
            expect(result).toEqual(translations);
            expect(result[TestLanguages.English]?.[TestStatus.Active]).toBe('Active');
            expect(result[TestLanguages.Spanish]?.[TestStatus.Active]).toBe('Activo');
        });
        it('should create translations for numeric enum', () => {
            const translations = {
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
            const result = (0, types_1.createTranslations)(translations);
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
            const result = (0, types_1.createTranslations)(partialTranslations);
            expect(result).toEqual(partialTranslations);
            expect(result[TestLanguages.English]?.[TestStatus.Active]).toBe('Active');
            expect(result[TestLanguages.English]?.[TestStatus.Inactive]).toBeUndefined();
        });
        it('should handle empty translations', () => {
            const emptyTranslations = {
                [TestLanguages.English]: {},
            };
            const result = (0, types_1.createTranslations)(emptyTranslations);
            expect(result).toEqual(emptyTranslations);
            expect(Object.keys(result[TestLanguages.English] || {})).toHaveLength(0);
        });
        it('should preserve type safety', () => {
            const translations = {
                [TestLanguages.English]: {
                    [TestStatus.Active]: 'Active',
                    [TestStatus.Inactive]: 'Inactive',
                    [TestStatus.Pending]: 'Pending',
                },
            };
            const result = (0, types_1.createTranslations)(translations);
            // Type checking - these should compile without errors
            const activeTranslation = result[TestLanguages.English]?.[TestStatus.Active];
            const englishTranslations = result[TestLanguages.English];
            expect(activeTranslation).toBe('Active');
            expect(englishTranslations?.[TestStatus.Active]).toBe('Active');
        });
        it('should handle mixed enum value types', () => {
            // Test with enum that has both string and numeric-like values
            let MixedEnum;
            (function (MixedEnum) {
                MixedEnum["StringValue"] = "string_value";
                MixedEnum["NumericValue"] = "numeric_value";
            })(MixedEnum || (MixedEnum = {}));
            const translations = {
                [TestLanguages.English]: {
                    [MixedEnum.StringValue]: 'String Value',
                    [MixedEnum.NumericValue]: 'Numeric Value',
                },
            };
            const result = (0, types_1.createTranslations)(translations);
            expect(result[TestLanguages.English]?.[MixedEnum.StringValue]).toBe('String Value');
            expect(result[TestLanguages.English]?.[MixedEnum.NumericValue]).toBe('Numeric Value');
        });
    });
    describe('type definitions', () => {
        it('should support EnumTranslation type', () => {
            const statusTranslations = {
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
            expect(partialTranslations[TestStatus.Inactive]).toBeUndefined();
        });
        it('should support numeric enum translations', () => {
            const numericTranslations = {
                [NumericEnum.First]: 'First',
                [NumericEnum.Second]: 'Second',
                [NumericEnum.Third]: 'Third',
            };
            expect(numericTranslations[NumericEnum.First]).toBe('First');
            expect(numericTranslations[1]).toBe('First'); // Should work with numeric access too
        });
        it('should support custom language types', () => {
            const customTranslations = {
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
            const result = (0, types_1.createTranslations)(customTranslations);
            expect(result.German?.[TestStatus.Active]).toBe('Aktiv');
            expect(result.Italian?.[TestStatus.Active]).toBe('Attivo');
        });
    });
});
