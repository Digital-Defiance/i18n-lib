"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../src/context");
const timezone_1 = require("../src/timezone");
var TestLanguages;
(function (TestLanguages) {
    TestLanguages["English"] = "English";
    TestLanguages["Spanish"] = "Spanish";
    TestLanguages["French"] = "French";
})(TestLanguages || (TestLanguages = {}));
describe('context utilities', () => {
    describe('createContext', () => {
        it('should create a context with default values', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            expect(context).toEqual({
                language: TestLanguages.English,
                adminLanguage: TestLanguages.English,
                currentContext: 'admin',
                timezone: expect.objectContaining({ _timezone: 'UTC' }),
                adminTimezone: expect.objectContaining({ _timezone: 'UTC' }),
            });
        });
        it('should create context with different language and context', () => {
            const context = (0, context_1.createContext)(TestLanguages.Spanish, 'user');
            expect(context).toEqual({
                language: TestLanguages.Spanish,
                adminLanguage: TestLanguages.Spanish,
                currentContext: 'user',
                timezone: expect.objectContaining({ _timezone: 'UTC' }),
                adminTimezone: expect.objectContaining({ _timezone: 'UTC' }),
            });
        });
    });
    describe('setLanguage', () => {
        it('should update the language property', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setLanguage)(context, TestLanguages.Spanish);
            expect(context.language).toBe(TestLanguages.Spanish);
            expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
        });
        it('should work with different language types', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setLanguage)(context, TestLanguages.French);
            expect(context.language).toBe(TestLanguages.French);
        });
    });
    describe('setAdminLanguage', () => {
        it('should update the adminLanguage property', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setAdminLanguage)(context, TestLanguages.Spanish);
            expect(context.adminLanguage).toBe(TestLanguages.Spanish);
            expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
        });
        it('should work independently of regular language', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setLanguage)(context, TestLanguages.French);
            (0, context_1.setAdminLanguage)(context, TestLanguages.Spanish);
            expect(context.language).toBe(TestLanguages.French);
            expect(context.adminLanguage).toBe(TestLanguages.Spanish);
        });
    });
    describe('setContext', () => {
        it('should update the currentContext property', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setContext)(context, 'user');
            expect(context.currentContext).toBe('user');
            expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
            expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
        });
        it('should work with custom context types', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            (0, context_1.setContext)(context, 'guest');
            expect(context.currentContext).toBe('guest');
        });
    });
    describe('setTimezone', () => {
        it('should update the timezone property', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const newTimezone = new timezone_1.Timezone('America/New_York');
            (0, context_1.setTimezone)(context, newTimezone);
            expect(context.timezone).toBe(newTimezone);
            expect(context.adminTimezone).toEqual(expect.objectContaining({ _timezone: 'UTC' })); // Should remain unchanged
        });
        it('should work with different timezone values', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const europeTimezone = new timezone_1.Timezone('Europe/London');
            (0, context_1.setTimezone)(context, europeTimezone);
            expect(context.timezone).toBe(europeTimezone);
        });
    });
    describe('setAdminTimezone', () => {
        it('should update the adminTimezone property', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const newAdminTimezone = new timezone_1.Timezone('Asia/Tokyo');
            (0, context_1.setAdminTimezone)(context, newAdminTimezone);
            expect(context.adminTimezone).toBe(newAdminTimezone);
            expect(context.timezone).toEqual(expect.objectContaining({ _timezone: 'UTC' })); // Should remain unchanged
        });
        it('should work independently of regular timezone', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const userTimezone = new timezone_1.Timezone('America/Los_Angeles');
            const adminTimezone = new timezone_1.Timezone('Europe/Paris');
            (0, context_1.setTimezone)(context, userTimezone);
            (0, context_1.setAdminTimezone)(context, adminTimezone);
            expect(context.timezone).toBe(userTimezone);
            expect(context.adminTimezone).toBe(adminTimezone);
        });
    });
    describe('integration', () => {
        it('should allow chaining all context modifications', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const userTimezone = new timezone_1.Timezone('America/Chicago');
            const adminTimezone = new timezone_1.Timezone('Europe/Berlin');
            (0, context_1.setLanguage)(context, TestLanguages.Spanish);
            (0, context_1.setAdminLanguage)(context, TestLanguages.French);
            (0, context_1.setContext)(context, 'user');
            (0, context_1.setTimezone)(context, userTimezone);
            (0, context_1.setAdminTimezone)(context, adminTimezone);
            expect(context).toEqual({
                language: TestLanguages.Spanish,
                adminLanguage: TestLanguages.French,
                currentContext: 'user',
                timezone: userTimezone,
                adminTimezone: adminTimezone,
            });
        });
        it('should maintain object reference', () => {
            const context = (0, context_1.createContext)(TestLanguages.English, 'admin');
            const originalRef = context;
            (0, context_1.setLanguage)(context, TestLanguages.Spanish);
            (0, context_1.setAdminLanguage)(context, TestLanguages.French);
            (0, context_1.setContext)(context, 'user');
            (0, context_1.setTimezone)(context, new timezone_1.Timezone('Pacific/Auckland'));
            (0, context_1.setAdminTimezone)(context, new timezone_1.Timezone('Atlantic/Azores'));
            expect(context).toBe(originalRef);
        });
    });
});
