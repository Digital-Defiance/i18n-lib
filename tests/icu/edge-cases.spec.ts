import { formatICUMessage } from '../../src/icu/helpers';

describe('ICU Edge Cases', () => {
  describe('Extreme nesting', () => {
    it('should handle 4-level nesting', () => {
      const msg = '{a, select, x {{b, select, y {{c, plural, one {{d, select, m {deep} other {text}}} other {text}}} other {text}}} other {text}}';
      const result = formatICUMessage(msg, { a: 'x', b: 'y', c: 1, d: 'm' });
      expect(result).toBe('deep');
    });
  });

  describe('Empty and whitespace', () => {
    it('should handle empty cases', () => {
      const msg = '{x, select, a {} other {text}}';
      expect(formatICUMessage(msg, { x: 'a' })).toBe('');
    });

    it('should preserve whitespace in literals', () => {
      const msg = '  {x}  ';
      expect(formatICUMessage(msg, { x: 'test' })).toBe('  test  ');
    });
  });

  describe('Special characters', () => {
    it('should handle quotes', () => {
      const msg = "He said {name}";
      expect(formatICUMessage(msg, { name: 'hello' })).toContain('hello');
    });

    it('should handle newlines', () => {
      const msg = 'Line1\nLine2 {x}';
      expect(formatICUMessage(msg, { x: 'test' })).toContain('\n');
    });

    it('should handle unicode', () => {
      const msg = '🎉 {name} 🎊';
      expect(formatICUMessage(msg, { name: 'party' })).toBe('🎉 party 🎊');
    });
  });

  describe('Number edge cases', () => {
    it('should handle zero', () => {
      const msg = '{n, plural, one {#} other {#}}';
      expect(formatICUMessage(msg, { n: 0 })).toBe('0');
    });

    it('should handle negative', () => {
      const msg = '{n, number}';
      expect(formatICUMessage(msg, { n: -123 }, 'en-US')).toBe('-123');
    });

    it('should handle large numbers', () => {
      const msg = '{n, number}';
      const result = formatICUMessage(msg, { n: 1000000 }, 'en-US');
      expect(result).toContain('1');
    });

    it('should handle decimals', () => {
      const msg = '{n, number}';
      expect(formatICUMessage(msg, { n: 0.123 }, 'en-US')).toContain('0.123');
    });
  });

  describe('Missing values', () => {
    it('should show placeholder for missing simple arg', () => {
      const msg = 'Hello {name}';
      expect(formatICUMessage(msg, {})).toBe('Hello {name}');
    });

    it('should handle missing plural value', () => {
      const msg = '{n, plural, one {#} other {#}}';
      expect(formatICUMessage(msg, {})).toBe('#');
    });
  });

  describe('Multiple # in plural', () => {
    it('should replace all # occurrences', () => {
      const msg = '{n, plural, one {# item (#)} other {# items (#)}}';
      expect(formatICUMessage(msg, { n: 5 })).toBe('5 items (5)');
    });
  });
});
