import { parse, ParseError } from '../../src/icu/parser';

describe('ICU Parser - Security', () => {
  describe('input length validation', () => {
    it('should accept normal input', () => {
      expect(() => parse('Hello {name}')).not.toThrow();
    });

    it('should accept max length', () => {
      const max = 'a'.repeat(10000);
      expect(() => parse(max)).not.toThrow();
    });

    it('should reject over max length', () => {
      const tooLong = 'a'.repeat(10001);
      expect(() => parse(tooLong)).toThrow(/maximum length/i);
    });
  });

  describe('depth tracking', () => {
    it('should track depth correctly', () => {
      const nested = '{a, select, x {{b, select, y {text}}}}';
      expect(() => parse(nested)).not.toThrow();
    });

    it('should allow reasonable depth', () => {
      const depth5 = '{a, select, x {{b, select, y {{c, select, z {{d, select, w {{e, select, v {text}}}}}}}}}}';
      expect(() => parse(depth5)).not.toThrow();
    });

    it('should reject excessive depth', () => {
      const tooDeep = '{a, select, x {'.repeat(15) + 'text' + '}}'.repeat(15);
      expect(() => parse(tooDeep)).toThrow(/depth/i);
    });

    it('should decrement depth on exit', () => {
      const msg = '{a, select, x {text}}';
      const ast = parse(msg);
      expect(ast).toBeDefined();
      
      // Should be able to parse again (depth reset)
      expect(() => parse(msg)).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should include position in errors', () => {
      try {
        parse('{name');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ParseError);
        expect((e as ParseError).position).toBeDefined();
      }
    });

    it('should handle malformed input gracefully', () => {
      expect(() => parse('{}')).toThrow(ParseError);
      expect(() => parse('{name, }')).toThrow(ParseError);
    });
  });
});
