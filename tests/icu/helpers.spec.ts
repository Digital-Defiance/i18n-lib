import { isICUMessage, parseICUMessage, compileICUMessage, formatICUMessage, validateICUMessage } from '../../src/icu/helpers';
import { ValidationError } from '../../src/icu/validator';

describe('ICU Helpers', () => {
  describe('isICUMessage', () => {
    it('should detect ICU message', () => {
      expect(isICUMessage('Hello {name}')).toBe(true);
    });

    it('should detect plural', () => {
      expect(isICUMessage('{count, plural, one {#} other {#}}')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(isICUMessage('Hello world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isICUMessage('')).toBe(false);
    });
  });

  describe('parseICUMessage', () => {
    it('should parse message', () => {
      const ast = parseICUMessage('Hello {name}');
      expect(ast.elements).toHaveLength(2);
    });
  });

  describe('compileICUMessage', () => {
    it('should compile message', () => {
      const fn = compileICUMessage('Hello {name}');
      expect(fn({ name: 'Alice' }, { locale: 'en-US' })).toBe('Hello Alice');
    });
  });

  describe('formatICUMessage', () => {
    it('should format simple message', () => {
      expect(formatICUMessage('Hello {name}', { name: 'Alice' })).toBe('Hello Alice');
    });

    it('should format plural', () => {
      expect(formatICUMessage('{count, plural, one {# item} other {# items}}', { count: 1 })).toBe('1 item');
    });

    it('should use custom locale', () => {
      const result = formatICUMessage('{count, number}', { count: 1234 }, 'en-US');
      expect(result).toBe('1,234');
    });
  });

  describe('validateICUMessage', () => {
    it('should validate valid message', () => {
      expect(() => validateICUMessage('Hello {name}')).not.toThrow();
    });

    it('should throw on invalid message', () => {
      expect(() => validateICUMessage('{count, plural, one {#}}')).toThrow(ValidationError);
    });

    it('should accept validation options', () => {
      expect(() => validateICUMessage('{count, plural, one {#}}', { requireOtherCase: false })).not.toThrow();
    });
  });
});
