"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
describe('utils', () => {
    describe('replaceVariables', () => {
        it('should replace variables', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!', { name: 'John' });
            expect(result).toBe('Hello John!');
        });
        it('should replace constants', () => {
            const result = (0, utils_1.replaceVariables)('Welcome to {SITE}!', undefined, {
                SITE: 'MyApp',
            });
            expect(result).toBe('Welcome to MyApp!');
        });
        it('should leave unreplaced variables', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!', {});
            expect(result).toBe('Hello {name}!');
        });
        it('should handle multiple variables', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}, you have {count} messages', { name: 'John', count: 5 });
            expect(result).toBe('Hello John, you have 5 messages');
        });
        it('should handle mixed variables and constants', () => {
            const result = (0, utils_1.replaceVariables)('User {name} on {SITE}', { name: 'John' }, { SITE: 'MyApp' });
            expect(result).toBe('User John on MyApp');
        });
    });
    describe('isTemplate', () => {
        it('should identify templates', () => {
            expect((0, utils_1.isTemplate)('userGreetingTemplate')).toBe(true);
            expect((0, utils_1.isTemplate)('GREETING_TEMPLATE')).toBe(true);
            expect((0, utils_1.isTemplate)('simple')).toBe(false);
        });
        it('should handle case variations', () => {
            expect((0, utils_1.isTemplate)('Template')).toBe(true);
            expect((0, utils_1.isTemplate)('template')).toBe(true);
            expect((0, utils_1.isTemplate)('TEMPLATE')).toBe(true);
            expect((0, utils_1.isTemplate)('myTemplate')).toBe(true);
            expect((0, utils_1.isTemplate)('MyTEMPLATE')).toBe(true);
        });
        it('should handle edge cases', () => {
            expect((0, utils_1.isTemplate)('')).toBe(false);
            expect((0, utils_1.isTemplate)('templateX')).toBe(false);
            expect((0, utils_1.isTemplate)('Xtemplate')).toBe(true);
            expect((0, utils_1.isTemplate)('template_suffix')).toBe(false);
        });
    });
    describe('replaceVariables edge cases', () => {
        it('should handle empty string', () => {
            const result = (0, utils_1.replaceVariables)('', { name: 'John' });
            expect(result).toBe('');
        });
        it('should handle string without variables', () => {
            const result = (0, utils_1.replaceVariables)('Hello World', { name: 'John' });
            expect(result).toBe('Hello World');
        });
        it('should handle undefined variables and constants', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!');
            expect(result).toBe('Hello {name}!');
        });
        it('should handle empty variables object', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!', {});
            expect(result).toBe('Hello {name}!');
        });
        it('should handle null and undefined values', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!', { name: null });
            expect(result).toBe('Hello null!');
        });
        it('should handle numeric values', () => {
            const result = (0, utils_1.replaceVariables)('You have {count} items', { count: 0 });
            expect(result).toBe('You have 0 items');
        });
        it('should handle boolean values', () => {
            const result = (0, utils_1.replaceVariables)('Status: {active}', { active: true });
            expect(result).toBe('Status: true');
        });
        it('should prioritize variables over constants', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}!', { name: 'John' }, { name: 'Jane' });
            expect(result).toBe('Hello John!');
        });
        it('should handle malformed variable syntax', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name} and {incomplete', { name: 'John' });
            expect(result).toBe('Hello John and {incomplete');
        });
        it('should handle nested braces', () => {
            const result = (0, utils_1.replaceVariables)('Hello {{name}}!', { name: 'John' });
            expect(result).toBe('Hello {{name}}!'); // Nested braces are not replaced
        });
        it('should handle special characters in variable names', () => {
            const result = (0, utils_1.replaceVariables)('Hello {user_name}!', { user_name: 'John' });
            expect(result).toBe('Hello John!');
        });
        it('should handle multiple occurrences of same variable', () => {
            const result = (0, utils_1.replaceVariables)('Hello {name}, goodbye {name}!', { name: 'John' });
            expect(result).toBe('Hello John, goodbye John!');
        });
        it('should handle complex constants object', () => {
            const constants = {
                SITE: 'MyApp',
                VERSION: '1.0.0',
                nested: { value: 'test' }
            };
            const result = (0, utils_1.replaceVariables)('Welcome to {SITE} v{VERSION}', undefined, constants);
            expect(result).toBe('Welcome to MyApp v1.0.0');
        });
    });
});
