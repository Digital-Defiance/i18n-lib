/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { escapeHtml, safeStringify } from '../../src/utils/html-escape';

describe('html-escape', () => {
  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less than', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b');
    });

    it('should escape greater than', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#x27;s');
    });

    it('should escape forward slash', () => {
      expect(escapeHtml('a/b')).toBe('a&#x2F;b');
    });

    it('should escape script tags', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;',
      );
    });

    it('should escape all dangerous chars', () => {
      expect(escapeHtml('&<>"\'/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle string without dangerous chars', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });
  });

  describe('safeStringify', () => {
    it('should stringify strings', () => {
      expect(safeStringify('test')).toBe('test');
    });

    it('should stringify numbers', () => {
      expect(safeStringify(123)).toBe('123');
      expect(safeStringify(0)).toBe('0');
      expect(safeStringify(-456)).toBe('-456');
    });

    it('should stringify booleans', () => {
      expect(safeStringify(true)).toBe('true');
      expect(safeStringify(false)).toBe('false');
    });

    it('should return empty for null', () => {
      expect(safeStringify(null)).toBe('');
    });

    it('should return empty for undefined', () => {
      expect(safeStringify(undefined)).toBe('');
    });

    it('should escape HTML when enabled', () => {
      expect(safeStringify('<script>', { escapeHtml: true })).toBe(
        '&lt;script&gt;',
      );
    });

    it('should not escape when disabled', () => {
      expect(safeStringify('<b>test</b>', { escapeHtml: false })).toBe(
        '<b>test</b>',
      );
    });

    it('should reject objects', () => {
      expect(() => safeStringify({})).toThrow(/invalid value type/i);
    });

    it('should reject arrays', () => {
      expect(() => safeStringify([])).toThrow(/invalid value type/i);
    });

    it('should reject functions', () => {
      expect(() => safeStringify(() => {})).toThrow(/invalid value type/i);
    });
  });
});
