/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { parse } from '../../src/icu/parser';
import { validate, ValidationError } from '../../src/icu/validator';

describe('ICU MessageFormat Validator', () => {
  describe('Valid messages', () => {
    it('should validate simple text', () => {
      const ast = parse('Hello world');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate simple argument', () => {
      const ast = parse('Hello {name}');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate multiple arguments', () => {
      const ast = parse('{greeting} {name}');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate plural with other case', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate select with other case', () => {
      const ast = parse(
        '{gender, select, male {He} female {She} other {They}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate selectordinal with other case', () => {
      const ast = parse(
        '{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate nested structures', () => {
      const ast = parse(
        '{gender, select, male {{count, plural, one {# item} other {# items}}} female {{count, plural, one {# item} other {# items}}} other {items}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });
  });

  describe('Argument validation', () => {
    it('should collect argument names', () => {
      const ast = parse('Hello {name}, you have {count} messages');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate formatted arguments', () => {
      const ast = parse('{count, number} items');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate arguments with styles', () => {
      const ast = parse('{price, number, currency}');
      expect(() => validate(ast)).not.toThrow();
    });
  });

  describe('Plural validation', () => {
    it('should require other case by default', () => {
      const ast = parse('{count, plural, one {# item}}');
      expect(() => validate(ast)).toThrow(ValidationError);
      expect(() => validate(ast)).toThrow("must have an 'other' case");
    });

    it('should allow missing other case with option', () => {
      const ast = parse('{count, plural, one {# item}}');
      expect(() => validate(ast, { requireOtherCase: false })).not.toThrow();
    });

    it('should validate all CLDR plural forms', () => {
      const ast = parse(
        '{count, plural, zero {no items} one {# item} two {# items} few {# items} many {# items} other {# items}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should reject invalid plural cases', () => {
      const ast = parse('{count, plural, invalid {text} other {text}}');
      expect(() => validate(ast)).toThrow(ValidationError);
      expect(() => validate(ast)).toThrow("Invalid plural case 'invalid'");
    });

    it('should validate nested plurals', () => {
      const ast = parse(
        '{outer, plural, one {{inner, plural, one {#} other {#}}} other {{inner, plural, one {#} other {#}}}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });
  });

  describe('Select validation', () => {
    it('should require other case by default', () => {
      const ast = parse('{gender, select, male {He}}');
      expect(() => validate(ast)).toThrow(ValidationError);
      expect(() => validate(ast)).toThrow("must have an 'other' case");
    });

    it('should allow missing other case with option', () => {
      const ast = parse('{gender, select, male {He}}');
      expect(() => validate(ast, { requireOtherCase: false })).not.toThrow();
    });

    it('should allow any case names', () => {
      const ast = parse(
        '{status, select, active {Active} inactive {Inactive} pending {Pending} other {Unknown}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate nested selects', () => {
      const ast = parse(
        '{outer, select, a {{inner, select, x {text} other {text}}} other {{inner, select, y {text} other {text}}}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });
  });

  describe('SelectOrdinal validation', () => {
    it('should require other case by default', () => {
      const ast = parse('{place, selectordinal, one {#st}}');
      expect(() => validate(ast)).toThrow(ValidationError);
      expect(() => validate(ast)).toThrow("must have an 'other' case");
    });

    it('should allow missing other case with option', () => {
      const ast = parse('{place, selectordinal, one {#st}}');
      expect(() => validate(ast, { requireOtherCase: false })).not.toThrow();
    });

    it('should validate all CLDR ordinal forms', () => {
      const ast = parse(
        '{place, selectordinal, zero {#th} one {#st} two {#nd} few {#rd} many {#th} other {#th}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should reject invalid ordinal cases', () => {
      const ast = parse('{place, selectordinal, invalid {text} other {text}}');
      expect(() => validate(ast)).toThrow(ValidationError);
      expect(() => validate(ast)).toThrow(
        "Invalid selectordinal case 'invalid'",
      );
    });
  });

  describe('Nesting depth validation', () => {
    it('should allow reasonable nesting', () => {
      const ast = parse(
        '{a, select, x {{b, select, y {{c, select, z {text} other {text}}} other {text}}} other {text}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should reject excessive nesting by default', () => {
      const message =
        '{a, select, x {{b, select, y {{c, select, z {{d, select, w {{e, select, v {{f, select, u {{g, select, t {{h, select, s {{i, select, r {{j, select, q {{k, select, p {text} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}} other {text}}';
      expect(() => parse(message)).toThrow(/depth/i);
    });

    it('should allow custom max depth', () => {
      const ast = parse(
        '{a, select, x {{b, select, y {text} other {text}}} other {text}}',
      );
      expect(() => validate(ast, { maxDepth: 1 })).toThrow(ValidationError);
      expect(() => validate(ast, { maxDepth: 2 })).not.toThrow();
    });
  });

  describe('Complex real-world validation', () => {
    it('should validate e-commerce message', () => {
      const ast = parse(
        '{gender, select, male {He} female {She} other {They}} ordered {itemCount, plural, one {# item} other {# items}} for {price, number, currency}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate notification message', () => {
      const ast = parse(
        '{senderGender, select, male {He sent} female {She sent} other {They sent}} you {count, plural, one {a message} other {# messages}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate calendar reminder', () => {
      const ast = parse(
        'You have {count, plural, zero {no meetings} one {# meeting} other {# meetings}} on {date, date, long}',
      );
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate social media post', () => {
      const ast = parse(
        '{name} and {count, plural, zero {no one else} one {# other person} other {# other people}} liked this',
      );
      expect(() => validate(ast)).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should validate empty message', () => {
      const ast = parse('');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate message with only arguments', () => {
      const ast = parse('{a}{b}{c}');
      expect(() => validate(ast)).not.toThrow();
    });

    it('should validate deeply nested mixed constructs', () => {
      const ast = parse(
        '{a, plural, one {{b, select, x {{c, plural, one {#} other {#}}} other {text}}} other {text}}',
      );
      expect(() => validate(ast)).not.toThrow();
    });
  });
});
