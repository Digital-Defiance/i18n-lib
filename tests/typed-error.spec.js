"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_config_1 = require("../src/default-config");
const typed_error_1 = require("../src/typed-error");
const i18n_engine_1 = require("../src/i18n-engine");
var TestErrorType;
(function (TestErrorType) {
    TestErrorType["Simple"] = "simple";
    TestErrorType["Templated"] = "templated";
    TestErrorType["Missing"] = "missing";
})(TestErrorType || (TestErrorType = {}));
const testReasonMap = {
    [TestErrorType.Simple]: default_config_1.DefaultStringKey.Common_Test,
    [TestErrorType.Templated]: default_config_1.DefaultStringKey.Error_MissingTranslationTemplate,
};
class TestError extends typed_error_1.TypedError {
    constructor(type, language, otherVars) {
        const engine = (0, default_config_1.getDefaultI18nEngine)({}, undefined, undefined);
        super(engine, type, testReasonMap, language, otherVars);
    }
}
describe('TypedError', () => {
    beforeEach(() => {
        // Clear singleton instances before each test
        i18n_engine_1.I18nEngine._instances.clear();
    });
    it('should create error with simple translation', () => {
        const error = new TestError(TestErrorType.Simple);
        expect(error.message).toBe('Test');
        expect(error.type).toBe(TestErrorType.Simple);
        expect(error.name).toBe('TestError');
    });
    it('should create error with templated translation', () => {
        const error = new TestError(TestErrorType.Templated, default_config_1.DefaultLanguage.EnglishUS, {
            key: 'testKey',
            language: 'English'
        });
        expect(error.message).toBe("Missing translation for key 'testKey' in language 'English'");
    });
    it('should create error in different language', () => {
        const error = new TestError(TestErrorType.Simple, default_config_1.DefaultLanguage.French);
        expect(error.message).toBe('Test');
    });
    it('should create templated error in different language', () => {
        const error = new TestError(TestErrorType.Templated, default_config_1.DefaultLanguage.French, {
            key: 'testKey',
            language: 'Français'
        });
        expect(error.message).toBe("Traduction manquante pour la clé 'testKey' dans la langue 'Français'");
    });
    it('should throw localized error when translation key is missing', () => {
        expect(() => new TestError(TestErrorType.Missing)).toThrow('Missing translation key for type: missing');
    });
    it('should throw localized error in different language when translation key is missing', () => {
        expect(() => new TestError(TestErrorType.Missing, default_config_1.DefaultLanguage.French)).toThrow('Clé de traduction manquante pour le type: missing');
    });
});
