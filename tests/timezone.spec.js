"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timezone_1 = require("../src/timezone");
describe('Timezone', () => {
    it('should create timezone with valid timezone string', () => {
        const timezone = new timezone_1.Timezone('America/New_York');
        expect(timezone.value).toBe('America/New_York');
    });
    it('should create timezone with UTC', () => {
        const timezone = new timezone_1.Timezone('UTC');
        expect(timezone.value).toBe('UTC');
    });
    it('should throw error for invalid timezone', () => {
        expect(() => new timezone_1.Timezone('Invalid/Timezone')).toThrow('Invalid timezone: Invalid/Timezone');
    });
    it('should throw error for empty string', () => {
        expect(() => new timezone_1.Timezone('')).toThrow('Invalid timezone: ');
    });
    it('should throw error for non-existent timezone', () => {
        expect(() => new timezone_1.Timezone('NotATimezone')).toThrow('Invalid timezone: NotATimezone');
    });
});
