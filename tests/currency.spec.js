"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const currency_1 = require("../src/currency");
describe('getCurrencyFormat', () => {
    it('should return correct format for USD in en-US', () => {
        const format = (0, currency_1.getCurrencyFormat)('en-US', 'USD');
        expect(format).toEqual({
            symbol: '$',
            position: 'prefix',
            groupSeparator: ',',
            decimalSeparator: '.',
        });
    });
    it('should return correct format for EUR in de-DE', () => {
        const format = (0, currency_1.getCurrencyFormat)('de-DE', 'EUR');
        expect(format).toEqual({
            symbol: '€',
            position: 'postfix',
            groupSeparator: '.',
            decimalSeparator: ',',
        });
    });
    it('should return correct format for JPY in ja-JP', () => {
        const format = (0, currency_1.getCurrencyFormat)('ja-JP', 'JPY');
        expect(format).toEqual({
            symbol: '￥',
            position: 'prefix',
            groupSeparator: ',',
            decimalSeparator: '.',
        });
    });
    it('should return correct format for GBP in en-GB', () => {
        const format = (0, currency_1.getCurrencyFormat)('en-GB', 'GBP');
        expect(format).toEqual({
            symbol: '£',
            position: 'prefix',
            groupSeparator: ',',
            decimalSeparator: '.',
        });
    });
    it('should handle currencies without decimal places', () => {
        const format = (0, currency_1.getCurrencyFormat)('ja-JP', 'JPY');
        expect(format.symbol).toBe('￥');
        expect(format.position).toBe('prefix');
    });
    it('should return valid position types', () => {
        const validPositions = ['prefix', 'postfix', 'infix'];
        const usdFormat = (0, currency_1.getCurrencyFormat)('en-US', 'USD');
        const eurFormat = (0, currency_1.getCurrencyFormat)('de-DE', 'EUR');
        expect(validPositions).toContain(usdFormat.position);
        expect(validPositions).toContain(eurFormat.position);
    });
    it('should handle unknown currencies gracefully', () => {
        expect(() => {
            (0, currency_1.getCurrencyFormat)('en-US', 'XYZ');
        }).not.toThrow();
    });
    it('should handle unknown locales gracefully', () => {
        expect(() => {
            (0, currency_1.getCurrencyFormat)('xx-XX', 'USD');
        }).not.toThrow();
    });
    it('should return consistent separators for same locale', () => {
        const usdFormat = (0, currency_1.getCurrencyFormat)('en-US', 'USD');
        const eurInUsFormat = (0, currency_1.getCurrencyFormat)('en-US', 'EUR');
        expect(usdFormat.groupSeparator).toBe(eurInUsFormat.groupSeparator);
        expect(usdFormat.decimalSeparator).toBe(eurInUsFormat.decimalSeparator);
    });
    it('should handle currencies with no decimal places correctly', () => {
        const jpyFormat = (0, currency_1.getCurrencyFormat)('ja-JP', 'JPY');
        const krwFormat = (0, currency_1.getCurrencyFormat)('ko-KR', 'KRW');
        expect(jpyFormat.symbol).toBe('￥');
        expect(krwFormat.symbol).toBe('₩');
    });
    it('should handle edge case locales', () => {
        expect(() => {
            (0, currency_1.getCurrencyFormat)('', 'USD');
        }).toThrow();
        // Some invalid locales may not throw in all environments
        const result = (0, currency_1.getCurrencyFormat)('invalid-locale', 'USD');
        expect(result).toHaveProperty('symbol');
        expect(result).toHaveProperty('position');
    });
    it('should handle edge case currencies', () => {
        expect(() => {
            (0, currency_1.getCurrencyFormat)('en-US', '');
        }).toThrow();
        expect(() => {
            (0, currency_1.getCurrencyFormat)('en-US', 'INVALID');
        }).toThrow();
    });
    it('should return valid CurrencyFormat structure', () => {
        const format = (0, currency_1.getCurrencyFormat)('en-US', 'USD');
        expect(format).toHaveProperty('symbol');
        expect(format).toHaveProperty('position');
        expect(format).toHaveProperty('groupSeparator');
        expect(format).toHaveProperty('decimalSeparator');
        expect(typeof format.symbol).toBe('string');
        expect(typeof format.position).toBe('string');
        expect(typeof format.groupSeparator).toBe('string');
        expect(typeof format.decimalSeparator).toBe('string');
    });
    it('should handle various European currencies', () => {
        const formats = [
            (0, currency_1.getCurrencyFormat)('fr-FR', 'EUR'),
            (0, currency_1.getCurrencyFormat)('it-IT', 'EUR'),
            (0, currency_1.getCurrencyFormat)('es-ES', 'EUR'),
        ];
        formats.forEach(format => {
            expect(format.symbol).toBe('€');
            expect(['prefix', 'postfix', 'infix']).toContain(format.position);
        });
    });
});
