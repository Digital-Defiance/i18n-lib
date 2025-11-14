import { parse } from '../../src/icu/parser';
import { Compiler } from '../../src/icu/compiler';

describe('Compiler', () => {
  let compiler: Compiler;

  beforeEach(() => {
    compiler = new Compiler();
  });

  describe('Literals', () => {
    it('should compile plain text', () => {
      const ast = parse('Hello world');
      const fn = compiler.compile(ast);
      expect(fn({}, { locale: 'en-US' })).toBe('Hello world');
    });

    it('should compile empty string', () => {
      const ast = parse('');
      const fn = compiler.compile(ast);
      expect(fn({}, { locale: 'en-US' })).toBe('');
    });
  });

  describe('Arguments', () => {
    it('should substitute simple argument', () => {
      const ast = parse('Hello {name}');
      const fn = compiler.compile(ast);
      expect(fn({ name: 'Alice' }, { locale: 'en-US' })).toBe('Hello Alice');
    });

    it('should handle missing argument', () => {
      const ast = parse('Hello {name}');
      const fn = compiler.compile(ast);
      expect(fn({}, { locale: 'en-US' })).toBe('Hello {name}');
    });

    it('should handle multiple arguments', () => {
      const ast = parse('{greeting} {name}');
      const fn = compiler.compile(ast);
      expect(fn({ greeting: 'Hi', name: 'Bob' }, { locale: 'en-US' })).toBe('Hi Bob');
    });
  });

  describe('Number formatting', () => {
    it('should format number', () => {
      const ast = parse('{count, number}');
      const fn = compiler.compile(ast);
      expect(fn({ count: 1234 }, { locale: 'en-US' })).toBe('1,234');
    });

    it('should format integer', () => {
      const ast = parse('{count, number, integer}');
      const fn = compiler.compile(ast);
      expect(fn({ count: 1234.56 }, { locale: 'en-US' })).toBe('1,235');
    });

    it('should format currency', () => {
      const ast = parse('{price, number, currency}');
      const fn = compiler.compile(ast);
      const result = fn({ price: 100 }, { locale: 'en-US', currency: 'USD' });
      expect(result).toContain('100');
    });

    it('should format percent', () => {
      const ast = parse('{ratio, number, percent}');
      const fn = compiler.compile(ast);
      expect(fn({ ratio: 0.5 }, { locale: 'en-US' })).toBe('50%');
    });
  });

  describe('Plural', () => {
    it('should select one case', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      const fn = compiler.compile(ast);
      expect(fn({ count: 1 }, { locale: 'en-US' })).toBe('1 item');
    });

    it('should select other case', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      const fn = compiler.compile(ast);
      expect(fn({ count: 2 }, { locale: 'en-US' })).toBe('2 items');
    });

    it('should handle zero', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      const fn = compiler.compile(ast);
      expect(fn({ count: 0 }, { locale: 'en-US' })).toBe('0 items');
    });
  });

  describe('Select', () => {
    it('should select male case', () => {
      const ast = parse('{gender, select, male {He} female {She} other {They}}');
      const fn = compiler.compile(ast);
      expect(fn({ gender: 'male' }, { locale: 'en-US' })).toBe('He');
    });

    it('should select female case', () => {
      const ast = parse('{gender, select, male {He} female {She} other {They}}');
      const fn = compiler.compile(ast);
      expect(fn({ gender: 'female' }, { locale: 'en-US' })).toBe('She');
    });

    it('should select other case', () => {
      const ast = parse('{gender, select, male {He} female {She} other {They}}');
      const fn = compiler.compile(ast);
      expect(fn({ gender: 'unknown' }, { locale: 'en-US' })).toBe('They');
    });
  });

  describe('SelectOrdinal', () => {
    it('should format 1st', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const fn = compiler.compile(ast);
      expect(fn({ place: 1 }, { locale: 'en-US' })).toBe('1st');
    });

    it('should format 2nd', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const fn = compiler.compile(ast);
      expect(fn({ place: 2 }, { locale: 'en-US' })).toBe('2nd');
    });

    it('should format 3rd', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const fn = compiler.compile(ast);
      expect(fn({ place: 3 }, { locale: 'en-US' })).toBe('3rd');
    });

    it('should format 4th', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const fn = compiler.compile(ast);
      expect(fn({ place: 4 }, { locale: 'en-US' })).toBe('4th');
    });
  });

  describe('Nested', () => {
    it('should compile nested select and plural', () => {
      const ast = parse('{gender, select, male {He has {count, plural, one {# item} other {# items}}} female {She has {count, plural, one {# item} other {# items}}} other {items}}');
      const fn = compiler.compile(ast);
      expect(fn({ gender: 'male', count: 1 }, { locale: 'en-US' })).toBe('He has 1 item');
      expect(fn({ gender: 'male', count: 2 }, { locale: 'en-US' })).toBe('He has 2 items');
      expect(fn({ gender: 'female', count: 1 }, { locale: 'en-US' })).toBe('She has 1 item');
    });
  });

  describe('Complex messages', () => {
    it('should compile e-commerce message', () => {
      const ast = parse('{name} ordered {count, plural, one {# item} other {# items}} for {price, number, currency}');
      const fn = compiler.compile(ast);
      const result = fn({ name: 'Alice', count: 3, price: 99.99 }, { locale: 'en-US', currency: 'USD' });
      expect(result).toContain('Alice');
      expect(result).toContain('3 items');
      expect(result).toContain('99.99');
    });
  });
});
