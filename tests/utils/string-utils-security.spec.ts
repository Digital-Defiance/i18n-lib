/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { replaceVariables } from '../../src/utils/string-utils';

describe('string-utils - Security', () => {
  describe('replaceVariables', () => {
    it('should replace simple variables', () => {
      const result = replaceVariables('Hello {name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should use constants', () => {
      const result = replaceVariables('Hello {name}', {}, { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should prefer variables over constants', () => {
      const result = replaceVariables(
        'Hello {name}',
        { name: 'Var' },
        { name: 'Const' },
      );
      expect(result).toBe('Hello Var');
    });

    it('should escape HTML when enabled', () => {
      const result = replaceVariables(
        'Hello {name}',
        { name: '<script>alert(1)</script>' },
        undefined,
        { escapeHtml: true },
      );
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should not escape when disabled', () => {
      const result = replaceVariables(
        'Hello {name}',
        { name: '<b>World</b>' },
        undefined,
        { escapeHtml: false },
      );
      expect(result).toBe('Hello <b>World</b>');
    });

    it('should handle missing variables', () => {
      const result = replaceVariables('Hello {name}', {});
      expect(result).toBe('Hello {name}');
    });

    it('should handle multiple variables', () => {
      const result = replaceVariables('{greeting} {name}!', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello World!');
    });

    it('should handle numbers', () => {
      const result = replaceVariables('Count: {count}', { count: 42 });
      expect(result).toBe('Count: 42');
    });

    it('should handle booleans', () => {
      const result = replaceVariables('Active: {active}', { active: true });
      expect(result).toBe('Active: true');
    });

    it('should reject objects', () => {
      expect(() => {
        replaceVariables('Value: {obj}', { obj: {} });
      }).toThrow(/invalid value type/i);
    });

    it('should handle wrapper objects', () => {
      const wrapper = { value: 'wrapped' };
      const result = replaceVariables('Test: {val}', { val: wrapper });
      expect(result).toBe('Test: wrapped');
    });
  });
});
