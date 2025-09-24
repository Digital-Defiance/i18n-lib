"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_registry_1 = require("../src/enum-registry");
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
describe('EnumTranslationRegistry', () => {
    let registry;
    beforeEach(() => {
        registry = new enum_registry_1.EnumTranslationRegistry();
    });
    describe('register', () => {
        it('should register enum translations', () => {
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
            expect(() => {
                registry.register(TestStatus, translations, 'TestStatus');
            }).not.toThrow();
            expect(registry.has(TestStatus)).toBe(true);
        });
        it('should register numeric enum translations', () => {
            const translations = {
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
                registry.register(NumericEnum, translations, 'NumericEnum');
            }).not.toThrow();
            expect(registry.has(NumericEnum)).toBe(true);
        });
    });
    describe('translate', () => {
        beforeEach(() => {
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
            registry.register(TestStatus, translations, 'TestStatus');
        });
        it('should translate enum values', () => {
            const result = registry.translate(TestStatus, TestStatus.Active, TestLanguages.English);
            expect(result).toBe('Active');
        });
        it('should translate to different languages', () => {
            const englishResult = registry.translate(TestStatus, TestStatus.Active, TestLanguages.English);
            const spanishResult = registry.translate(TestStatus, TestStatus.Active, TestLanguages.Spanish);
            expect(englishResult).toBe('Active');
            expect(spanishResult).toBe('Activo');
        });
        it('should translate all enum values', () => {
            expect(registry.translate(TestStatus, TestStatus.Active, TestLanguages.English)).toBe('Active');
            expect(registry.translate(TestStatus, TestStatus.Inactive, TestLanguages.English)).toBe('Inactive');
            expect(registry.translate(TestStatus, TestStatus.Pending, TestLanguages.English)).toBe('Pending');
        });
        it('should handle numeric enums', () => {
            const numericTranslations = {
                [TestLanguages.English]: {
                    [NumericEnum.First]: 'First',
                    [NumericEnum.Second]: 'Second',
                    [NumericEnum.Third]: 'Third',
                },
            };
            registry.register(NumericEnum, numericTranslations, 'NumericEnum');
            const result = registry.translate(NumericEnum, NumericEnum.First, TestLanguages.English);
            expect(result).toBe('First');
        });
        it('should handle numeric enum values by finding string keys', () => {
            const numericTranslations = {
                [TestLanguages.English]: {
                    'First': 'First Item',
                    'Second': 'Second Item',
                    'Third': 'Third Item',
                },
            };
            const enumRef = NumericEnum;
            registry.register(enumRef, numericTranslations, 'NumericEnum');
            // Test with the actual numeric value - the registry should find the string key 'First' for value 1
            const result = registry.translate(enumRef, 1, TestLanguages.English);
            expect(result).toBe('First Item');
        });
        it('should throw error for unregistered enum', () => {
            const unregisteredEnum = { Test: 'test' };
            expect(() => {
                registry.translate(unregisteredEnum, 'test', TestLanguages.English);
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
            registry.register(TestStatus, incompleteTranslations, 'IncompleteStatus');
            expect(() => {
                registry.translate(TestStatus, TestStatus.Inactive, TestLanguages.English);
            }).toThrow('No translation found for value: inactive');
        });
        it('should use enum name in error messages', () => {
            const customEnum = { Custom: 'custom' };
            registry.register(customEnum, {
                [TestLanguages.English]: { Custom: 'Custom Value' }
            }, 'CustomEnum');
            expect(() => {
                registry.translate(customEnum, 'nonexistent', TestLanguages.English);
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
            registry.register(TestStatus, translations, 'TestStatus');
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
            registry.register(TestStatus, translations1, 'TestStatus');
            registry.register(NumericEnum, translations2, 'NumericEnum');
            expect(registry.has(TestStatus)).toBe(true);
            expect(registry.has(NumericEnum)).toBe(true);
        });
    });
    describe('edge cases', () => {
        it('should handle empty translations', () => {
            const emptyTranslations = {
                [TestLanguages.English]: {},
            };
            expect(() => {
                registry.register(TestStatus, emptyTranslations, 'EmptyStatus');
            }).not.toThrow();
            expect(() => {
                registry.translate(TestStatus, TestStatus.Active, TestLanguages.English);
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
            registry.register(TestStatus, partialTranslations, 'PartialStatus');
            expect(registry.translate(TestStatus, TestStatus.Active, TestLanguages.English)).toBe('Active');
            expect(() => {
                registry.translate(TestStatus, TestStatus.Active, TestLanguages.Spanish);
            }).toThrow('No translations found for language: Spanish');
        });
    });
});
