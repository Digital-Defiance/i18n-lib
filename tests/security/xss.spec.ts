/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { escapeHtml, safeStringify } from '../../src/utils/html-escape';
import { replaceVariables } from '../../src/utils/string-utils';

describe('Security: XSS Prevention', () => {
  describe('escapeHtml', () => {
    it('should escape < and >', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should escape ampersand', () => {
      expect(escapeHtml('&test')).toBe('&amp;test');
    });

    it('should escape forward slash', () => {
      expect(escapeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
    });

    it('should escape all dangerous characters', () => {
      expect(escapeHtml('&<>"\'/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });
  });

  describe('safeStringify', () => {
    it('should stringify primitives', () => {
      expect(safeStringify('test')).toBe('test');
      expect(safeStringify(123)).toBe('123');
      expect(safeStringify(true)).toBe('true');
    });

    it('should escape HTML when option enabled', () => {
      expect(safeStringify('<script>', { escapeHtml: true })).toBe(
        '&lt;script&gt;',
      );
    });

    it('should return empty string for null/undefined', () => {
      expect(safeStringify(null)).toBe('');
      expect(safeStringify(undefined)).toBe('');
    });

    it('should reject objects', () => {
      expect(() => safeStringify({})).toThrow(/invalid value type/i);
      expect(() => safeStringify([])).toThrow(/invalid value type/i);
    });
  });

  describe('replaceVariables with XSS protection', () => {
    it('should escape HTML in variables when enabled', () => {
      const result = replaceVariables(
        'Hello {name}',
        { name: '<script>alert(1)</script>' },
        undefined,
        { escapeHtml: true },
      );
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should not escape when option disabled', () => {
      const result = replaceVariables(
        'Hello {name}',
        { name: '<b>test</b>' },
        undefined,
        { escapeHtml: false },
      );
      expect(result).toBe('Hello <b>test</b>');
    });
  });
});
