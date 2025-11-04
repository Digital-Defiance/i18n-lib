/**
 * Comprehensive tests for string-utils
 * Tests variable replacement with CurrencyCode, Timezone, and other objects
 */

import { replaceVariables, isTemplate } from '../src/utils/string-utils';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

describe('String Utils', () => {
  describe('replaceVariables', () => {
    it('should replace simple variables', () => {
      const result = replaceVariables('Hello {name}!', { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should replace multiple variables', () => {
      const result = replaceVariables('{greeting} {name}, you have {count} messages', {
        greeting: 'Hello',
        name: 'Alice',
        count: 5,
      });
      expect(result).toBe('Hello Alice, you have 5 messages');
    });

    it('should use constants when variables not provided', () => {
      const result = replaceVariables(
        'App: {AppName}, Version: {Version}',
        {},
        { AppName: 'MyApp', Version: '1.0.0' },
      );
      expect(result).toBe('App: MyApp, Version: 1.0.0');
    });

    it('should prioritize variables over constants', () => {
      const result = replaceVariables(
        'Value: {key}',
        { key: 'from-var' },
        { key: 'from-const' },
      );
      expect(result).toBe('Value: from-var');
    });

    it('should extract value from CurrencyCode objects', () => {
      const currency = new CurrencyCode('EUR');
      const result = replaceVariables('Price in {currency}', { currency });
      expect(result).toBe('Price in EUR');
    });

    it('should extract value from Timezone objects', () => {
      const timezone = new Timezone('America/New_York');
      const result = replaceVariables('Time in {timezone}', { timezone });
      expect(result).toBe('Time in America/New_York');
    });

    it('should extract value from CurrencyCode in constants', () => {
      const result = replaceVariables(
        'Default: {currency}',
        {},
        { currency: new CurrencyCode('USD') },
      );
      expect(result).toBe('Default: USD');
    });

    it('should extract value from Timezone in constants', () => {
      const result = replaceVariables(
        'Timezone: {tz}',
        {},
        { tz: new Timezone('UTC') },
      );
      expect(result).toBe('Timezone: UTC');
    });

    it('should handle objects with value property', () => {
      const customObj = { value: 'custom-value' };
      const result = replaceVariables('Object: {obj}', { obj: customObj });
      expect(result).toBe('Object: custom-value');
    });

    it('should handle mixed CurrencyCode, Timezone, and primitives', () => {
      const currency = new CurrencyCode('GBP');
      const timezone = new Timezone('Europe/London');
      const result = replaceVariables(
        '{name} uses {currency} in {timezone}',
        { name: 'Bob', currency, timezone },
      );
      expect(result).toBe('Bob uses GBP in Europe/London');
    });

    it('should leave unmatched variables as-is', () => {
      const result = replaceVariables('Hello {name}, you have {count} messages', {
        name: 'John',
      });
      expect(result).toBe('Hello John, you have {count} messages');
    });

    it('should handle empty variables object', () => {
      const result = replaceVariables('Hello {name}!', {});
      expect(result).toBe('Hello {name}!');
    });

    it('should handle undefined variables', () => {
      const result = replaceVariables('Hello {name}!');
      expect(result).toBe('Hello {name}!');
    });

    it('should handle undefined constants', () => {
      const result = replaceVariables('Hello {name}!', { name: 'John' }, undefined);
      expect(result).toBe('Hello John!');
    });

    it('should handle string with no variables', () => {
      const result = replaceVariables('Hello World!', { name: 'John' });
      expect(result).toBe('Hello World!');
    });

    it('should handle empty string', () => {
      const result = replaceVariables('', { name: 'John' });
      expect(result).toBe('');
    });

    it('should handle numeric values', () => {
      const result = replaceVariables('Count: {count}, Price: {price}', {
        count: 42,
        price: 99.99,
      });
      expect(result).toBe('Count: 42, Price: 99.99');
    });

    it('should handle boolean values', () => {
      const result = replaceVariables('Active: {active}, Enabled: {enabled}', {
        active: true,
        enabled: false,
      });
      expect(result).toBe('Active: true, Enabled: false');
    });

    it('should handle null values', () => {
      const result = replaceVariables('Value: {value}', { value: null });
      expect(result).toBe('Value: null');
    });

    it('should handle objects without value property', () => {
      const obj = { data: 'test' };
      const result = replaceVariables('Object: {obj}', { obj });
      expect(result).toBe('Object: [object Object]');
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = replaceVariables('Array: {arr}', { arr });
      expect(result).toBe('Array: 1,2,3');
    });

    it('should handle special characters in values', () => {
      const result = replaceVariables('Path: {path}', { path: '/usr/local/bin' });
      expect(result).toBe('Path: /usr/local/bin');
    });

    it('should handle quotes in values', () => {
      const result = replaceVariables('Message: {msg}', { msg: "It's working" });
      expect(result).toBe("Message: It's working");
    });

    it('should handle multiple occurrences of same variable', () => {
      const result = replaceVariables('{name} said: "Hello {name}!"', { name: 'Alice' });
      expect(result).toBe('Alice said: "Hello Alice!"');
    });

    it('should handle nested braces', () => {
      const result = replaceVariables('Code: {{name}}', { name: 'test' });
      expect(result).toBe('Code: {{name}}');
    });

    it('should convert non-string input to string', () => {
      const result = replaceVariables(123 as any, { name: 'test' });
      expect(result).toBe('123');
    });

    it('should handle variables with underscores', () => {
      const result = replaceVariables('Value: {user_name}', { user_name: 'john_doe' });
      expect(result).toBe('Value: john_doe');
    });

    it('should handle variables with numbers', () => {
      const result = replaceVariables('Value: {var1} and {var2}', { var1: 'a', var2: 'b' });
      expect(result).toBe('Value: a and b');
    });

    it('should handle CurrencyCode with both variables and constants', () => {
      const varCurrency = new CurrencyCode('EUR');
      const constCurrency = new CurrencyCode('USD');
      const result = replaceVariables(
        'Var: {var}, Const: {const}',
        { var: varCurrency },
        { const: constCurrency },
      );
      expect(result).toBe('Var: EUR, Const: USD');
    });

    it('should handle Timezone with both variables and constants', () => {
      const varTz = new Timezone('Asia/Tokyo');
      const constTz = new Timezone('UTC');
      const result = replaceVariables(
        'Var: {var}, Const: {const}',
        { var: varTz },
        { const: constTz },
      );
      expect(result).toBe('Var: Asia/Tokyo, Const: UTC');
    });
  });

  describe('isTemplate', () => {
    it('should return true for keys ending with "template"', () => {
      expect(isTemplate('errorTemplate')).toBe(true);
    });

    it('should return true for keys ending with "Template"', () => {
      expect(isTemplate('errorTemplate')).toBe(true);
    });

    it('should return true for keys ending with "TEMPLATE"', () => {
      expect(isTemplate('errorTEMPLATE')).toBe(true);
    });

    it('should return false for keys not ending with template', () => {
      expect(isTemplate('error')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isTemplate('')).toBe(false);
    });

    it('should handle keys with spaces', () => {
      expect(isTemplate('  errorTemplate  ')).toBe(true);
    });

    it('should return false for keys containing but not ending with template', () => {
      expect(isTemplate('templateError')).toBe(false);
    });

    it('should return true for just "template"', () => {
      expect(isTemplate('template')).toBe(true);
    });

    it('should return true for just "Template"', () => {
      expect(isTemplate('Template')).toBe(true);
    });
  });
});
